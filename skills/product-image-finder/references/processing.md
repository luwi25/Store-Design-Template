# Repeatable processing commands

Current policy: image work applies only to missing effective template images. Existing references are skipped regardless of approval or quality. Start with `plan --mode replacement`; older existing-image examples below apply only to newly registered candidates for still-missing products.

Commands use `python scripts/images.py --repo REPO COMMAND`. Use the isolated rembg Python for background processing. No command commits or deploys. No progress page or undo feature is added; original-file preservation and existing backups remain.

## Plan and modes

`plan --mode existing` emits JSON for the actual current placed photos, including overrides, source hashes, matching approvals, and template/slot locations. It excludes products placed in group 0 (Christmas Bundles) in either Home Express Back design. Home Express scope includes `everyday`, `homeBack`, `homeCollectionFront`, and `homeCollection`; PesoPlus scope remains `peso` and `pesoBack`. Use `replacement` only for a replacement-search request, or `names` for stock-prefix cleanup. This is an agent workflow plan, not a persistent security boundary: pass the matching mode on subsequent commands. `add` defaults to existing mode and refuses URL downloads unless `--mode replacement` is supplied. Name mode refuses image registration and enhancement. The CLI does not autonomously search or rename products.

## Process a candidate

Register a current source with `add --mode existing --file PATH ...`, preserving the original and its existing source evidence. For an already suitable approved output, reuse it without a new processing pass.

Examples (append the actual candidate ID):

- Clean transparent framing: `enhance --candidate ID --mode existing --focus --sharpen 1.0`
- Remove a clean white background: `enhance --candidate ID --remove-background --focus --sharpen 1.06`
- Crop a visually identified object first: `enhance --candidate ID --crop LEFT TOP RIGHT BOTTOM --target-evidence "Complete product and included lid identified from source" --remove-background --focus`

Crop coordinates are integer pixels in the EXIF-oriented source. A crop must preserve the entire target and included pieces. Use a source-pixel mask correction only when the generic remover cannot safely separate it; register the result as a separate candidate with explicit provenance. Never bypass a rejected integrity check just to increase completion counts.

Focus trims excess transparent space and adds balanced 6% padding without enlarging native pixels. It does not detect the named object, remove props or OCR text. An opaque crop stays opaque unless background removal succeeds. Canvas dimensions may shrink substantially for wide products; the template placement remains unchanged.

## Caching and integrity

Only previously approved candidates with the same store/product identity, source hash and processing fingerprint can be reused by `enhance`. The fingerprint includes crop, target evidence, framing, sharpening, helper source hash, dependency versions and local ONNX model hashes. The cached output hash is checked before reuse. A hit returns `needs-review` and `cache_hit: true`; apply only after confirming that its earlier approval and current product still agree. Legacy approvals without a fingerprint do not qualify for processing-cache reuse, but an unchanged already-approved current image can be reused directly from the plan.

The worker checks background suitability, retained visible pixels, disconnected components, enclosed white regions, foreground coverage and boundary contact. These are conservative heuristics and can reject valid cutouts (for example a genuine hole). Glass, white fabric, packaging, watermarks and semantic completeness still require agent inspection; there is no claim of automated recognition.

## Outcomes and scoped application

Quality skips return JSON with `status: skipped`, `reason_code`, `reason`, and `current_photo_retained: true`. Runtime failures return `status: failed`. Always inspect `status`; a successful command exit does not mean an acceptable image. Missing dependencies and model failures preserve current photos. A skipped/failed candidate cannot be approved.

After inspection, approve only intact candidates. Use `publish --candidate ID ID ...` to apply just this run's current approvals, avoiding unrelated historical approvals. This publisher updates catalog images, not slot overrides; preserve and address explicit overrides using the plan's exact locations. Check the complete before/after project for image-only changes (or name-only changes in names mode).

Use `summary --candidate ID ID ...` for status counts and per-candidate skip/failure reasons. Add planning skips and direct approved-image reuse separately in the final concise summary. Candidate approval is distinct from application and deployment. Do not push until the user requests publishing these results.
