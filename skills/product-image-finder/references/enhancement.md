# Enhancement contract

Always retain original bytes. Correct orientation, isolate the verified product object, and fit the complete product into a consistent canvas with balanced padding. Default processing uses only mild sharpening and never enlarges a low-resolution image. It preserves transparency in PNG output. The helper does not crop opaque backgrounds automatically, because white product edges can be mistaken for background.

The default output fits within 1200 pixels with 6% padding. This is a maximum pixel size, not a claim of 300 DPI detail. Evaluate effective resolution from the product image's printed dimensions. Increasing DPI metadata adds no detail.

For the default project workflow, request background removal with `enhance --remove-background`. Reuse an already clean, suitable transparent asset without reprocessing it. Run it in the isolated worker. Check handles, fan blades, transparent containers, glass, fine wires, and product shadows before approval. Missing rembg/model dependencies, timeout, or a native crash must leave the original and previous approved asset intact.

When explicitly requested, use background removal as part of the normal workflow. The worker uses rembg's local u2net model with CPU inference and performs conservative white-background, visible-detail, component-retention and alpha-coverage checks before producing an optimized PNG. Rejected cutouts are intentional skips; keep the existing photo. These heuristics cannot guarantee semantic completeness, especially for white or transparent products. Inspect successful outputs yourself; no user review is needed when delegated, and uncertain outputs are skipped.

For low-resolution sources, first look for a better original. Real-ESRGAN or another restoration tool may be used as an optional external step if available, but reconstructed details need review. Register the restored file as a new candidate with the original source and processing notes. The bundled helper does not install or execute an upscaler automatically.

Do not generate replacement product shapes, invent packaging text, recolor variants, or change accessory quantities. Approval applies to a specific enhanced file hash. Re-enhancing an approved candidate is disallowed; add a new candidate so the approved version remains reproducible.

## External text and background cleanup

Remove only text and branding outside the physical product or packaging: floating supplier logos, captions, stock codes, dimensions, prices, promotional copy, borders and unrelated decoration. Preserve actual product labels, embossed marks, packaging text, colors, handles, accessories, fine edges and transparent or white parts.

Use local rembg for segmentation, then inspect the source and result. The helper does not implement semantic text/logo detection; disconnected captions and logos may survive its mask. Use source-preserving crops or masks to remove those external elements, keeping the complete product and balanced transparent padding. Mask corrections must use original pixels. If external text overlaps the product and removal would require inventing hidden details, retain the undamaged image and record the limitation.

Check alpha edges, product completeness, accessory count and residual external text automatically where feasible, followed by agent visual inspection. No user review is required. If cleanup damages the product, correct the mask from source pixels when reliable; otherwise keep the undamaged image. Do not accept a visibly damaged result merely because heuristic checks passed.

Use mild sharpening and careful framing without invented details, distortion, recoloring or unnecessary upscaling. Save optimized transparent PNGs while retaining sufficient native resolution for their printed size. Preserve original bytes; register each processed version separately with source and cleanup provenance. Reuse suitable finished assets rather than repeatedly processing them.

## Focus on the named product object

Before cropping or segmentation, identify which object matches the product name, original stock/model metadata, verified variant and pack quantity. Use both visual evidence and the product record; a name alone does not prove a match. Do not select an object simply because it is largest or centered. If several objects could be the intended product and the evidence does not resolve them, retain the current photo and record an intentional skip.

Isolate the matched product or complete sold set. Remove unrelated products, background props, scenery, decorative elements and external text. Preserve all included parts, handles, lids, cables, accessories and packaging that belongs to the sold item. For assortments or multipacks, retain the relevant set rather than arbitrarily selecting one piece or color. Do not alter the represented variant or quantity to make framing easier.

Use a source-pixel crop around the complete target with a small safety margin before local rembg processing when it helps exclude other objects. Then inspect and refine the mask using original pixels: rembg is not name-aware and may retain unrelated objects or erase white/transparent parts. Never bypass completeness checks by treating missing product parts as background. If unrelated content overlaps the target and removal would require reconstructing hidden details, keep the undamaged image or find a reliable alternative.

After segmentation, crop excess transparent space to the complete foreground bounds, leaving approximately 6% balanced padding on each side. Include fine protrusions and all verified accessories in those bounds. Center the product without stretching, changing its aspect ratio, clipping edges, or enlarging it beyond native resolution merely to fill a canvas. The goal is a larger, clearer product within its existing template image area; do not resize or move template cards.

Inspect the final transparent PNG against light and contrasting backgrounds for clipped edges, halos, lost white or transparent parts, residual props and unintended text. Apply mild sharpening only after confirming the mask is intact. Record the selected target, crop and mask operations in provenance and count successful crops as object-focused in the summary. These are agent-directed processing steps; the existing helper does not automatically recognize the named object or perform semantic cropping. Keep the original and skip uncertain or damaged outputs without requesting manual review.
