"""Weekly sales-driven product sync for Home Express Basak and PesoPlus
Mambaling.

Pulls last week's sales from the UBEST Store Catalog API and updates
this repo's defaults/project.json directly -- the GitHub repo is the
single source of truth; there is no local app/server involved.

Every group in every template side is dynamically assigned to whichever
real UBEST department actually ranked into it last week (by units
sold): the biggest-selling open department gets the group with the
most slots, and so on, with the group's own label renamed to match.
This applies uniformly to Home Express's Front (everyday) and
PesoPlus's Front (peso) and Back (pesoBack).

Two exceptions, both on Home Express's Back (homeBack):
  - "Christmas Gift Bundles" (position 0) is a fixed, hand-curated
    section unrelated to weekly sales performance -- never touched.
  - "Best Seller This Season" and "Top Product" (positions 1-2) are a
    cross-category showcase: one top seller per real category,
    store-wide, so they stay varied rather than collapsing into a
    single department like the dynamic groups do.

Then public/ is rebuilt, the test suite runs, and the result is
committed and pushed only if everything passes.

Exit code 0 = synced and pushed (or nothing to do). Non-zero = aborted
before committing anything; see the log file in data/sync_logs/.
"""
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent  # store-design-template-github
DATA = REPO / "data"
LOG_DIR = DATA / "sync_logs"

# Never consider these departments for any sales-driven group, on either
# store -- excluded from both the dynamic department assignment and the
# cross-category showcase pools.
EXCLUDED_DEPARTMENTS = {"Cleaning & Laundry Supplies", "Grocery", "Hygiene"}

# A department's raw catalog name isn't always the best group header for
# the poster -- "UBEST Brand" reads like an internal label rather than a
# merchandising section title. Renamed here, by department name, wherever
# it's dynamically assigned a group on either store/side.
DEPARTMENT_LABEL_OVERRIDES = {
    "UBEST Brand": "Essentials",
    "Stationery": "School Supplies",
    "CLOUDNEST Brand": "Tissue and Paper",
}

STORES = {
    "home-express-basak": {
        "prefix": "sales-heb", "front_key": "everyday", "back_key": "homeBack",
        "front_template_id": "home-everyday", "back_template_id": "home-back",
        "back_fixed": {0: "Christmas Gift Bundles"},
        "back_cross_category_positions": (1, 2), "back_cross_category_total": 10,
    },
    "pesoplus-mambaling": {
        "prefix": "sales-ppm", "front_key": "peso", "back_key": "pesoBack",
        "front_template_id": "peso-plus", "back_template_id": "peso-back",
        # Position 0 ("Best Seller in This Season", 4 slots) is a cross-category
        # showcase like Home Express Back's -- one top seller per category, not one
        # department's whole lineup. Its label is set once and never touched again,
        # same as "Best Seller This Season"/"Top Product" never are.
        "front_cross_category_positions": (0,), "front_cross_category_total": 4,
    },
}

LOG_LINES = []


def log(msg):
    line = f"{time.strftime('%Y-%m-%d %H:%M:%S')} {msg}"
    print(line, flush=True)
    LOG_LINES.append(line)


def flush_log(ok, extra=None):
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    path = LOG_DIR / f"{stamp}-{'ok' if ok else 'failed'}.log"
    body = "\n".join(LOG_LINES)
    if extra:
        body += "\n\n" + extra
    path.write_text(body, encoding="utf-8")
    return path


# ---------- UBEST API ----------

def load_api_key():
    base_url = os.environ.get("UBEST_BASE_URL")
    api_key = os.environ.get("UBEST_API_KEY")
    if base_url and api_key:
        return base_url.rstrip("/"), api_key
    if base_url or api_key:
        raise RuntimeError("Both UBEST_BASE_URL and UBEST_API_KEY must be configured.")
    key_file = DATA / "ubest_api_key.json"
    if key_file.exists():
        cfg = json.loads(key_file.read_text(encoding="utf-8"))
        return cfg["base_url"], cfg["api_key"]
    raise RuntimeError(f"No API key at {key_file}. Save {{'base_url':..., 'api_key':...}} there first.")


def api_get(base_url, api_key, path, params=None, attempt=0):
    from urllib.parse import urlencode
    url = f"{base_url}{path}"
    if params:
        url += "?" + urlencode(params)
    req = urllib.request.Request(url, headers={"X-API-Key": api_key})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        if e.code == 429 and attempt < 5:
            retry_after = int(e.headers.get("Retry-After", "2"))
            time.sleep(retry_after + 1)
            return api_get(base_url, api_key, path, params, attempt + 1)
        raise RuntimeError(f"UBEST API {e.code} on {path}: {e.read().decode(errors='replace')}") from e


def api_get_all_pages(base_url, api_key, path, params=None):
    items = []
    page = 1
    while True:
        body = api_get(base_url, api_key, path, {**(params or {}), "limit": 500, "page": page})
        items.extend(body["products"])
        if page >= body["pages"]:
            return items, body
        page += 1


def split_bilingual(s):
    if not s:
        return None, None
    m = re.match(r"^([^㐀-鿿]*?)\s*([㐀-鿿].*)?$", s)
    en = (m.group(1) if m else s).strip() if m else s.strip()
    zh = (m.group(2) or "").strip() if m else ""
    return en or s, zh or None


def fetch_catalog_and_last_week(base_url, api_key, store_id):
    log(f"[{store_id}] fetching catalog...")
    catalog_items, _ = api_get_all_pages(base_url, api_key, f"/stores/{store_id}/products")
    catalog = {p["stockno"]: p for p in catalog_items}
    log(f"[{store_id}] catalog size: {len(catalog)}")

    log(f"[{store_id}] fetching weekly-sales (last 2 weeks)...")
    sales_items, meta = api_get_all_pages(base_url, api_key, f"/stores/{store_id}/weekly-sales", {"weeks": 2})
    weeks = meta["weeks"]
    last_week_idx = len(weeks) - 2
    last_week = weeks[last_week_idx]
    if not last_week.get("complete"):
        log(f"[{store_id}] WARNING: the week picked as 'last week' is not marked complete: {last_week}")

    rows = []
    for s in sales_items:
        units = s["units"][last_week_idx] or 0
        if units <= 0:
            continue
        p = catalog.get(s["stockno"])
        if not p:
            continue
        dept_en, _ = split_bilingual(p.get("department"))
        category_en, _ = split_bilingual(p.get("category"))
        rows.append({
            "stockno": s["stockno"], "name": p["name"], "department": dept_en or "Uncategorized",
            "category": category_en or "Uncategorized",
            "retail_price": p.get("retail_price"), "image_url": p["image_url"], "units": units,
        })
    log(f"[{store_id}] rows with sales last week: {len(rows)}, week: {last_week['week_start']}..{last_week['week_end']}")
    return rows, last_week


# ---------- Selection ----------

def title_case(name):
    words = name.split()
    out = []
    for w in words:
        if any(ch.isdigit() for ch in w) or (w.isupper() and len(w) > 1):
            out.append(w)
        else:
            out.append(w[:1].upper() + w[1:])
    return " ".join(out)


def assign_dynamic_departments(rows, slot_counts, exclude_positions, exclude_departments=()):
    """Ranks all departments by total units sold, then matches the
    biggest-selling department to the open position with the most
    slots, the next-biggest to the next-biggest open position, etc.
    exclude_departments lets a later side (e.g. Back) skip whatever
    departments an earlier side (e.g. Front) already claimed, so the
    same store never shows the same department twice.
    Returns {position: (department_label, items[:that position's slot count])}."""
    dept_totals = defaultdict(float)
    dept_items = defaultdict(list)
    for r in rows:
        if r["department"] in exclude_departments:
            continue
        dept_totals[r["department"]] += r["units"]
        dept_items[r["department"]].append(r)
    ranked_depts = sorted(dept_totals.items(), key=lambda kv: -kv[1])

    open_positions = sorted((i for i in range(len(slot_counts)) if i not in exclude_positions),
                             key=lambda i: -slot_counts[i])
    assignment = {}
    for rank, pos in enumerate(open_positions):
        if rank >= len(ranked_depts):
            break
        dept_name, _ = ranked_depts[rank]
        items = sorted(dept_items[dept_name], key=lambda r: -r["units"])[:slot_counts[pos]]
        assignment[pos] = (dept_name, items)
    return assignment


def select_cross_category_topsellers(rows, count):
    """One top seller per real UBEST category, store-wide, ranked by
    that item's own units -- a variety showcase rather than a single
    department's full lineup."""
    best_per_category = {}
    for r in rows:
        cat = r["category"]
        if cat not in best_per_category or r["units"] > best_per_category[cat]["units"]:
            best_per_category[cat] = r
    return sorted(best_per_category.values(), key=lambda r: -r["units"])[:count]


# ---------- Web image search + enhancement (replaces the UBEST image CDN) ----------
#
# Uses the `ddgs` package (pip install ddgs) to search DuckDuckGo's image
# results -- no account, no API key, no sign-in, no AI model (local or
# cloud) involved at all. Picking the best of several candidates is a
# plain heuristic over size/shape metadata DuckDuckGo already returns,
# not a vision model -- zero cost, zero setup, zero load on this machine.

_IMAGE_SEARCH_COUNT = 0
IMAGE_SEARCH_SOFT_CAP = 150  # the heuristic is cheap/fast now (no AI calls), so this just needs
# to comfortably cover every in-template product in one run, not throttle a slow process

# Domains that reliably carry genuine e-commerce product photos for this
# market -- a small nudge in the heuristic, not a hard filter.
TRUSTED_IMAGE_DOMAINS = ("shopee.ph", "shopee.com", "lazada.com.ph", "lazada.com")
MIN_USABLE_DIMENSION = 150  # smaller than this is almost always an icon/thumbnail, not a product photo


def search_product_image_candidates(query, max_results=5, attempt=0):
    """Returns [{"url", "width", "height", "source"}, ...] from DuckDuckGo
    image search -- the metadata the heuristic picker needs, not just URLs."""
    from ddgs import DDGS
    try:
        results = DDGS().images(query, max_results=max_results, safesearch="moderate")
    except Exception as e:
        if attempt < 2:
            time.sleep(3)
            return search_product_image_candidates(query, max_results, attempt + 1)
        log(f"  image search failed for {query!r}: {e}")
        return []
    candidates = []
    for r in results:
        if not r.get("image"):
            continue
        candidates.append({
            "url": r["image"], "width": r.get("width"), "height": r.get("height"),
            "source": (r.get("source") or "").lower(),
        })
    return candidates


def pick_best_image_heuristic(candidates):
    """No AI at all: scores each candidate by resolution (bigger is
    better, up to a point) and how close to square it is (product photos
    are usually square-ish; a very wide/tall image is more likely a
    banner or an unrelated graphic), with a small bonus for domains that
    reliably carry real e-commerce product photos for this market.
    Returns the chosen url, or None if every candidate is too small to
    trust (falls through to the plain first result in that case)."""
    best_url, best_score = None, -1.0
    for c in candidates:
        try:
            w, h = int(c.get("width") or 0), int(c.get("height") or 0)
        except (TypeError, ValueError):
            w = h = 0
        if w < MIN_USABLE_DIMENSION or h < MIN_USABLE_DIMENSION:
            continue
        aspect_penalty = abs(w - h) / max(w, h, 1)
        score = (w * h) * (1 - min(aspect_penalty, 0.9))
        if any(domain in c["source"] for domain in TRUSTED_IMAGE_DOMAINS):
            score *= 1.3
        if score > best_score:
            best_url, best_score = c["url"], score
    return best_url


def download_and_enhance_image(repo, url, max_dim=560, timeout=30):
    """Downloads a found photo and enhances it with PIL only (no AI
    background removal -- rembg/onnxruntime segfaulted in this
    environment, and a native crash can't be caught and would take down
    the whole unattended run): composite onto white, pad to a clean
    square so photos of different source aspect ratios sit consistently
    on the poster, light autocontrast + sharpen, then thumbnail."""
    from PIL import Image, ImageOps, ImageEnhance
    import io
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read()
    im = Image.open(io.BytesIO(raw))
    im = ImageOps.exif_transpose(im)
    if im.mode in ("P", "RGBA"):
        im = im.convert("RGBA")
        bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
        im = Image.alpha_composite(bg, im).convert("RGB")
    else:
        im = im.convert("RGB")
    side = max(im.size)
    canvas = Image.new("RGB", (side, side), (255, 255, 255))
    canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    canvas = ImageOps.autocontrast(canvas, cutoff=1)
    canvas = ImageEnhance.Sharpness(canvas).enhance(1.15)
    canvas.thumbnail((max_dim, max_dim), Image.LANCZOS)
    buf = io.BytesIO()
    canvas.save(buf, "JPEG", quality=90)
    raw_out = buf.getvalue()
    digest = hashlib.sha256(raw_out).hexdigest()
    path = repo / "defaults" / "images" / f"{digest}.jpg"
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_bytes(raw_out)
    return {"__defaultImage": f"images/{digest}.jpg", "mime": "image/jpeg"}


def find_and_enhance_product_image(repo, name, stockno):
    """Returns (image_marker, source) on success. source is "ddgs-picked"
    when the size/shape heuristic chose a candidate, "ddgs" when every
    candidate was too small to trust and it just took the first result.
    Returns (None, None) when nothing usable was found at all."""
    global _IMAGE_SEARCH_COUNT
    if _IMAGE_SEARCH_COUNT >= IMAGE_SEARCH_SOFT_CAP:
        log(f"  image search soft cap ({IMAGE_SEARCH_SOFT_CAP}) reached this run -- using placeholder for {name!r}")
        return None, None
    _IMAGE_SEARCH_COUNT += 1
    query = f"{name} {stockno}".strip()
    try:
        candidates = search_product_image_candidates(query)
        if not candidates:
            log(f"  no image search results for {query!r}")
            return None, None

        chosen_url = pick_best_image_heuristic(candidates)
        source = "ddgs-picked" if chosen_url else "ddgs"
        if not chosen_url:
            chosen_url = candidates[0]["url"]

        return download_and_enhance_image(repo, chosen_url), source
    except Exception as e:
        log(f"  image search/enhance failed for {query!r}: {e}")
        return None, None


# ---------- Image placeholder (fallback when web search is unavailable or finds nothing) ----------

_PLACEHOLDER_HASH = None


def placeholder_image_marker(repo):
    """Writes (once) a flat placeholder JPEG into defaults/images/ and
    returns its {__defaultImage, mime} marker. Used for brand-new products
    until a future run can backfill the real UBEST photo."""
    global _PLACEHOLDER_HASH
    if _PLACEHOLDER_HASH is None:
        from PIL import Image
        import io
        im = Image.new("RGB", (560, 560), (235, 235, 235))
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=90)
        raw = buf.getvalue()
        _PLACEHOLDER_HASH = hashlib.sha256(raw).hexdigest()
        path = repo / "defaults" / "images" / f"{_PLACEHOLDER_HASH}.jpg"
        path.parent.mkdir(parents=True, exist_ok=True)
        if not path.exists():
            path.write_bytes(raw)
    return {"__defaultImage": f"images/{_PLACEHOLDER_HASH}.jpg", "mime": "image/jpeg"}


# ---------- Upsert directly against the published (dehydrated) state ----------

def upsert_product(repo, state, products_by_id, prefix, stockno, name, price, image_url, template_id):
    """Returns (pid, photo_status). Every product carries a `photoSource`
    status: "ubest-api" (the real catalog photo -- the one true best
    source, since it's a guaranteed-correct match), "claude" (Claude
    picked the best of several web search candidates), "ddgs"
    (DuckDuckGo's first result, no Claude available), or "placeholder".

    Priority each run, cheapest/best first:
      1. A short-timeout attempt at the UBEST API's own image_url, unless
         already sourced from there -- so every product auto-upgrades to
         the authoritative photo the moment that CDN is reachable again,
         not just brand-new ones. Costs ~8s per product while it's down.
      2. If that fails: a fresh web search (ddgs, optionally Claude-picked)
         for anything brand-new, still on the flat placeholder, or
         currently ddgs-sourced with Claude now available to upgrade it.
      3. Otherwise keep whatever photo it already has (claude-sourced, or
         ddgs with no Claude key to improve on it -- no point re-searching
         for no gain).
      4. The flat placeholder, if nothing above produced anything.

    `prefix` keeps each store's sales-driven ids from colliding
    ('sales-heb-' vs 'sales-ppm-')."""
    pid = f"{prefix}-{re.sub(r'[^A-Za-z0-9]+', '-', stockno).strip('-').lower()}"
    existing = products_by_id.get(pid)
    placeholder = placeholder_image_marker(repo)
    current_source = existing.get("photoSource") if existing else None

    image = None
    photo_source = None
    # Reviewed assets are pinned; only the image-review workflow replaces them.
    if existing is not None and current_source == "approved":
        image, photo_source = existing["image"], "approved"
    elif image_url and current_source != "ubest-api":
        try:
            image = download_and_enhance_image(repo, image_url, timeout=8)
            photo_source = "ubest-api"
        except Exception:
            image = None

    if image is None:
        needs_any_photo = existing is None or current_source in (None, "placeholder")
        # "ddgs" (every candidate was too small to trust, so it just took the first
        # result) is always worth retrying -- a later search might turn up a candidate
        # the heuristic can actually size-check.
        needs_picker_upgrade = existing is not None and current_source == "ddgs"
        if needs_any_photo or needs_picker_upgrade:
            image, photo_source = find_and_enhance_product_image(repo, name, stockno)
        elif existing is not None:
            image, photo_source = existing["image"], current_source

    if image is None:
        # A retry that finds nothing must not destroy an existing product photo.
        if existing is not None and existing.get("image"):
            image, photo_source = existing["image"], current_source
        else:
            image, photo_source = placeholder, "placeholder"

    if photo_source == "placeholder":
        photo_status = "placeholder"
    elif photo_source == "ubest-api":
        photo_status = "cached" if photo_source == current_source else "api-sourced"
    else:
        photo_status = "cached" if photo_source == current_source else f"web-sourced-{photo_source}"

    product = {
        "id": pid, "templateId": template_id, "name": title_case(name),
        "price": price if price is not None else 0, "code": stockno, "image": image,
        "photoSource": photo_source,
    }
    if existing is not None:
        existing.update(product)
    else:
        products_by_id[pid] = product
        state["products"].append(product)
    return pid, photo_status


def apply_side(repo, state, products_by_id, prefix, template_key, template_id, rows,
               fixed_positions=None, cross_category_positions=(), cross_category_total=0,
               exclude_departments=()):
    """Fills every group in one template side (e.g. everyday, homeBack,
    peso, pesoBack). Positions not in fixed_positions or
    cross_category_positions get dynamically assigned to a department
    per assign_dynamic_departments, with the group's label renamed to
    match. exclude_departments skips departments an earlier side of the
    same store already claimed, so e.g. PesoPlus's Front and Back never
    both show "Grocery". cross_category_positions share one combined
    top-category pool split across them in rank order -- their label is
    never set here, so it stays whatever it already is (a fixed
    showcase name like "Best Seller This Season"). Fixed positions are
    left completely untouched (slots and label both).
    Returns (entries, departments_used_by_this_side)."""
    fixed_positions = fixed_positions or {}
    tpl = state[template_key]
    slots = tpl["slots"]
    group_names = tpl.get("groupNames") or []
    by_idx = defaultdict(list)
    for i, s in enumerate(slots):
        by_idx[s["group"]].append(i)
    slot_counts = [len(by_idx.get(i, [])) for i in range(len(group_names))]

    entries = []
    departments_used = set()
    exclude = set(fixed_positions) | set(cross_category_positions)
    for pos, (label, items) in assign_dynamic_departments(rows, slot_counts, exclude, exclude_departments).items():
        display_label = DEPARTMENT_LABEL_OVERRIDES.get(label, label)
        group_names[pos] = display_label
        departments_used.add(label)  # raw department name, so exclude_departments matching stays correct
        for idx, item in zip(by_idx.get(pos, []), items):
            pid, photo_status = upsert_product(repo, state, products_by_id, prefix, item["stockno"], item["name"], item["retail_price"], item["image_url"], template_id)
            slots[idx] = {"productId": pid, "group": pos, "discountPercent": 0}
            entries.append((display_label, item["name"], item["units"], photo_status))

    if cross_category_positions:
        picks = select_cross_category_topsellers(rows, cross_category_total)
        cursor = 0
        for pos in cross_category_positions:
            count = slot_counts[pos]
            chunk = picks[cursor:cursor + count]
            cursor += count
            for idx, item in zip(by_idx.get(pos, []), chunk):
                pid, photo_status = upsert_product(repo, state, products_by_id, prefix, item["stockno"], item["name"], item["retail_price"], item["image_url"], template_id)
                slots[idx] = {"productId": pid, "group": pos, "discountPercent": 0}
                entries.append((group_names[pos], item["name"], item["units"], photo_status))

    for pos, label in fixed_positions.items():
        group_names[pos] = label

    tpl["groupNames"] = group_names
    return entries, departments_used


# ---------- Shell helpers ----------

def run(cmd, cwd):
    log(f"$ {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=str(cwd), capture_output=True, text=True,
                             encoding="utf-8", errors="replace", shell=(sys.platform == "win32"))
    if result.stdout.strip():
        log(result.stdout.strip())
    if result.stderr.strip():
        log(result.stderr.strip())
    return result.returncode


def run_tests(repo):
    checks = [
        ["python", "build_pages.py"],
        ["node", "studio-review.cjs"],
        ["node", "studio-review.cjs", "--mobile"],
        ["node", "mobile-review.cjs"],
        ["node", "background-remover-review.cjs"],
        ["node", "default-project-review.cjs"],
        ["npm", "test"],
    ]
    for cmd in checks:
        if run(cmd, repo) != 0:
            return False
    return True


# ---------- Main ----------

def main():
    base_url, api_key = load_api_key()

    project_path = REPO / "defaults" / "project.json"
    project = json.loads(project_path.read_text(encoding="utf-8"))
    state = project["state"]
    products_by_id = {p["id"]: p for p in state["products"]}
    log(f"starting sourceRevision: {project['sourceRevision']}, products: {len(state['products'])}")

    all_entries = []
    last_weeks = {}
    for store_id, cfg in STORES.items():
        rows, last_week = fetch_catalog_and_last_week(base_url, api_key, store_id)
        rows = [r for r in rows if r["department"] not in EXCLUDED_DEPARTMENTS]
        last_weeks[store_id] = last_week
        if len(rows) < 20:
            raise RuntimeError(f"[{store_id}] not enough last-week sales data; aborting without changes.")

        front_entries, front_depts = apply_side(REPO, state, products_by_id, cfg["prefix"], cfg["front_key"], cfg["front_template_id"], rows,
                                                 cross_category_positions=cfg.get("front_cross_category_positions", ()),
                                                 cross_category_total=cfg.get("front_cross_category_total", 0))
        all_entries += [(store_id, "FRONT", *e) for e in front_entries]

        # Back never repeats a department Front already claimed, so the same
        # store doesn't show e.g. "Grocery" on both sides.
        back_entries, _ = apply_side(REPO, state, products_by_id, cfg["prefix"], cfg["back_key"], cfg["back_template_id"], rows,
                                      fixed_positions=cfg.get("back_fixed"),
                                      cross_category_positions=cfg.get("back_cross_category_positions", ()),
                                      cross_category_total=cfg.get("back_cross_category_total", 0),
                                      exclude_departments=front_depts)
        all_entries += [(store_id, "BACK", *e) for e in back_entries]

        referenced = {s["productId"] for s in state[cfg["front_key"]]["slots"]} | {s["productId"] for s in state[cfg["back_key"]]["slots"]}
        kept = [p for p in state["products"] if not p["id"].startswith(f"{cfg['prefix']}-") or p["id"] in referenced]
        pruned = len(state["products"]) - len(kept)
        state["products"] = kept
        if pruned:
            log(f"[{store_id}] pruned {pruned} orphaned {cfg['prefix']}- product(s)")

    placeholder_count = picked_count = ddgs_count = api_count = 0
    tags = {"placeholder": " [placeholder photo]",
            "web-sourced-ddgs-picked": " [new photo -- size/shape heuristic pick]",
            "web-sourced-ddgs": " [new photo -- DuckDuckGo first result]",
            "api-sourced": " [new photo -- real UBEST catalog photo]"}
    for store_id, side, label, name, units, photo_status in all_entries:
        placeholder_count += photo_status == "placeholder"
        picked_count += photo_status == "web-sourced-ddgs-picked"
        ddgs_count += photo_status == "web-sourced-ddgs"
        api_count += photo_status == "api-sourced"
        log(f"  [{store_id}] {side} [{label}] {name} ({units} units){tags.get(photo_status, '')}")
    if api_count:
        log(f"{api_count} product(s) got their real photo straight from the UBEST catalog API -- "
            f"the CDN is reachable for these now.")
    if picked_count:
        log(f"{picked_count} product(s) got a fresh photo chosen by the size/shape heuristic.")
    if ddgs_count:
        log(f"{ddgs_count} product(s) got a fresh photo from DuckDuckGo's first result "
            f"(every candidate was too small for the heuristic to trust) -- will retry next run.")
    if placeholder_count:
        log(f"{placeholder_count} product(s) got a generic placeholder photo (nothing useful found) "
            f"-- rerun later to retry.")

    project["sourceRevision"] += 1
    project_path.write_text(json.dumps(project, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    log(f"wrote defaults/project.json, sourceRevision -> {project['sourceRevision']}, products: {len(state['products'])}")

    if not run_tests(REPO):
        flush_log(False, "Tests failed after updating defaults/project.json. Nothing was committed or "
                          "pushed; the working tree has the attempted change for inspection.")
        log("ABORTED before push: tests failed.")
        sys.exit(1)

    if run(["git", "add", "defaults"], REPO) != 0:
        raise RuntimeError("Could not stage the sales update.")
    diff_check = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=str(REPO))
    if diff_check.returncode == 0:
        log("nothing to commit (defaults snapshot unchanged).")
        flush_log(True)
        return

    if diff_check.returncode != 1:
        raise RuntimeError("Could not inspect staged changes.")
    commit_msg = "Weekly sales sync: " + "; ".join(
        f"{sid} ({lw['week_start']} to {lw['week_end']})" for sid, lw in last_weeks.items())
    if run(["git", "commit", "-m", commit_msg], REPO) != 0:
        raise RuntimeError("Could not commit the sales update; refusing to push.")
    if run(["git", "push", "origin", "main"], REPO) != 0:
        flush_log(False, "git push failed; commit is local only. Resolve and push manually.")
        log("ABORTED: push failed.")
        sys.exit(1)

    log("done: pushed to GitHub.")
    flush_log(True)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        log(f"ERROR: {e}")
        flush_log(False)
        raise
