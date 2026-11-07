# Local Template Import
Approved scope: standalone upload, detect, edit, preview and save workflow; no deployment.
Files: index.html/style.css for workspace; app.js for browser OCR and editing; core.js for OCR geometry; review.cjs for regression checks.
Steps: test OCR layer extraction; implement it; add upload/progress/cancel, preview and region correction; save in dedicated IndexedDB; test in real browser; provide local link.
No integration into sales, publishing, catalog or print approval. Import library and PNG exports are local experimental artifacts. OCR model downloads require internet on first use.
