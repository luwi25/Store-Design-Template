---
name: product-image-finder
description: Find, verify, enhance, and maintain approved photos for retail products in Store Design Template. Use for missing product pictures, replacing incorrect photos, or preparing images for weekly promotional posters.
---

# Product Image Finder & Enhancer

Use `C:/Users/Admin/store-design-template-github` as the active project. Do not update the retired flash-sale-studio copy. Resolve the repository from the user's current context if it has moved.

The skill coordinates search and visual review. Its bundled Python helper maintains local records, processes images in isolated workers, and applies approved images to the published project. A search result is a candidate, not an approved product match.

## Workflow

1. Read `references/workflow.md` for CLI commands and the library contract. Run `inventory` to identify featured products and existing approvals. Respect any user-specified product scope; exclude Home Express Christmas Gift Bundles from bulk replacement unless explicitly requested.
2. Reuse approved images keyed by store and product ID. Match an existing SKU only within the same store and confirm its variant. Existing photos have not been approved merely because they are present in the project.
3. Read `references/matching.md`. Try the catalog's exact product image, then manufacturer/supplier listings, then web image search. Use available browsing tools; inspect both listing details and the image. Search public brand/model/variant descriptions before trying an internal stock code. Limit discovery to three query variations and five candidates per product per run; unresolved products enter review rather than retrying indefinitely.
4. Register promising candidates using `add`. Record the source page, actual image URL when available, source type, identity evidence, uncertainty, and quality observations. Do not expose API keys in logs, reports, or evidence. Do not invent source URLs or claim a size/shape score proves identity.
5. Run `enhance`, then inspect original and processed images. Read `references/enhancement.md` before processing. Preserve identity, packaging text, colors, and included accessories. The helper retains originals and isolates Pillow/rembg work in a subprocess with a timeout.
6. Run `report` for a local comparison page. Present uncertain candidates to the user by candidate ID, with what matches and what cannot be verified. Approve only an inspected image version. An explicit user choice or delegated authority to verify exact matches permits `approve`; generic requests to search/enhance do not authorize guessing an ambiguous model. `reject` records the reason without removing the previous approved image.
7. Apply approved image changes with `publish` when the user requests updating the poster/project. This changes image references and photo provenance only. It makes a local project backup, increments the published revision only when something changed, and never commits, pushes, or distributes posters. Use the existing deployment process only when publication is authorized in the session.
8. Report approved/reused, needs-review, and failed counts and the local report path. State processing limitations and whether any project changes were applied.

## Integration boundaries

- Local records and original/candidate images live under `data/product_images/`, already excluded from Git. Approved display assets are copied into `defaults/images/` when applied.
- The existing weekly sync recognizes `photoSource: approved` and preserves those photos. It does not automatically invoke this skill or approve web search results.
- Keep previous photos on download, enhancement, or review failure. Do not replace a usable photo with a placeholder.
- Do not run `refresh_all_product_images.py` as part of this workflow: it intentionally replaces photos without this approval process.
- The current Pages startup replaces saved projects when a newer published revision arrives. Disclose that effect before publishing a new revision unless the user has already accepted it for the current workflow; creating a local review report does not publish a revision.

## Tools

Use `python <skill-directory>/scripts/images.py --repo <repository> <command>`. Run `--help` for arguments. Pillow is required only for processing and candidate validation. Background removal is optional and requires a separately installed rembg/model environment; missing dependencies fail the job and preserve the original.
