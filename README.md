# Store Design Template

The product image skill is maintained in [skills/product-image-finder/SKILL.md](skills/product-image-finder/SKILL.md).
It finds candidate photos, records identity evidence, creates a local original/enhanced comparison report,
and applies reviewed images without changing prices or slot settings. Its SQLite library and source photos
stay under ignored `data/product_images/`; approved display assets enter `defaults/images/` only when applied.
Weekly syncing and the bulk photo-refresh script preserve products marked `photoSource: approved`.
The skill's Python helper requires Pillow; optional background removal requires rembg and a suitable model.
Run `python skills/product-image-finder/scripts/test_images.py` for offline workflow checks using temporary projects.

Home Express and PesoPlus template editor with independent product discounts, image uploads, browser background removal and print-ready PDF downloads.

## GitHub Pages version: private edits and optional admin publishing

Run `python build_pages.py` to create `public/`. GitHub Actions builds and deploys this folder when Pages is enabled with GitHub Actions as the source.

Edits and product images are saved in IndexedDB in the user's browser. Individual-store editing stays private. All Stores admins can explicitly publish product names, original prices and photos to the shared catalog using a restricted GitHub token. Publishing uploads the listed edits and new photos to this public repository; ordinary saving does not upload them. Other browsers start with the published templates. Clearing site data deletes private edits; use Download backup before clearing data or changing devices. Private browsing may discard saves when the session ends.

### Publish from All Stores

1. Unlock All Stores and edit an existing product's name, original price or photo. These edits update its browser catalog entry and repeated occurrences of the same product. Discounts, text sizes and product placement are not included in publication.
2. Open **Publish changes** in the toolbar (under **More** on mobile). Review the listed changes.
3. Create a fine-grained token in GitHub Settings > Developer settings > Personal access tokens. Select the repository owner, restrict access to **Store-Design-Template**, choose an expiration, and grant **Contents: Read and write**. No workflow or administration permission is needed. Your GitHub account must already have permission to write to the repository.
4. Enter that token in the app's publishing dialog and select **Publish changes**. Never put the token in source files, backups or chat. It is held only during that operation and cleared afterward.
5. The app reports when the commit is saved and links to the deployment. Changes become live after GitHub Pages successfully deploys. Open browsers offer **Published catalog updated**, which opens the existing explicit restore options. Reloaded browsers follow the existing published-revision behavior; a pending publishing draft prevents automatic replacement on startup.

The existing store passwords are view filters, not repository authorization. GitHub enforces write permissions. Photos and catalog changes are committed atomically; concurrent repository updates or conflicting product fields stop publication and retain the pending draft. Matching uses stable product IDs and unique store/stock-code matches, never product names alone. Newly created browser-only products without a published match cannot be published through this catalog-edit flow. **Clear pending list** removes the publishing draft while keeping local edits.

Weekly sales sync keeps its current schedule, rankings and rules. It reads the updated catalog names/photos and continues taking current prices from UBEST. Published manual prices can therefore change in the next sync. Build with `python build_pages.py`, then run `npm run test:catalog` for publishing and editor integration checks using mocked GitHub requests; these checks do not publish real edits.

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


### Published starting project

New browser installations start with the owner-published local project (revision 358): 181 products, product images, template names and settings. The public snapshot is in `defaults/`; it contains no database credentials or database backup history. Existing browser saves and legacy imports take precedence and are never overwritten by this snapshot. Subsequent changes remain in that browser only. Clearing site data removes personal edits; download a backup first.
