"""Local product image review library. No automatic search, approval, or Git push."""
import argparse
import contextlib
import datetime as dt
import hashlib
import html
import io
import json
import os
from pathlib import Path
import sqlite3
import subprocess
import sys
import urllib.request
from urllib.parse import urlparse
import uuid

STORES = {
    'home-express-basak': ('everyday', 'homeBack'),
    'pesoplus-mambaling': ('peso', 'pesoBack'),
}
MAX_BYTES = 20 * 1024 * 1024


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


def add(args, repo, root, db):
    _, project = read_project(repo)
    product = product_in_store(project, args.store, args.product)
    if args.source_type != 'user-photo' and not args.source_page:
        raise ValueError('Provide the source product page for a web candidate.')
    if args.source_page and urlparse(args.source_page).scheme not in ('http', 'https'):
        raise ValueError('Source page must be an HTTP(S) URL.')
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


def worker(source, target, remove_background=False):
    from PIL import Image, ImageOps, ImageEnhance
    with Image.open(source) as image:
        if image.width * image.height > 25_000_000:
            raise ValueError('Image exceeds the processing limit.')
        image = ImageOps.exif_transpose(image).convert('RGBA')
    if remove_background:
        from rembg import remove, new_session
        import numpy as np
        from scipy import ndimage
        before = np.asarray(image)
        # Restrict automatic cutouts to clean, near-white studio backgrounds.
        # Busy scenes and existing transparency need individual assessment.
        if np.mean(before[:, :, 3] < 245) > .02:
            raise ValueError('Retained: source already contains transparency.')
        rgb = before[:, :, :3]
        white = np.min(rgb, axis=2) > 235
        border = np.concatenate((white[0], white[-1], white[:, 0], white[:, -1]))
        if np.mean(border) < .95:
            raise ValueError('Retained: background is not a clean white studio surface.')
        session = new_session('u2net', providers=['CPUExecutionProvider'])
        cutout = remove(image, session=session).convert('RGBA')
        alpha = np.asarray(cutout)[:, :, 3]
        foreground = np.min(rgb, axis=2) < 220
        core = ndimage.binary_erosion(foreground, iterations=1)
        if not core.any() or np.mean(alpha[core] >= 220) < .99:
            raise ValueError('Retained: cutout removes visible product or packaging detail.')
        labels, count = ndimage.label(foreground)
        sizes = np.bincount(labels.ravel())
        retained = np.bincount(labels.ravel(), weights=(alpha > 128).ravel(), minlength=len(sizes))
        for label in range(1, count + 1):
            if sizes[label] >= max(12, foreground.size * .0002) and retained[label] / sizes[label] < .98:
                raise ValueError('Retained: cutout may remove an accessory or fine component.')
        coverage = np.mean(alpha > 128)
        if not .03 < coverage < .95 or np.mean(alpha < 10) < .05:
            raise ValueError('Retained: cutout foreground coverage is implausible.')
        image = cutout
    # No enlargement: the canvas follows the available source resolution.
    image.thumbnail((1056, 1056), Image.Resampling.LANCZOS)
    alpha = image.getchannel('A')
    image = ImageEnhance.Sharpness(image.convert('RGB')).enhance(1.1).convert('RGBA')
    image.putalpha(alpha)
    side = max(1, round(max(image.size) / .88))
    canvas = Image.new('RGBA', (side, side), (255, 255, 255, 0))
    canvas.alpha_composite(image, ((side-image.width)//2, (side-image.height)//2))
    canvas.save(target, format='PNG', optimize=True, compress_level=9)


def enhance(args, repo, root, db):
    row = candidate(db, args.candidate)
    if row['status'] in ('approved', 'rejected'):
        raise ValueError('Add a new candidate to revise an approved or rejected version.')
    source = root / row['original']
    if sha(source.read_bytes()) != row['original_hash']:
        raise ValueError('Original image hash changed. Register a fresh candidate.')
    outdir = root / 'enhanced'
    outdir.mkdir(exist_ok=True)
    temp = outdir / f'{uuid.uuid4().hex}.tmp.png'
    command = [sys.executable, str(Path(__file__).resolve()), '_worker', str(source), str(temp)]
    if args.remove_background:
        command.append('--remove-background')
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=args.timeout)
        if result.returncode:
            raise RuntimeError('Enhancement worker failed: ' + result.stderr[-1500:])
        raw = temp.read_bytes()
        digest = sha(raw)
        target = outdir / f'{digest}.png'
        os.replace(temp, target)
        with db:
            db.execute('''UPDATE candidates SET enhanced=?,enhanced_hash=?,processing=?,
              status='needs-review',error=NULL WHERE id=?''',
              (str(target.relative_to(root)), digest,
               json.dumps({'remove_background': args.remove_background, 'max_pixels': 1200,
                           'cutout_checks': 'white-background/detail-retention/components/coverage-v1' if args.remove_background else None,
                           'sharpen': 1.1, 'upscale': False, 'processed_at': now()}), row['id']))
        return {'candidate': row['id'], 'status': 'needs-review', 'enhanced': str(target)}
    except Exception as exc:
        with db:
            db.execute("UPDATE candidates SET status='failed',error=? WHERE id=?", (str(exc), row['id']))
        raise
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
        curated = {s.get('productId') for s in project['state'].get('homeBack', {}).get('slots', []) if s.get('group') == 0}
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
    for row in approved:
        if args.store and args.store != row['store']:
            continue
        # Historical approvals outside the currently placed products are not in scope.
        placed = {s.get('productId') for key in STORES[row['store']]
                  for s in project['state'].get(key, {}).get('slots', [])}
        excluded = {s.get('productId') for s in project['state'].get('homeBack', {}).get('slots', [])
                    if s.get('group') == 0}
        if row['product'] not in placed or row['product'] in excluded:
            continue
        p = product_in_store(project, row['store'], row['product'])
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
        sub.add_parser(name).add_argument('--store', choices=STORES)
    addp = sub.add_parser('add')
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
        worker(Path(sys.argv[2]), Path(sys.argv[3]), '--remove-background' in sys.argv[4:])
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
