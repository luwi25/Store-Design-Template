# Local CLI and data flow

Use the installed skill's `scripts/images.py` or the maintained repository copy. All examples assume a shell variable pointing to that script; pass the active repo with `--repo` before the command.

```text
python images.py --repo REPO inventory
python images.py --repo REPO add --store home-express-basak --product PRODUCT_ID --file photo.jpg --source-page https://supplier.example/product --source-type supplier --evidence "Model, capacity and color match" --quality "Full product visible; packaging readable"
python images.py --repo REPO add --store pesoplus-mambaling --product PRODUCT_ID --url https://supplier.example/photo.png --source-page https://supplier.example/product --source-type manufacturer --evidence "Exact model listed"
python images.py --repo REPO enhance --candidate CANDIDATE_ID
python images.py --repo REPO enhance --candidate CANDIDATE_ID --remove-background
python images.py --repo REPO report
python images.py --repo REPO approve --candidate CANDIDATE_ID --reviewer "User" --reason "Confirmed exact model and inspected cutout"
python images.py --repo REPO reject --candidate CANDIDATE_ID --reason "Wrong pack quantity"
python images.py --repo REPO publish --store home-express-basak
```

`add` requires a real product in that store's template slots. It accepts a local file or a public HTTPS image URL (20 MB limit). Use `user-photo` for local photos and record their origin honestly. The source page may be omitted for a user photo. Originals are stored by SHA-256. Enhancement runs in a child process, uses a bounded image size, and records worker failures without touching approved images.

SQLite tables contain candidate metadata and processing states, the current approval per store/product, and decision history. Current approval remains active while a replacement is pending or rejected. `inventory` lists featured products with an approved/candidate/missing library state; existing project images do not imply approval. It also identifies hand-curated Christmas items so bulk operations can exclude them.

The static `data/product_images/review/index.html` page shows original and processed images, evidence, quality notes, and candidate IDs. It is a local comparison artifact. Approval is performed through the assistant/CLI; the page does not run a server or modify SQLite.

`publish` checks approval hashes and product identity snapshots, preserves other product and template fields, writes assets by content hash, saves a backup under `data/product_images/backups/`, and atomically replaces the project JSON. All CLI commands use one exclusive lock to avoid overlapping local library operations. Other editors do not honor this lock, so the publisher also checks whether the source JSON changed before replacement; avoid concurrent external writers during application.

Publishing here means applying approved assets to the repository snapshot. Git commit/push, GitHub Pages deployment, weekly scheduling, and store notifications remain separate actions. A report is never implicitly published.

Installation: the versioned skill is `skills/product-image-finder`. Copy that directory into `~/.codex/skills/product-image-finder` when updating the installed skill. Start a new Codex session if skill discovery has already completed.
