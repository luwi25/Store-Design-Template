---
name: product-image-finder
description: Find, verify, enhance, and maintain approved photos for retail products in Store Design Template. Use to fill missing photos for products placed in templates; skip every existing template image.
---

# Product Image Finder & Enhancer

Use `C:/Users/Admin/store-design-template-github` as the active project. Do not update the retired flash-sale-studio copy. Resolve the repository from the user's current context if it has moved.

The skill coordinates search and visual review. Its bundled Python helper maintains local records, processes images in isolated workers, and applies approved images to the published project. A search result is a candidate, not an approved product match.

## Missing images only (current policy)

Search, reuse approved assets, and enhance only products whose effective image is empty in a currently placed template slot. An effective image is `slot.image` falling back to the catalog product's `image`, matching the editor. Any existing reference counts as an image regardless of approval, hash, quality, or previous enhancement. Do not inspect, download, crop, remove backgrounds from, sharpen, or replace those existing images. An inaccessible or questionable image reference is not permission to replace it: skip it and report the issue.

Run `plan --mode replacement` first. The planner excludes populated image slots and reports `skipped_existing_image_slots`. If no eligible items remain, report that there are no missing images and stop image work without searches or model calls. Scope is products placed in all six designs: Home Express original Front and Back; Home Express Template #2 Front (`homeCollectionFront`) and Back (`homeCollection`); and PesoPlus Front and Back. Exclude every product in group 0 (Christmas Bundles) in either Home Express Back design and all unplaced catalog entries. An explicitly named product still must have a missing image.

Reuse a verified approved image first for an eligible missing product. Search only if none is suitable, verifying exact brand/model/variant/capacity/color/pack quantity. For newly sourced candidates, identify the matching complete product, remove unrelated content, backgrounds and external text with local rembg, and enhance gently. Preserve physical branding, packaging, accessories, colors and fine details. Read `references/matching.md` and `references/enhancement.md` only for these eligible candidates. Inspect before approval; skip uncertain matches or damaged results without manual review. Preserve originals.

Process each unique store/product once and fill only its missing images. Never overwrite an existing slot override. Recheck the project immediately before applying: if an image was added during the run, skip it. The helper guards registration, enhancement and publication against already populated products. Use `publish --candidate ID ...` for only this batch. Read `references/workflow.md` and `references/processing.md` for commands; this missing-only policy supersedes their older existing-image examples.

## Modes and automation

- **replacement** is the default: find and prepare images only for missing template images.
- **existing** may process a newly registered candidate for a still-missing product without another search. It must not clean photos already displayed in templates; skip this phase when no such candidates remain.
- **names** retains its separate stock-prefix cleanup rules below. The missing-image restriction does not authorize additional name changes.

The weekly replacement -> existing -> names order stays available, but the image phases both obey this missing-only policy. Already populated images require no hash comparison or approval lookup. Name-only work performs no image processing.

No run automatically commits, pushes or deploys. Apply locally when requested; publication requires authorization for the current results. Preserve names, prices, discounts, text settings, placement and layouts during image work. Keep original photos and use specific skip reasons. Report missing products planned, approved images reused, new images applied, backgrounds removed, existing-image slots skipped, uncertain matches skipped and failures. Counts may overlap; state whether results are local or deployed.

## Product name cleanup

In **names** mode, remove a confidently identified leading stock number or SKU from eligible products' displayed names. Example: `5530 Face Foundation` becomes `Face Foundation`. Keep the descriptive name intact; do not shorten it to `Foundation`, rewrite it, or remove meaningful brand or variant information.

Use the original name and existing code/model metadata for image matching before cleanup. Remove a prefix only when existing stock-code metadata or reliable product evidence establishes that it is a stock identifier. Do not strip every leading number: preserve sizes, capacities, dimensions, shades, pack quantities and model numbers that distinguish the product (for example `3-in-1`, `250ml`, `12pcs`, or `9 inch`). Leave ambiguous prefixes unchanged without requesting review.

Apply cleanup only within the same placed-product scope and exclusions as image processing. Update the eligible catalog product's `name` and matching slot `details.name` overrides that still carry that same stock prefix; preserve independently customized descriptive names. Retain stable product IDs, separate code/SKU fields, matching evidence and original files. Record each old/new name in local provenance so it can be restored. Name cleanup can succeed even when an image replacement is skipped.

The image helper's `publish` command changes images only; perform name cleanup as a separate scoped project-data edit, with a backup and a new published revision when data changes. Do not assume the helper strips names. Include a names-cleaned count and any ambiguous-name skips in the final summary. A user request to preserve names or perform image-only changes overrides this default.

## Processing and integration

Use `python <skill-directory>/scripts/images.py --repo <repository> <command>`. Local records, retained originals, caches and isolated processing environments live in ignored `data/product_images/`. Applied assets go to `defaults/images/`. Use the isolated rembg environment, local models, `U2NET_HOME` there and `OMP_NUM_THREADS=2`. Missing dependencies, timeouts and native crashes must leave project photos unchanged.

Cache reuse for eligible candidates requires matching source, crop, settings, dependency/model versions and output hash; a hash alone is not identity approval. Use `summary --candidate ID ...` for this run. Never run `refresh_all_product_images.py` as part of the skill.

The sales sync preserves `photoSource: approved` and operates independently. New published revisions can replace saved browser projects; disclose that effect before publication unless already accepted for the current workflow.
