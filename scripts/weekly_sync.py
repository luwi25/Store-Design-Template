"""Weekly sales-driven product sync for Home Express Basak.

Pulls last week's sales from the UBEST Store Catalog API and updates
this repo's defaults/project.json directly -- the GitHub repo is the
single source of truth; there is no local app/server involved. Front
(7 "daily necessities" department groups) and Back (15 "student
supplies and stationery" slots) get refreshed per the Weekly Store
Promotional Poster Guide, then public/ is rebuilt, the test suite
runs, and the result is committed and pushed only if everything passes.

Exit code 0 = synced and pushed (or nothing to do). Non-zero = aborted
before committing anything; see the log file in data/sync_logs/.
"""
import base64
import hashlib
import json
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent  # store-design-template-github
DATA = REPO / "data"
LOG_DIR = DATA / "sync_logs"
STORE_ID = "home-express-basak"

FRONT_GROUP_DEPTS = [
    ("Kitchen & Dining", 6, ["Kitchenware & Tableware", "Cookware"]),
    ("Home Organizers", 3, ["Home Storage & Organization", "Kitchen Storage & Organization"]),
    ("Home Textiles", 6, ["Home Textiles"]),
    ("Household Cleaning", 4, ["Cleaning & Laundry Supplies"]),
    ("Personal Care", 3, ["Hygiene", "Beauty & Fragrance"]),
    ("Hardware & Tools", 4, ["Hardware & Electrical", "Tools"]),
    ("Toys & Party", 4, ["玩具 Toys", "Seasonal & Party"]),
]
BACK_DEPT = "Stationery"
BACK_FIRST_SECTION_NAME = "Back to School Essentials"
MIME_EXT = {"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/svg+xml": "svg"}

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
        rows.append({
            "stockno": s["stockno"], "name": p["name"], "department": dept_en,
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


def select_front(rows):
    selection = []
    for group_idx, (label, count, depts) in enumerate(FRONT_GROUP_DEPTS):
        pool = sorted((r for r in rows if r["department"] in depts), key=lambda r: -r["units"])
        picked = pool[:count]
        log(f"FRONT group {group_idx} '{label}': pool={len(pool)} picked={len(picked)}")
        selection.append({"group": group_idx, "label": label, "items": picked})
    return selection


def select_back_stationery(rows, count=15):
    pool = sorted((r for r in rows if r["department"] == BACK_DEPT), key=lambda r: -r["units"])
    picked = pool[:count]
    log(f"BACK (stationery): pool={len(pool)} picked={len(picked)}")
    return picked


# ---------- Image placeholder (no network image fetch yet -- UBEST's image CDN is down) ----------

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

def upsert_product(repo, products_by_id, stockno, name, price, image_url, template_id):
    """Returns (pid, photo_status). Returning products (same stockno as a
    past run) keep their already-published photo untouched. Brand-new
    products get a flat placeholder -- rerun once UBEST's image CDN is back
    to backfill the real photo for just those."""
    pid = f"sales-heb-{re.sub(r'[^A-Za-z0-9]+', '-', stockno).strip('-').lower()}"
    existing = products_by_id.get(pid)
    if existing is not None:
        image = existing["image"]
        photo_status = "cached"
    else:
        image = placeholder_image_marker(repo)
        photo_status = "placeholder"

    product = {
        "id": pid, "templateId": template_id, "name": title_case(name),
        "price": price if price is not None else 0, "code": stockno, "image": image,
    }
    if existing is not None:
        existing.update(product)
    else:
        products_by_id[pid] = product
    return pid, photo_status


def apply_updates(repo, state, front_selection, back_items):
    products_by_id = {p["id"]: p for p in state["products"]}
    everyday_slots = state["everyday"]["slots"]
    homeback_slots = state["homeBack"]["slots"]

    front_by_group = {}
    for i, s in enumerate(everyday_slots):
        front_by_group.setdefault(s["group"], []).append(i)
    front_log = []
    for grp in front_selection:
        g = grp["group"]
        for idx, item in zip(front_by_group.get(g, []), grp["items"]):
            pid, photo_status = upsert_product(repo, products_by_id, item["stockno"], item["name"],
                                                item["retail_price"], item["image_url"], "home-everyday")
            everyday_slots[idx] = {"productId": pid, "group": g, "discountPercent": 0}
            front_log.append((grp["label"], item["name"], item["units"], photo_status))

    back_by_group = {}
    for i, s in enumerate(homeback_slots):
        back_by_group.setdefault(s["group"], []).append(i)
    back_log = []
    for g in (0, 1, 2):
        chunk = back_items[g * 5:(g + 1) * 5]
        for idx, item in zip(back_by_group.get(g, []), chunk):
            pid, photo_status = upsert_product(repo, products_by_id, item["stockno"], item["name"],
                                                item["retail_price"], item["image_url"], "home-back")
            homeback_slots[idx] = {"productId": pid, "group": g, "discountPercent": 0}
            back_log.append((g, item["name"], item["units"], photo_status))

    names = state["homeBack"].get("groupNames") or ["Christmas Gift Bundles", "Best Seller This Season", "Top Product"]
    names[0] = BACK_FIRST_SECTION_NAME
    state["homeBack"]["groupNames"] = names

    referenced = {s["productId"] for s in everyday_slots} | {s["productId"] for s in homeback_slots}
    kept = [p for p in state["products"] if not p["id"].startswith("sales-heb-") or p["id"] in referenced]
    pruned = len(state["products"]) - len(kept)
    state["products"] = kept
    if pruned:
        log(f"pruned {pruned} orphaned sales-heb product(s) no longer referenced by any slot")

    return front_log, back_log


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
    log(f"starting sourceRevision: {project['sourceRevision']}, products: {len(state['products'])}")

    rows, last_week = fetch_catalog_and_last_week(base_url, api_key, STORE_ID)
    front_selection = select_front(rows)
    back_items = select_back_stationery(rows)
    if any(len(g["items"]) < 1 for g in front_selection) or len(back_items) < 15:
        raise RuntimeError("Not enough last-week sales data to fill every slot; aborting without changes.")

    front_log, back_log = apply_updates(REPO, state, front_selection, back_items)
    placeholder_count = 0
    for label, name, units, photo_status in front_log:
        tag = " [placeholder photo]" if photo_status == "placeholder" else ""
        placeholder_count += photo_status == "placeholder"
        log(f"  FRONT [{label}] {name} ({units} units){tag}")
    for g, name, units, photo_status in back_log:
        tag = " [placeholder photo]" if photo_status == "placeholder" else ""
        placeholder_count += photo_status == "placeholder"
        log(f"  BACK [group {g}] {name} ({units} units){tag}")
    if placeholder_count:
        log(f"{placeholder_count} product(s) got a generic placeholder photo (new this week, "
            f"UBEST image CDN unavailable) -- rerun once the CDN is back to backfill real photos.")

    project["sourceRevision"] += 1
    project_path.write_text(json.dumps(project, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    log(f"wrote defaults/project.json, sourceRevision -> {project['sourceRevision']}, products: {len(state['products'])}")

    if not run_tests(REPO):
        flush_log(False, "Tests failed after updating defaults/project.json. Nothing was committed or "
                          "pushed; the working tree has the attempted change for inspection.")
        log("ABORTED before push: tests failed.")
        sys.exit(1)

    run(["git", "add", "defaults"], REPO)
    diff_check = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=str(REPO))
    if diff_check.returncode == 0:
        log("nothing to commit (defaults snapshot unchanged).")
        flush_log(True)
        return

    commit_msg = f"Weekly sales sync: Home Express Basak ({last_week['week_start']} to {last_week['week_end']})"
    run(["git", "commit", "-m", commit_msg], REPO)
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
