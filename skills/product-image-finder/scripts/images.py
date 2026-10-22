"""Local product image review library. No automatic search, approval, or Git push."""
import argparse
import contextlib
import datetime as dt
import hashlib
import html
import io
import json
import re
import importlib.metadata
import os
from pathlib import Path
import sqlite3
import subprocess
import sys
import urllib.request
from urllib.parse import urlparse
import uuid

STORES = {
    'home-express-basak': ('everyday', 'homeBack', 'homeCollectionFront', 'homeCollection'),
    'pesoplus-mambaling': ('peso', 'pesoBack'),
}
MAX_BYTES = 20 * 1024 * 1024
PROCESSING_VERSION = 2
MODES = ("existing", "replacement", "names")


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def sha(data):
    return hashlib.sha256(data).hexdigest()


def read_project(repo):
    raw = (repo / 'defaults/project.json').read_bytes()
    project = json.loads(raw)
    if not isinstance(project.get('state', {}).get('products'), list):
        raise ValueError('Invalid project: state.products is missing.')
    return raw, project


def product_in_store(project, store, pid):
    state = project['state']
    if not any(s.get('productId') == pid for key in STORES[store]
               for s in state.get(key, {}).get('slots', [])):
        raise ValueError('Product is not placed in this store. Refresh inventory.')
    matches = [p for p in state['products'] if p['id'] == pid]
    if len(matches) != 1:
        raise ValueError('Product ID must identify exactly one catalog product.')
    return matches[0]


def identity(product):
    return json.dumps({k: product.get(k) for k in ('id', 'code', 'name')}, sort_keys=True)


def curated_product_ids(state, store):
    keys = ('homeBack', 'homeCollection') if store == 'home-express-basak' else ('homeBack',)
    return {slot.get('productId') for key in keys
            for slot in state.get(key, {}).get('slots', []) if slot.get('group') == 0}


def db_open(root):
    db = sqlite3.connect(root / 'library.sqlite3')
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA foreign_keys=ON')
    db.executescript('''
        CREATE TABLE IF NOT EXISTS candidates (
          id TEXT PRIMARY KEY, store TEXT NOT NULL, product TEXT NOT NULL,
          identity TEXT NOT NULL, name TEXT NOT NULL, source_page TEXT,
          image_url TEXT, source_type TEXT NOT NULL, evidence TEXT NOT NULL,
          quality TEXT NOT NULL, original TEXT NOT NULL, original_hash TEXT NOT NULL,
          enhanced TEXT, enhanced_hash TEXT, processing TEXT,
          status TEXT NOT NULL, error TEXT, created TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS approvals (
          store TEXT NOT NULL, product TEXT NOT NULL, candidate TEXT NOT NULL
          REFERENCES candidates(id), hash TEXT NOT NULL, reviewer TEXT NOT NULL,
          reason TEXT NOT NULL, created TEXT NOT NULL, PRIMARY KEY(store,product));
        CREATE TABLE IF NOT EXISTS decisions (
          id INTEGER PRIMARY KEY, candidate TEXT NOT NULL REFERENCES candidates(id),
          decision TEXT NOT NULL, reviewer TEXT, reason TEXT NOT NULL, created TEXT NOT NULL);
    ''')
    return db


def candidate(db, cid):
    row = db.execute('SELECT * FROM candidates WHERE id=?', (cid,)).fetchone()
    if row is None:
        raise ValueError('Candidate not found.')
    return row


def load_image_bytes(args):
    if args.url:
        if urlparse(args.url).scheme != 'https':
            raise ValueError('Image downloads require HTTPS.')
        request = urllib.request.Request(args.url, headers={'User-Agent': 'StoreDesignImageReview/1.0'})
        with urllib.request.urlopen(request, timeout=30) as response:
            if urlparse(response.geturl()).scheme != 'https':
                raise ValueError('Refusing a redirect away from HTTPS.')
            raw = response.read(MAX_BYTES + 1)
    else:
        with Path(args.file).open('rb') as handle:
            raw = handle.read(MAX_BYTES + 1)
    if not raw or len(raw) > MAX_BYTES:
        raise ValueError('Choose an image smaller than 20 MB.')
    from PIL import Image
    with Image.open(io.BytesIO(raw)) as image:
        if image.format not in ('JPEG', 'PNG', 'WEBP'):
            raise ValueError('Use a PNG, JPEG, or WebP image.')
        if image.width * image.height > 25_000_000:
            raise ValueError('Image exceeds 25 megapixels; resize a copy first.')
        extension = {'JPEG': 'jpg', 'PNG': 'png', 'WEBP': 'webp'}[image.format]
        image.verify()
    return raw, extension


def has_missing_placement(project, store, pid):
    """Only empty effective photos qualify; present references are never reprocessed."""
    state = project['state']
    product = product_in_store(project, store, pid)
    if pid in curated_product_ids(state, store):
        return False
    return any(s.get('productId') == pid and not (s.get('image') or product.get('image'))
               for key in STORES[store] for s in state.get(key, {}).get('slots', []))


def add(args, repo, root, db):
    _, project = read_project(repo)
    product = product_in_store(project, args.store, args.product)
    if not has_missing_placement(project, args.store, args.product):
        return {'status': 'skipped', 'reason_code': 'existing_image_or_excluded', 'current_photo_retained': True}
    if args.source_type != 'user-photo' and not args.source_page:
        raise ValueError('Provide the source product page for a web candidate.')
    if args.source_page and urlparse(args.source_page).scheme not in ('http', 'https'):
        raise ValueError('Source page must be an HTTP(S) URL.')
    if args.mode == 'names':
        raise ValueError('Name-only mode does not register images.')
    if args.mode == 'existing' and args.url:
        raise ValueError('Existing-image mode cannot download replacements.')
    raw, extension = load_image_bytes(args)
    digest = sha(raw)
    path = root / 'originals' / f'{digest}.{extension}'
    path.parent.mkdir(exist_ok=True)
    path.write_bytes(raw)
    cid = uuid.uuid4().hex[:16]
    with db:
        db.execute('''INSERT INTO candidates
          (id,store,product,identity,name,source_page,image_url,source_type,evidence,
           quality,original,original_hash,status,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
          (cid, args.store, args.product, identity(product), product['name'], args.source_page,
           args.url, args.source_type, args.evidence, args.quality, str(path.relative_to(root)),
           digest, 'candidate', now()))
    return {'candidate': cid, 'status': 'candidate', 'original': str(path)}


def worker(source, target, remove_background=False, crop=None, focus=False, sharpen=1.1):
    from PIL import Image, ImageOps, ImageEnhance
    with Image.open(source) as image:
        if image.width * image.height > 25_000_000:
            raise ValueError('Image exceeds the processing limit.')
        image = ImageOps.exif_transpose(image).convert('RGBA')
    if crop:
        left, top, right, bottom = crop
        if not (0 <= left < right <= image.width and 0 <= top < bottom <= image.height):
            raise ValueError('SKIP[invalid_crop]: Crop must be within the oriented source image.')
        image = image.crop(crop)
    if remove_background:
        from rembg import remove, new_session
        import numpy as np
        from scipy import ndimage
        before = np.asarray(image)
        # Restrict automatic cutouts to clean, near-white studio backgrounds.
        # Busy scenes and existing transparency need individual assessment.
        if np.mean(before[:, :, 3] < 245) > .02:
            raise ValueError('SKIP[existing_transparency]: Use focus-only on an intact cutout; inspect residual backgrounds separately.')
        rgb = before[:, :, :3]
        white = np.min(rgb, axis=2) > 235
        border = np.concatenate((white[0], white[-1], white[:, 0], white[:, -1]))
        if np.mean(border) < .95:
            raise ValueError('SKIP[complex_background]: Background needs a verified object crop or source-pixel mask.')
        session = new_session('u2net', providers=['CPUExecutionProvider'])
        cutout = remove(image, session=session).convert('RGBA')
        alpha = np.asarray(cutout)[:, :, 3]
        foreground = np.min(rgb, axis=2) < 220
        core = ndimage.binary_erosion(foreground, iterations=1)
        if not core.any() or np.mean(alpha[core] >= 220) < .99:
            raise ValueError('SKIP[detail_loss]: Visible product or packaging pixels were removed or faded.')
        labels, count = ndimage.label(foreground)
        sizes = np.bincount(labels.ravel())
        retained = np.bincount(labels.ravel(), weights=(alpha > 128).ravel(), minlength=len(sizes))
        for label in range(1, count + 1):
            if sizes[label] >= max(12, foreground.size * .0002) and retained[label] / sizes[label] < .98:
                raise ValueError('SKIP[component_loss]: A visible component may be an accessory or fine product part.')
        coverage = np.mean(alpha > 128)
        if not .03 < coverage < .95 or np.mean(alpha < 10) < .05:
            raise ValueError('SKIP[coverage]: Foreground is empty, nearly full, or implausibly small.')
        # White regions enclosed by visible material may be labels or packaging.
        # Retain them conservatively; semantic inspection decides whether they are holes.
        enclosed = ndimage.binary_fill_holes(foreground) & ~foreground
        if enclosed.sum() > 20 and np.mean(alpha[enclosed] >= 220) < .98:
            raise ValueError('SKIP[white_detail_loss]: Enclosed light product or packaging area became transparent.')
        edge = np.concatenate((alpha[0], alpha[-1], alpha[:, 0], alpha[:, -1]))
        if np.mean(edge > 128) > .01:
            raise ValueError('SKIP[edge_contact]: Foreground touches the image boundary; complete object cannot be assured.')
        image = cutout
    if focus:
        bounds = image.getchannel('A').getbbox()
        if not bounds:
            raise ValueError('SKIP[empty_foreground]: No visible product remains.')
        image = image.crop(bounds)
    # No enlargement: the canvas follows the available source resolution.
    image.thumbnail((1056, 1056), Image.Resampling.LANCZOS)
    alpha = image.getchannel('A')
    image = ImageEnhance.Sharpness(image.convert('RGB')).enhance(sharpen).convert('RGBA')
    image.putalpha(alpha)
    side = max(1, round(max(image.size) / .88))
    pad = max(3, round(max(image.size) * .06))
    size = (image.width + 2*pad, image.height + 2*pad) if focus else (side, side)
    canvas = Image.new('RGBA', size, (255, 255, 255, 0))
    canvas.alpha_composite(image, ((size[0]-image.width)//2, (size[1]-image.height)//2))
    canvas.save(target, format='PNG', optimize=True, compress_level=9)


def enhance(args, repo, root, db):
    if args.mode == 'names':
        raise ValueError('Name-only mode cannot process images.')
    row = candidate(db, args.candidate)
    _, project = read_project(repo)
    if not has_missing_placement(project, row['store'], row['product']):
        return {'status': 'skipped', 'reason_code': 'existing_image_or_excluded', 'current_photo_retained': True}
    if row['status'] in ('approved', 'rejected'):
        raise ValueError('Add a new candidate to revise an approved or rejected version.')
    source = root / row['original']
    if sha(source.read_bytes()) != row['original_hash']:
        raise ValueError('Original image hash changed. Register a fresh candidate.')
    if args.crop and not args.target_evidence:
        raise ValueError('A crop requires --target-evidence identifying the complete product/set.')
    versions = {}
    for package in ('Pillow', 'rembg', 'onnxruntime', 'numpy', 'scipy'):
        try:
            versions[package] = importlib.metadata.version(package)
        except importlib.metadata.PackageNotFoundError:
            versions[package] = None
    model_hashes = {}
    if args.remove_background:
        model_root = Path(os.environ.get('U2NET_HOME', str(root / 'models')))
        if model_root.is_dir():
            model_hashes = {str(path.relative_to(model_root)): sha(path.read_bytes()) for path in sorted(model_root.rglob('*.onnx'))}
    options = dict(models=model_hashes, version=PROCESSING_VERSION, remove_background=args.remove_background,
                   crop=args.crop, focus=args.focus, sharpen=args.sharpen, versions=versions,
                   engine_hash=sha(Path(__file__).read_bytes()), target_evidence=args.target_evidence)
    # Only reuse approved processing, never an unreviewed/failed intermediate.
    key = sha(json.dumps({'source': row['original_hash'], 'options': options}, sort_keys=True).encode())
    for cached in db.execute("SELECT * FROM candidates WHERE store=? AND product=? AND identity=? AND status='approved'", (row['store'], row['product'], row['identity'])):
        meta = json.loads(cached['processing'] or '{}')
        if meta.get('cache_key') == key and cached['enhanced']:
            path = root / cached['enhanced']
            if path.is_file() and sha(path.read_bytes()) == cached['enhanced_hash']:
                meta.update(cache_hit=cached['id'], processed_at=now())
                with db:
                    db.execute("UPDATE candidates SET enhanced=?,enhanced_hash=?,processing=?,status='needs-review',error=NULL WHERE id=?", (cached['enhanced'],cached['enhanced_hash'],json.dumps(meta),row['id']))
                return {'candidate': row['id'], 'status': 'needs-review', 'cache_hit': True, 'enhanced': str(path)}
    outdir = root / 'enhanced'
    outdir.mkdir(exist_ok=True)
    temp = outdir / f'{uuid.uuid4().hex}.tmp.png'
    command = [sys.executable, str(Path(__file__).resolve()), '_worker', str(source), str(temp), '--options', json.dumps(options)]
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=args.timeout)
        if result.returncode:
            raise RuntimeError(result.stderr[-1500:])
        raw = temp.read_bytes()
        digest = sha(raw)
        target = outdir / f'{digest}.png'
        os.replace(temp, target)
        options.update(cache_key=key, cache_hit=False, processed_at=now(), upscale=False)
        with db:
            db.execute("UPDATE candidates SET enhanced=?,enhanced_hash=?,processing=?,status='needs-review',error=NULL WHERE id=?", (str(target.relative_to(root)),digest,json.dumps(options),row['id']))
        return {'candidate': row['id'], 'status': 'needs-review', 'cache_hit': False, 'enhanced': str(target)}
    except Exception as exc:
        message = str(exc)
        skip = re.search(r'SKIP\[([a-z_]+)\]: ([^\n]+)', message)
        status = 'skipped' if skip else 'failed'
        reason = skip.group(2) if skip else message
        code = skip.group(1) if skip else 'timeout' if isinstance(exc, subprocess.TimeoutExpired) else 'processing_error'
        with db:
            db.execute('UPDATE candidates SET status=?,error=?,processing=? WHERE id=?', (status,reason,json.dumps(dict(options, reason_code=code)),row['id']))
        return {'candidate': row['id'], 'status': status, 'reason_code': code, 'reason': reason, 'current_photo_retained': True}
    finally:
        temp.unlink(missing_ok=True)


def decide(args, repo, root, db):
    row = candidate(db, args.candidate)
    if args.command == 'approve':
        if row['status'] != 'needs-review' or not row['enhanced']:
            raise ValueError('Only a processed candidate awaiting review can be approved.')
        _, project = read_project(repo)
        if identity(product_in_store(project, row['store'], row['product'])) != row['identity']:
            raise ValueError('Product identity changed. Add a fresh candidate against the current product.')
        if sha((root / row['enhanced']).read_bytes()) != row['enhanced_hash']:
            raise ValueError('Enhanced image changed after processing; cannot approve.')
        with db:
            db.execute('INSERT OR REPLACE INTO approvals VALUES (?,?,?,?,?,?,?)',
                       (row['store'], row['product'], row['id'], row['enhanced_hash'],
                        args.reviewer, args.reason, now()))
            db.execute("UPDATE candidates SET status='approved' WHERE id=?", (row['id'],))
            db.execute('INSERT INTO decisions(candidate,decision,reviewer,reason,created) VALUES (?,?,?,?,?)',
                       (row['id'], 'approved', args.reviewer, args.reason, now()))
    else:
        if row['status'] == 'approved':
            raise ValueError('Approval history is immutable. Approve a replacement instead.')
        with db:
            db.execute("UPDATE candidates SET status='rejected' WHERE id=?", (row['id'],))
            db.execute('INSERT INTO decisions(candidate,decision,reason,created) VALUES (?,?,?,?)',
                       (row['id'], 'rejected', args.reason, now()))
    return {'candidate': row['id'], 'status': 'approved' if args.command == 'approve' else 'rejected'}


def inventory(args, repo, root, db):
    _, project = read_project(repo)
    rows = []
    for store, keys in STORES.items():
        if args.store and args.store != store:
            continue
        ids = set(s.get('productId') for key in keys for s in project['state'].get(key, {}).get('slots', []))
        curated = curated_product_ids(project['state'], store)
        for pid in sorted(ids - {None}):
            p = product_in_store(project, store, pid)
            approved = db.execute('SELECT candidate FROM approvals WHERE store=? AND product=?', (store, pid)).fetchone()
            pending = db.execute("SELECT COUNT(*) FROM candidates WHERE store=? AND product=? AND status NOT IN ('approved','rejected')", (store, pid)).fetchone()[0]
            rows.append({'store': store, 'product': pid, 'name': p['name'], 'code': p.get('code'),
                         'status': 'approved' if approved else 'needs-review' if pending else 'missing',
                         'approved_candidate': approved['candidate'] if approved else None,
                         'existing_photo_source': p.get('photoSource'),
                         'hand_curated': store == 'home-express-basak' and pid in curated})
    return rows


def plan(args, repo, root, db):
    """Read-only scope plan: use actual placed images, including slot overrides."""
    _, project = read_project(repo)
    state = project['state']
    products = {p['id']: p for p in state['products']}
    rows = {}
    excluded = 0
    existing_image_slots = 0
    for store, keys in STORES.items():
        excluded_products = curated_product_ids(state, store)
        for key in keys:
            for index, slot in enumerate(state.get(key, {}).get('slots', [])):
                if slot.get('productId') in excluded_products:
                    excluded += 1
                    continue
                p = products.get(slot.get('productId'))
                if p is None:
                    continue
                photo = slot.get('image') or p.get('image')
                if args.mode != 'names' and photo:
                    existing_image_slots += 1
                    continue
                digest = None
                if isinstance(photo, dict) and '__defaultImage' in photo:
                    name = photo['__defaultImage']
                    if not re.fullmatch(r'images/[a-f0-9]{64}\.(png|jpg|webp|svg)', name):
                        raise ValueError('Invalid default image path')
                    path = repo / 'defaults' / name
                    if path.is_file():
                        digest = sha(path.read_bytes())
                identity_key = (store, p['id'], json.dumps(photo, sort_keys=True))
                if identity_key not in rows:
                    approved = db.execute("SELECT c.id,c.enhanced,c.enhanced_hash FROM approvals a JOIN candidates c ON c.id=a.candidate WHERE a.store=? AND a.product=? AND c.identity=?", (store,p['id'],identity(p))).fetchone()
                    reusable = bool(approved and digest and approved['enhanced_hash'] == digest)
                    rows[identity_key] = dict(store=store, product=p['id'], name=p['name'], code=p.get('code'),
                                              image=photo, source_hash=digest, already_approved=reusable,
                                              approved_candidate=approved['id'] if reusable else None, placements=[])
                rows[identity_key]['placements'].append(dict(template=key, slot=index, override=bool(slot.get('image'))))
    return dict(mode=args.mode, source_revision=project['sourceRevision'], excluded_slots=excluded,
                skipped_existing_image_slots=existing_image_slots,
                search_allowed=args.mode == 'replacement', names_allowed=args.mode == 'names',
                image_policy='missing_only', deployment=False, items=list(rows.values()))


def summary(args, repo, root, db):
    rows = []
    for cid in dict.fromkeys(args.candidate):
        row = candidate(db, cid)
        meta = json.loads(row['processing'] or '{}')
        rows.append(dict(candidate=cid, product=row['product'], name=row['name'], status=row['status'],
                         cache_hit=bool(meta.get('cache_hit')), reason_code=meta.get('reason_code'),
                         reason=row['error']))
    return dict(counts={status: sum(r['status'] == status for r in rows) for status in ('approved','needs-review','skipped','failed','rejected')},
                reused=sum(r['cache_hit'] for r in rows), items=rows, deployed=False)


def report(args, repo, root, db):
    escape = html.escape
    cards = []
    for row in db.execute('SELECT * FROM candidates ORDER BY created DESC'):
        pictures = ''
        for key, label in [('original', 'Original'), ('enhanced', 'Enhanced')]:
            if row[key]:
                path = (root / row[key]).resolve().as_uri()
                pictures += f'<figure><img src="{escape(path, quote=True)}" alt="{label} product photo"><figcaption>{label}</figcaption></figure>'
        cards.append(f'''<article><h2>{escape(row['name'])}</h2><p>{escape(row['store'])} · {escape(row['status'])}</p>
          <code>{escape(row['id'])}</code><div class="photos">{pictures}</div>
          <p><b>Identity evidence:</b> {escape(row['evidence'])}</p>
          <p><b>Quality:</b> {escape(row['quality'])}</p>
          <p><b>Source:</b> {escape(row['source_page'] or 'Local user photo')}</p>
          <p><b>Processing:</b> {escape(row['processing'] or 'Pending')}</p>
          <p>{escape(row['error'] or '')}</p></article>''')
    page = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Product image review</title><style>
      body{font:16px/1.5 system-ui,sans-serif;color:#243447;background:#f7f8fc;margin:24px auto;padding:0 20px;max-width:1100px}
      h1,h2{color:#163b65}article{border:1px solid #dbe4ee;border-radius:12px;background:white;padding:20px;margin:20px 0;overflow-wrap:anywhere}
      .photos{display:flex;gap:16px;flex-wrap:wrap}figure{margin:12px 0;flex:1;min-width:200px}img{width:100%;height:280px;object-fit:contain;background:repeating-conic-gradient(#eee 0% 25%,white 0% 50%) 0/20px 20px}
      figcaption{font-weight:600}code{background:#edf4f8;padding:4px 8px}p{margin:10px 0}
      </style><h1>Product image review</h1><p>Compare the exact model, color, size and included accessories. Tell the assistant which candidate IDs to approve or reject. This page does not save decisions.</p>'''
    path = root / 'review/index.html'
    path.parent.mkdir(exist_ok=True)
    path.write_text(page + ''.join(cards) + ('<p>No candidates yet.</p>' if not cards else '') + '</html>', encoding='utf8')
    return {'report': str(path), 'candidates': len(cards)}


def publish(args, repo, root, db):
    raw, project = read_project(repo)
    approved = db.execute('''SELECT c.*,a.hash AS approved_hash,a.reviewer,a.reason,a.created AS approved_at
      FROM approvals a JOIN candidates c ON c.id=a.candidate''').fetchall()
    changes, assets = [], []
    selected = set(getattr(args, 'candidate', None) or [])
    if selected and not selected.issubset({r['id'] for r in approved}):
        raise ValueError('Selected candidate is not a current approval.')
    for row in approved:
        if selected and row['id'] not in selected:
            continue
        if args.store and args.store != row['store']:
            continue
        # Historical approvals outside the currently placed products are not in scope.
        placed = {s.get('productId') for key in STORES[row['store']]
                  for s in project['state'].get(key, {}).get('slots', [])}
        excluded = curated_product_ids(project['state'], row['store'])
        if row['product'] not in placed or row['product'] in excluded:
            continue
        p = product_in_store(project, row['store'], row['product'])
        if not has_missing_placement(project, row['store'], row['product']):
            continue
        other_store_uses_product = any(
            s.get('productId') == row['product'] for store, keys in STORES.items()
            if store != row['store'] for key in keys
            for s in project['state'].get(key, {}).get('slots', []))
        if other_store_uses_product:
            raise ValueError('This product ID is shared by stores. Give each store a separate catalog product before applying its approved photo.')
        if identity(p) != row['identity']:
            raise ValueError(f"Product identity changed for {row['product']}; review a new candidate.")
        data = (root / row['enhanced']).read_bytes()
        if sha(data) != row['approved_hash']:
            raise ValueError('Approved image hash mismatch; refusing to apply any changes.')
        marker = {'__defaultImage': f"images/{row['approved_hash']}.png", 'mime': 'image/png'}
        provenance = {'candidate': row['id'], 'sourcePage': row['source_page'],
                      'imageUrl': row['image_url'], 'sourceType': row['source_type'],
                      'approvedAt': row['approved_at'], 'sha256': row['approved_hash']}
        if p.get('image') == marker and p.get('photoSource') == 'approved' and p.get('photoApproval') == provenance:
            continue
        p.update(image=marker, photoSource='approved', photoApproval=provenance)
        assets.append((repo / 'defaults' / marker['__defaultImage'], data))
        changes.append(row['product'])
    if not changes:
        return {'changed': [], 'revision': project['sourceRevision']}
    project['sourceRevision'] += 1
    for path, data in assets:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    backup = root / 'backups' / f'{uuid.uuid4().hex}.json'
    backup.parent.mkdir(exist_ok=True)
    backup.write_bytes(raw)
    path = repo / 'defaults/project.json'
    temp = path.with_name(f'.project-{uuid.uuid4().hex}.tmp')
    try:
        temp.write_text(json.dumps(project, ensure_ascii=False, separators=(',', ':')), encoding='utf8')
        if path.read_bytes() != raw:
            raise ValueError('Project changed during publication. Retry after other writers finish.')
        os.replace(temp, path)
    finally:
        temp.unlink(missing_ok=True)
    return {'changed': changes, 'revision': project['sourceRevision'], 'backup': str(backup), 'deployed': False}


def parser():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--repo', type=Path, required=True)
    sub = p.add_subparsers(dest='command', required=True)
    for name in ('inventory', 'publish'):
        cmd = sub.add_parser(name)
        cmd.add_argument('--store', choices=STORES)
        if name == 'publish':
            cmd.add_argument('--candidate', nargs='+', help='Apply only these current approvals.')
    sub.add_parser('plan').add_argument('--mode', choices=MODES, required=True)
    sub.add_parser('summary').add_argument('--candidate', nargs='+', required=True)
    addp = sub.add_parser('add')
    addp.add_argument('--mode', choices=MODES, default='existing')
    addp.add_argument('--store', choices=STORES, required=True)
    addp.add_argument('--product', required=True)
    source = addp.add_mutually_exclusive_group(required=True)
    source.add_argument('--file')
    source.add_argument('--url')
    addp.add_argument('--source-page')
    addp.add_argument('--source-type', choices=('catalog','manufacturer','supplier','web','user-photo'), required=True)
    addp.add_argument('--evidence', required=True)
    addp.add_argument('--quality', default='Not yet assessed')
    en = sub.add_parser('enhance')
    en.add_argument('--mode', choices=MODES, default='existing')
    en.add_argument('--crop', nargs=4, type=int, metavar=('LEFT','TOP','RIGHT','BOTTOM'))
    en.add_argument('--target-evidence', default='')
    en.add_argument('--focus', action='store_true')
    en.add_argument('--sharpen', type=float, choices=(1.0, 1.06, 1.1), default=1.0)
    en.add_argument('--candidate', required=True)
    en.add_argument('--remove-background', action='store_true')
    en.add_argument('--timeout', type=int, default=120)
    for name in ('approve', 'reject'):
        cmd = sub.add_parser(name)
        cmd.add_argument('--candidate', required=True)
        cmd.add_argument('--reason', required=True)
        if name == 'approve':
            cmd.add_argument('--reviewer', required=True)
    sub.add_parser('report')
    return p


def main():
    if len(sys.argv) > 1 and sys.argv[1] == '_worker':
        options = json.loads(sys.argv[sys.argv.index('--options')+1]) if '--options' in sys.argv else {}
        worker(Path(sys.argv[2]), Path(sys.argv[3]), options.get('remove_background', '--remove-background' in sys.argv[4:]), options.get('crop'), options.get('focus', False), options.get('sharpen', 1.0))
        return
    args = parser().parse_args()
    repo = args.repo.resolve()
    read_project(repo)  # Validate before creating any local state.
    root = repo / 'data/product_images'
    root.mkdir(parents=True, exist_ok=True)
    lock = root / '.lock'
    try:
        handle = lock.open('x')
    except FileExistsError:
        raise ValueError('Another image-library command is running. If it crashed, confirm it stopped before removing data/product_images/.lock.')
    try:
        with handle:
            handle.write(str(os.getpid()))
        with contextlib.closing(db_open(root)) as db:
            action = decide if args.command in ('approve', 'reject') else globals()[args.command]
            print(json.dumps(action(args, repo, root, db), ensure_ascii=True, indent=2))
    finally:
        lock.unlink(missing_ok=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'ERROR: {error}', file=sys.stderr)
        sys.exit(1)
