"""One-off: force a fresh web image search for every product currently
used in any template slot, except the 5 Christmas Gift Bundles products
(home-back1-0-0..4), which stay untouched per explicit request.

Unlike the recurring weekly_sync.py (which only searches for a photo
when a product is brand-new or still stuck on the placeholder), this
ignores whatever image a product already has and replaces it with a
fresh search result regardless.

Run manually: python scripts/refresh_all_product_images.py
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import weekly_sync as ws

CHRISTMAS_GIFT_BUNDLE_IDS = {
    "home-back1-0-0", "home-back1-0-1", "home-back1-0-2", "home-back1-0-3", "home-back1-0-4",
}


def main():
    ws.IMAGE_SEARCH_SOFT_CAP = 10_000  # this run is an intentional full refresh, not a weekly top-up

    project_path = ws.REPO / "defaults" / "project.json"
    project = json.loads(project_path.read_text(encoding="utf-8"))
    state = project["state"]
    by_id = {p["id"]: p for p in state["products"]}

    referenced_ids = set()
    for key in ("everyday", "homeBack", "peso", "pesoBack"):
        referenced_ids |= {s["productId"] for s in state[key]["slots"]}
    target_ids = sorted(referenced_ids - CHRISTMAS_GIFT_BUNDLE_IDS)
    ws.log(f"refreshing images for {len(target_ids)} in-template products (excluding 5 Christmas Gift Bundle items)")

    refreshed = failed = 0
    for pid in target_ids:
        p = by_id.get(pid)
        if not p:
            continue
        if p.get("photoSource") == "approved":
            ws.log(f"  [kept approved photo] {p['name']} ({p['code']})")
            continue
        image, source = ws.find_and_enhance_product_image(ws.REPO, p["name"], p["code"])
        if image is not None:
            p["image"] = image
            p["photoSource"] = source
            refreshed += 1
            ws.log(f"  [new photo -- {source}] {p['name']} ({p['code']})")
        else:
            failed += 1
            ws.log(f"  [kept existing photo -- search found nothing usable] {p['name']} ({p['code']})")

    ws.log(f"refreshed {refreshed}/{len(target_ids)} products; {failed} kept their existing photo (no usable result)")

    project["sourceRevision"] += 1
    project_path.write_text(json.dumps(project, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    ws.log(f"wrote defaults/project.json, sourceRevision -> {project['sourceRevision']}")

    if not ws.run_tests(ws.REPO):
        ws.flush_log(False, "Tests failed. Nothing committed/pushed; working tree has the attempted change.")
        ws.log("ABORTED before push: tests failed.")
        sys.exit(1)

    ws.run(["git", "add", "defaults"], ws.REPO)
    import subprocess
    diff_check = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=str(ws.REPO))
    if diff_check.returncode == 0:
        ws.log("nothing to commit.")
        ws.flush_log(True)
        return
    ws.run(["git", "commit", "-m", "Refresh product images from web search (all products except Christmas Gift Bundles)"], ws.REPO)
    if ws.run(["git", "push", "origin", "main"], ws.REPO) != 0:
        ws.flush_log(False, "git push failed; commit is local only.")
        ws.log("ABORTED: push failed.")
        sys.exit(1)
    ws.log("done: pushed to GitHub.")
    ws.flush_log(True)


if __name__ == "__main__":
    main()
