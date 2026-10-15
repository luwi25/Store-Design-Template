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

The `.github/workflows/pages.yml` workflow publishes only `public/`. On GitHub, enable Settings > Pages > GitHub Actions. This repository is public and GitHub Pages publishes the browser-only build. Repository source and default artwork are public; device-only user edits are not included.

Expected site URL once deployment succeeds: https://luwi25.github.io/Store-Design-Template/

## Checks

`npm install`, then `npm test` verifies IndexedDB persistence/conflicts/recovery/image cleanup and real model inference through bundled WebAssembly. `python build_pages.py` builds the publishing artifact.

## Third-party components

ONNX Runtime Web: https://github.com/microsoft/onnxruntime (MIT, bundled license in vendor/ONNX-RUNTIME-LICENSE).
U2Netp: https://github.com/xuebinqin/U-2-Net (Apache-2.0, bundled license in vendor/U2NET-LICENSE); ONNX model distribution: https://github.com/danielgatis/rembg/releases/tag/v0.0.0.


## Install on a phone
Android: open the site in Chrome and tap Install app (or use the browser menu). iPhone/iPad: open in Safari, tap Share, Add to Home Screen, then Add. This is a home-screen web app; no APK or app-store download is required.

The first online visit downloads approximately 71 MB of app files, templates and background-removal files. Offline use is ready after that download completes; the installation help shows readiness. Changes stay in IndexedDB. Export a backup before installing if you already have edits: some platforms use separate storage for the installed app. Updates wait until old app windows close, avoiding interruption of edits.

Phones have Preview, Templates, Products and Settings navigation, larger touch controls, safe-area spacing, mobile dialogs and a product picker for small poster cards. Desktop layout and print output use the original templates. Run node mobile-review.cjs after building to check mobile navigation, installation wiring, icons and offline resource coverage. These automated checks do not replace a physical-device visual review.
