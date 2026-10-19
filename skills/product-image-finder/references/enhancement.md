# Enhancement contract

Always retain original bytes. Correct orientation and fit the entire image into a consistent canvas with padding. Default processing uses only mild sharpening and never enlarges a low-resolution image. It preserves transparency in PNG output. The helper does not crop opaque backgrounds automatically, because white product edges can be mistaken for background.

The default output fits within 1200 pixels with 6% padding. This is a maximum pixel size, not a claim of 300 DPI detail. Evaluate effective resolution from the product image's printed dimensions. Increasing DPI metadata adds no detail.

Background removal is opt-in (`enhance --remove-background`). Run it in the isolated worker. Check handles, fan blades, transparent containers, glass, fine wires, and product shadows before approval. Missing rembg/model dependencies, timeout, or a native crash must leave the original and previous approved asset intact.

For low-resolution sources, first look for a better original. Real-ESRGAN or another restoration tool may be used as an optional external step if available, but reconstructed details need review. Register the restored file as a new candidate with the original source and processing notes. The bundled helper does not install or execute an upscaler automatically.

Do not generate replacement product shapes, invent packaging text, recolor variants, or change accessory quantities. Approval applies to a specific enhanced file hash. Re-enhancing an approved candidate is disallowed; add a new candidate so the approved version remains reproducible.
