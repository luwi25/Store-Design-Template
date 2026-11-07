# Template Import — local test feature

Open http://127.0.0.1:8767/ while the local server is running.
Restart it from this directory with:

    python serve.py

Upload a JPG, PNG or WebP. Browser OCR detects text; a light-background card detector proposes product image regions. Select regions to edit text, size, colors, position or replacement image. Add text/image region lets you drag a rectangle for missed regions. Save draft stores only in the separate store-template-import-v1 IndexedDB database. Download PNG exports at original image dimensions.

Tesseract.js 6.0.1 and its recognition models are loaded from a CDN. Internet is required on first use. Recognition runs in the browser; no Codex call or paid model API is used. The original source image is retained.

Limits: fonts are approximated using Arial when a text layer is edited. Existing artwork stays untouched until edited; covering text on a gradient is not automatic background reconstruction. Card detection targets light rectangular panels and can miss or over-detect cards. Check outlines, labels and prices. Remove region removes its edit layer and reveals original artwork. Imported drafts do not enter the production template list, catalog, sales sync, print approval or publication system in this first local version.

Verification: node review.cjs. Browser checks use Playwright installed in %TEMP%/template-import-browser-check, Edge, a running local server, and the supplied Felcon source posters.


Catalog photos: select an image region, search by name or stock code, and choose a result. Save draft retains the selected photo. This reads the repository defaults/project.json, not unsaved edits from another browser. Missing photos are disabled. Only the selected image region changes.
