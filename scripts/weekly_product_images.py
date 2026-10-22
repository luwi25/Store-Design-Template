"""Run the full Codex image skill locally; Windows Task Scheduler owns the schedule."""
import datetime as dt
import json
import os
from pathlib import Path
import subprocess
import time

REPO = Path(__file__).resolve().parent.parent
CODEX = Path(os.environ["LOCALAPPDATA"]) / "Programs/OpenAI/Codex/bin/codex.exe"
LOGS = REPO / "data/product_images/scheduled"
HIDDEN = getattr(subprocess, "CREATE_NO_WINDOW", 0)
PROMPT = r"""
Use $product-image-finder on C:\Users\Admin\store-design-template-github.
Read the installed skill at C:\Users\Admin\.codex\skills\product-image-finder\SKILL.md
and its required references. This is an authorized weekly unattended run using
Codex and agent visual inspection. Run these modes sequentially in this exact
order: replacement -> existing -> names. No manual review is required.

Scope every phase to unique store/product identities currently placed in the
six store designs, including Home Express Template #2 Front/Back; exclude Christmas
bundle products in either Home Express Back design and unplaced catalog products. Capture the initial project and original names/model/code evidence.
Plan each phase against the locally updated result of the previous phase.

1. REPLACEMENT: Run plan --mode replacement. Search and enhance ONLY products
with no effective image in their template slots (slot image or catalog fallback).
Skip every populated image, regardless of hash, approval, quality or prior enhancement.
Do not inspect or fetch existing images. If no missing images remain, skip image work.
Reuse verified approved photos first for missing products; otherwise verify exact
product, brand, model, variant, capacity, color and pack quantity before sourcing.
Crop unrelated content, remove backgrounds and external text, and enhance new
candidates gently. Preserve the complete product, branding, packaging and accessories.
Use the existing isolated rembg environment; skip uncertain matches or damaged results.
Apply only to missing images and recheck before application. Preserve all existing
slot overrides. Preserve names during image work.

2. EXISTING: Only finish processing newly registered candidates for products still
missing an image. Never clean or enhance photos already displayed in templates.
Skip this phase if no eligible candidates remain; do not repeat completed processing.

3. NAMES: Remove only confidently verified leading stock-number prefixes, using
original names and code/model evidence retained before image processing. Preserve
descriptive names, brands, sizes, models, variants and quantities. Update eligible
catalog names and matching slot name overrides as the skill directs, preserving
independently customized names. Leave ambiguous prefixes unchanged. Record each
old/new name in local provenance. Do not process images in this phase.

Use scoped candidate application, preserving slot-specific overrides and unrelated
photos. Retain originals and provenance. Preserve all prices, discounts, text
settings, placement and template layouts. Before each application check for
concurrent edits and stop if unexpected changes occurred. Compare final changes
with the initial snapshot: only images, provenance, verified stock-prefix name
cleanup and the published revision may change.

Apply reliable results locally and rebuild public/ with python build_pages.py.
Do not commit, push, deploy, modify workflows, change schedules or skill code.
Do not run tests, contact people, or add a progress page or undo feature.
Report each phase's planned, reused, applied, skipped and failed counts, images
background-removed, names cleaned, specific skip reasons and local result paths.
Distinguish local results from deployed results; do not claim deployment occurred.
"""


def main():
    LOGS.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    status_path = LOGS / f"{stamp}-status.json"

    def status(state, **details):
        status_path.write_text(json.dumps(dict(state=state, updated=dt.datetime.now().isoformat(),
                                              **details), indent=2), encoding="utf-8")

    status("waiting-for-sales-sync")
    try:
        # Also avoid a manually started local sales sync.
        deadline = time.monotonic() + 30 * 60
        while True:
            result = subprocess.run(
                ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command",
                 "$ErrorActionPreference='Stop'; "
                 "(Get-ScheduledTask -TaskName 'FlashSaleStudio Weekly Sync').State.ToString()"],
                capture_output=True, text=True, timeout=30, creationflags=HIDDEN)
            if result.returncode:
                raise RuntimeError("Could not determine sales task state; leaving project untouched.")
            if result.stdout.strip() != "Running":
                break
            if time.monotonic() >= deadline:
                status("skipped", reason="Sales sync still running after 30 minutes.")
                return 0
            time.sleep(30)
        # Leave unpublished edits for the user; do not overwrite another batch.
        dirty = subprocess.run(["git", "status", "--porcelain", "--", "defaults"],
                               cwd=REPO, capture_output=True, text=True, timeout=30,
                               creationflags=HIDDEN)
        if dirty.returncode:
            raise RuntimeError("Could not check project changes.")
        if dirty.stdout.strip():
            status("skipped", reason="Unpublished changes in defaults; preserve them until reviewed/published.")
            return 0
        # Sales sync now runs in GitHub Actions while this computer may be off.
        # Fast-forward only; never discard local edits or rewrite local commits.
        branch = subprocess.run(["git", "branch", "--show-current"], cwd=REPO,
                                capture_output=True, text=True, timeout=30, creationflags=HIDDEN)
        if branch.returncode or branch.stdout.strip() != "main":
            raise RuntimeError("Image automation requires the main branch.")
        for command in (["git", "fetch", "origin", "main"],
                        ["git", "merge", "--ff-only", "origin/main"]):
            result = subprocess.run(command, cwd=REPO, capture_output=True, text=True,
                                    timeout=120, creationflags=HIDDEN)
            if result.returncode:
                raise RuntimeError("Could not fast-forward to the cloud sales update; local edits preserved.")
        if not CODEX.is_file():
            raise RuntimeError("Codex executable is missing.")
        status("running", summary=str(LOGS / f"{stamp}-summary.txt"))
        with (LOGS / f"{stamp}-events.jsonl").open("w", encoding="utf-8") as out, \
                (LOGS / f"{stamp}-errors.log").open("w", encoding="utf-8") as err:
            result = subprocess.run(
                [str(CODEX), "exec", "--cd", str(REPO), "--sandbox", "workspace-write",
                 "-c", 'approval_policy="never"', "--json", "--color", "never",
                 "--output-last-message", str(LOGS / f"{stamp}-summary.txt"), "-"],
                input=PROMPT, text=True, encoding="utf-8", stdout=out, stderr=err,
                creationflags=HIDDEN)
        status("completed" if result.returncode == 0 else "failed",
               exit_code=result.returncode, summary=str(LOGS / f"{stamp}-summary.txt"))
        return result.returncode
    except Exception as exc:
        status("failed", reason=str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
