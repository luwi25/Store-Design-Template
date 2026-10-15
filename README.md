# Store Design Template

Home Express and PesoPlus template editor with independent product discounts, image uploads, browser background removal and print-ready PDF downloads.

## GitHub Pages version: local data only

Run `python build_pages.py` to create `public/`. GitHub Actions builds and deploys this folder when Pages is enabled with GitHub Actions as the source.

Every user's edits and product images are saved in IndexedDB in their own browser. No product photo or saved project is uploaded to GitHub or a shared API. The website only downloads bundled artwork, code and the background-removal model. Other browsers and computers start with the default templates. Clearing site data deletes local edits; use Download backup before clearing data or changing devices. Private browsing may discard saves when the session ends.

Image data is deduplicated as blobs. Two prior saves and a legacy import are retained locally, with unused images reclaimed afterward. Concurrent-tab revision checks protect against overwriting a newer save. Backup export/import stays available.

## Background removal

The Pages version runs ONNX Runtime Web 1.30.0 and the lightweight U2Netp model in a browser worker. Model files are downloaded when first used; inference and image processing stay on the device. This is a smaller model than the desktop Python U2Net model, so cutout quality can differ. Restore original is available. Current Chrome or Edge is recommended for this app's worker/canvas features.

## Local Windows version

The root `index.html` preserves the existing Python/SQLite workflow. Install Python, run `Setup Background Removal.cmd`, then `Start Store Design Template.cmd`. The Pages build substitutes browser-only storage and removes the local API configuration. To bring existing desktop edits to Pages, download a JSON backup from the desktop app and import it into the hosted app. Database files and access tokens are excluded from this repository and the published artifact.

## Deployment

The `.github/workflows/pages.yml` workflow publishes only `public/`. On GitHub, enable Settings > Pages > GitHub Actions. This repository is currently private; the current account plan requires either an eligible paid plan or making this repository public before Pages can be enabled. Changing visibility exposes source and bundled default artwork, not device-only user edits. Visibility must be decided by the repository owner.

Expected site URL once deployment succeeds: https://luwi25.github.io/Store-Design-Template/

## Checks

`npm install`, then `npm test` verifies IndexedDB persistence/conflicts/recovery/image cleanup and real model inference through bundled WebAssembly. `python build_pages.py` builds the publishing artifact.

## Third-party components

ONNX Runtime Web: https://github.com/microsoft/onnxruntime (MIT, bundled license in vendor/ONNX-RUNTIME-LICENSE).
U2Netp: https://github.com/xuebinqin/U-2-Net (Apache-2.0, bundled license in vendor/U2NET-LICENSE); ONNX model distribution: https://github.com/danielgatis/rembg/releases/tag/v0.0.0.
