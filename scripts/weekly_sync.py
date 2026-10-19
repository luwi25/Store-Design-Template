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
        # Position 0 (4 slots) keeps a fixed generic label -- whichever department
        # dynamically wins that position still fills it, only the displayed name is pinned.
        "front_label_overrides": {0: "Best Seller"},
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


def assign_dynamic_departments(rows, slot_counts, exclude_positions):
    """Ranks all departments by total units sold, then matches the
    biggest-selling department to the open position with the most
    slots, the next-biggest to the next-biggest open position, etc.
    Returns {position: (department_label, items[:that position's slot count])}."""
    dept_totals = defaultdict(float)
    dept_items = defaultdict(list)
    for r in rows:
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

def upsert_product(repo, state, products_by_id, prefix, stockno, name, price, template_id):
    """Returns (pid, photo_status). Returning products (same stockno as a
    past run) keep their already-published photo untouched. Brand-new
    products get a flat placeholder -- rerun once UBEST's image CDN is back
    to backfill the real photo for just those. `prefix` keeps each store's
    sales-driven ids from colliding ('sales-heb-' vs 'sales-ppm-')."""
    pid = f"{prefix}-{re.sub(r'[^A-Za-z0-9]+', '-', stockno).strip('-').lower()}"
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
        state["products"].append(product)
    return pid, photo_status


def apply_side(repo, state, products_by_id, prefix, template_key, template_id, rows,
               fixed_positions=None, cross_category_positions=(), cross_category_total=0,
               label_overrides=None):
    """Fills every group in one template side (e.g. everyday, homeBack,
    peso, pesoBack). Positions not in fixed_positions or
    cross_category_positions get dynamically assigned to a department
    per assign_dynamic_departments; cross_category_positions share one
    combined top-category pool split across them in rank order; fixed
    positions are left completely untouched (slots and label both).
    label_overrides pins a position's displayed name regardless of
    which department dynamically wins it -- only the label is fixed,
    the product selection for that position still follows the ranking."""
    fixed_positions = fixed_positions or {}
    label_overrides = label_overrides or {}
    tpl = state[template_key]
    slots = tpl["slots"]
    group_names = tpl.get("groupNames") or []
    by_idx = defaultdict(list)
    for i, s in enumerate(slots):
        by_idx[s["group"]].append(i)
    slot_counts = [len(by_idx.get(i, [])) for i in range(len(group_names))]

    entries = []
    exclude = set(fixed_positions) | set(cross_category_positions)
    for pos, (label, items) in assign_dynamic_departments(rows, slot_counts, exclude).items():
        display_label = label_overrides.get(pos, label)
        group_names[pos] = display_label
        for idx, item in zip(by_idx.get(pos, []), items):
            pid, photo_status = upsert_product(repo, state, products_by_id, prefix, item["stockno"], item["name"], item["retail_price"], template_id)
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
                pid, photo_status = upsert_product(repo, state, products_by_id, prefix, item["stockno"], item["name"], item["retail_price"], template_id)
                slots[idx] = {"productId": pid, "group": pos, "discountPercent": 0}
                entries.append((group_names[pos], item["name"], item["units"], photo_status))

    for pos, label in fixed_positions.items():
        group_names[pos] = label

    tpl["groupNames"] = group_names
    return entries


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
        last_weeks[store_id] = last_week
        if len(rows) < 20:
            raise RuntimeError(f"[{store_id}] not enough last-week sales data; aborting without changes.")

        front_entries = apply_side(REPO, state, products_by_id, cfg["prefix"], cfg["front_key"], cfg["front_template_id"], rows,
                                    label_overrides=cfg.get("front_label_overrides"))
        all_entries += [(store_id, "FRONT", *e) for e in front_entries]

        back_entries = apply_side(REPO, state, products_by_id, cfg["prefix"], cfg["back_key"], cfg["back_template_id"], rows,
                                   fixed_positions=cfg.get("back_fixed"),
                                   cross_category_positions=cfg.get("back_cross_category_positions", ()),
                                   cross_category_total=cfg.get("back_cross_category_total", 0))
        all_entries += [(store_id, "BACK", *e) for e in back_entries]

        referenced = {s["productId"] for s in state[cfg["front_key"]]["slots"]} | {s["productId"] for s in state[cfg["back_key"]]["slots"]}
        kept = [p for p in state["products"] if not p["id"].startswith(f"{cfg['prefix']}-") or p["id"] in referenced]
        pruned = len(state["products"]) - len(kept)
        state["products"] = kept
        if pruned:
            log(f"[{store_id}] pruned {pruned} orphaned {cfg['prefix']}- product(s)")

    placeholder_count = 0
    for store_id, side, label, name, units, photo_status in all_entries:
        tag = " [placeholder photo]" if photo_status == "placeholder" else ""
        placeholder_count += photo_status == "placeholder"
        log(f"  [{store_id}] {side} [{label}] {name} ({units} units){tag}")
    if placeholder_count:
        log(f"{placeholder_count} product(s) got a generic placeholder photo (new this run, "
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

    commit_msg = "Weekly sales sync: " + "; ".join(
        f"{sid} ({lw['week_start']} to {lw['week_end']})" for sid, lw in last_weeks.items())
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
