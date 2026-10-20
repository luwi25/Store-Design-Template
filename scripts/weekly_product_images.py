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
Use $product-image-finder on C:\Users\Admin\store-design-template-github in existing mode.
Read the installed skill at C:\Users\Admin\.codex\skills\product-image-finder\SKILL.md.
This is an authorized weekly unattended run. Use the full skill and agent visual
inspection, with Codex usage authorized. No manual review is required.

Process existing photos only for products currently placed in the four templates;
exclude all Christmas Gift Bundles products. No replacement searches or image
downloads. Reuse suitable unchanged approved photos and cache results. Identify
the matching complete product or sold set; crop unrelated objects, remove the
background and external text, and enhance gently with no invented details.
Preserve branding on the product, packaging and included accessories. Inspect
results against the original. Skip ambiguous or damaged cutouts with specific reasons.
Use the repository's isolated rembg Python and local model files; never install
dependencies or change global environments. Keep existing photos on missing dependencies.

Preserve names, prices, discounts, text settings, placement and template layouts.
Do not run name cleanup. Use scoped candidate application and handle slot overrides
without overwriting unrelated photos. Retain originals and image provenance.
Check that the complete before/after project differs only in images, provenance,
and its published revision. If it changes concurrently, stop before applying.

Apply accepted images locally and rebuild public/ with python build_pages.py.
Do not commit, push, deploy, modify workflows, change schedules or skill code.
Do not run tests. Do not contact other people. Do not add a progress page or undo feature.
Report inspected, reused, applied, skipped and failed counts, specific skip reasons,
and the local result paths. Do not claim local changes are deployed.
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
