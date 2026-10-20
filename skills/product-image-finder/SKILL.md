---
name: product-image-finder
description: Find, verify, enhance, and maintain approved photos for retail products in Store Design Template. Use for missing product pictures, replacing incorrect photos, or preparing images for weekly promotional posters.
---

# Product Image Finder & Enhancer

Use `C:/Users/Admin/store-design-template-github` as the active project. Do not update the retired flash-sale-studio copy. Resolve the repository from the user's current context if it has moved.

The skill coordinates search and visual review. Its bundled Python helper maintains local records, processes images in isolated workers, and applies approved images to the published project. A search result is a candidate, not an approved product match.

## Default scope and image cleanup

For this project, use automatic processing without manual review by default unless the user requests a review queue. Bulk runs cover only products currently placed in the four design templates, excluding Christmas Gift Bundles; ignore unplaced catalog products. An explicitly named product narrows the scope. Automatically apply confidently verified replacements and intact processed versions of suitable approved photos; retain current photos for uncertain matches or damaged cutouts.

Remove backgrounds locally using rembg and clean away brand names, logos, captions, model numbers, prices, promotional text, borders and decoration that are outside the physical product or its packaging. Preserve all branding, labels and text printed on the product or packaging. Read `references/enhancement.md` for cleanup and preservation rules before processing. Never infer that background removal alone removes disconnected text or logos.

Limit changes to product images, image provenance, and the stock-prefix name cleanup described below. Preserve descriptive product names, prices, discounts, text settings, placement and template layouts. Process each unique store/product identity once and reuse its result in all matching slots; share across stores only after verifying identical variants. Preserve original files and source evidence.

## Product object focus

Identify and isolate the object matching the product name and verified identity before enhancing it. Crop unrelated scenery and objects, remove the surrounding background locally, then frame the complete product or sold set with balanced transparent padding. Preserve included accessories, genuine packaging, fine edges and product branding. Follow `references/enhancement.md` under "Focus on the named product object"; rembg alone does not identify the correct object. Retain the current photo when selection or an intact cutout is uncertain. Report object-focused images alongside other processing counts.

## Product name cleanup

As part of the default workflow, remove a confidently identified leading stock number or SKU from eligible products' displayed names. Example: `5530 Face Foundation` becomes `Face Foundation`. Keep the descriptive name intact; do not shorten it to `Foundation`, rewrite it, or remove meaningful brand or variant information.

Use the original name and existing code/model metadata for image matching before cleanup. Remove a prefix only when existing stock-code metadata or reliable product evidence establishes that it is a stock identifier. Do not strip every leading number: preserve sizes, capacities, dimensions, shades, pack quantities and model numbers that distinguish the product (for example `3-in-1`, `250ml`, `12pcs`, or `9 inch`). Leave ambiguous prefixes unchanged without requesting review.

Apply cleanup only within the same placed-product scope and exclusions as image processing. Update the eligible catalog product's `name` and matching slot `details.name` overrides that still carry that same stock prefix; preserve independently customized descriptive names. Retain stable product IDs, separate code/SKU fields, matching evidence and original files. Record each old/new name in local provenance so it can be restored. Name cleanup can succeed even when an image replacement is skipped.

The image helper's `publish` command changes images only; perform name cleanup as a separate scoped project-data edit, with a backup and a new published revision when data changes. Do not assume the helper strips names. Include a names-cleaned count and any ambiguous-name skips in the final summary. A user request to preserve names or perform image-only changes overrides this default.

## Workflow

1. Read `references/workflow.md` for CLI commands and the library contract. Run `inventory` to identify featured products and existing approvals. Respect any user-specified product scope; exclude Home Express Christmas Gift Bundles from bulk replacement unless explicitly requested.
2. Reuse approved images keyed by store and product ID. Match an existing SKU only within the same store and confirm its variant. Existing photos have not been approved merely because they are present in the project.
3. Read `references/matching.md`. Try the catalog's exact product image, then manufacturer/supplier listings, then web image search. Use available browsing tools; inspect both listing details and the image. Search public brand/model/variant descriptions before trying an internal stock code. Limit discovery to three query variations and five candidates per product per run; unresolved products are skipped by default, or enter review only when the user requests it.
4. Register promising candidates using `add`. Record the source page, actual image URL when available, source type, identity evidence, uncertainty, and quality observations. Do not expose API keys in logs, reports, or evidence. Do not invent source URLs or claim a size/shape score proves identity.
5. Run `enhance`, then inspect original and processed images. Read `references/enhancement.md` before processing. Preserve identity, packaging text, colors, and included accessories. The helper retains originals and isolates Pillow/rembg work in a subprocess with a timeout.
6. Run `report` for a local comparison page. In the default automatic mode, record uncertain candidates as skipped without requesting manual review. If the user requests a review queue, present candidate IDs with what matches and what cannot be verified. Approve only an inspected image version. An explicit user choice or delegated authority to verify exact matches permits `approve`; generic requests to search/enhance do not authorize guessing an ambiguous model. `reject` records the reason without removing the previous approved image.
7. Apply approved image changes with `publish` when the user requests updating the poster/project. This changes image references and photo provenance only. It makes a local project backup, increments the published revision only when something changed, and never commits, pushes, or distributes posters. Use the existing deployment process only when publication is authorized in the session.
8. Report reused, replaced, background-removed, external-text-cleaned, skipped and failed counts and the local report path. Distinguish intentional quality skips from processing failures; cleanup counts can overlap. State whether changes are local or deployed.

## Automatic processing without manual review

In the default no-manual-review mode, process only unique store/product IDs currently placed in the four templates, excluding Christmas Gift Bundles. Ignore unplaced catalog products and historical approvals. Reuse suitable approved photos first; do not search again merely to replace a good approved photo.

The user may delegate approval of confidently verified matches and intact cutouts. This does not authorize guessing: skip uncertain identities and retain current photos, recording the reason without requesting a review. Prior explicit user approvals remain valid evidence for reuse; preserve their original evidence and uncertainties.

Run `enhance --remove-background` on a new candidate copied from the approved original. Background removal uses local rembg, preserves the original and creates optimized transparent PNGs. Its conservative checks reject non-white backgrounds, existing transparency, lost visible detail/components, and implausible foreground coverage. A failed check keeps the previously approved photo unchanged. These checks are heuristics, not proof that glass, white edges or fine details survived; inspect accepted outputs before automatic approval and reject doubtful cutouts without interrupting the user.

Register each processed version separately; never modify an approved candidate in place. Apply only approved intact results. Report reused, replaced, background-removed, external-text-cleaned, skipped and failed counts, with failures distinguished from intentional quality skips. Processing a placed product once updates all its slots without editing layout or text settings.

If the system ONNX runtime crashes, use an isolated Python environment under ignored `data/product_images/`; do not alter the app environment. Set `U2NET_HOME` there for local model storage and `OMP_NUM_THREADS=2` to limit CPU use. Run the CLI with that environment's Python. Missing models or native crashes retain current photos.

## Integration boundaries

- Local records and original/candidate images live under `data/product_images/`, already excluded from Git. Approved display assets are copied into `defaults/images/` when applied.
- The existing weekly sync recognizes `photoSource: approved` and preserves those photos. It does not automatically invoke this skill or approve web search results.
- Keep previous photos on download, enhancement, or review failure. Do not replace a usable photo with a placeholder.
- Do not run `refresh_all_product_images.py` as part of this workflow: it intentionally replaces photos without this approval process.
- The current Pages startup replaces saved projects when a newer published revision arrives. Disclose that effect before publishing a new revision unless the user has already accepted it for the current workflow; creating a local review report does not publish a revision.

## Tools

Use `python <skill-directory>/scripts/images.py --repo <repository> <command>`. Run `--help` for arguments. Pillow is required only for processing and candidate validation. Background removal is part of the default project workflow and requires a separately installed rembg/model environment; missing dependencies fail the job and preserve the original.
