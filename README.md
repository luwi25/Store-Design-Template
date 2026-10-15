# Store Design Template

Editable Home Express and PesoPlus flyers with product catalogs, independent discounts, image uploads, local background removal, and print-ready two-copy PDF downloads.

## Run on Windows

Install Python, run `Setup Background Removal.cmd` once, and then open `Start Store Design Template.cmd`.

The app currently requires its local Python service at `127.0.0.1:8766`. Startup generates `db-config.js` and a local access token. SQLite data and images are stored in `data/`, which is excluded from version control.

## Hosting status

This repository copy is prepared for publishing. Hosting configuration is pending selection. GitHub Pages serves static files and cannot run the current Python database or background-removal service. Do not enable Pages for this version without adapting storage or configuring a separately hosted backend.

## Data and backups

Saved projects, access tokens, model downloads and installed dependencies are intentionally excluded. Use Download backup in the existing local app to move saved edits. Repository files contain the supplied default artwork, not the current database.

See LOCAL-DATABASE.md for local operation and recovery details.
