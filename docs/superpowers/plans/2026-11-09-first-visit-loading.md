# First-visit loading

Implement locally; do not push without request. Preserve full-resolution artwork, saved edits, catalog identities, sales sync and approvals.

1. Add startup tests proving published metadata loads without image requests; preserve portable backups by materializing images only on backup export.
2. Resolve published image markers to same-origin immutable URLs instead of base64 downloads. Keep catalog publishing comparisons compatible with those references.
3. Use the existing store/password dialog before database/catalog loading, with the existing store service authentication. Hand off the authenticated choice to the editor without signing in twice.
4. Initialize only the selected legacy template artwork. Lazy-load sidebar/catalog images and avoid hidden store thumbnails. Keep all metadata available for switching stores and editing.
5. Install only essential application files in the service worker. Cache requested images/tools at runtime, retain immutable caches across deployment, and warm optional lightweight files after the editor is ready. Never prefetch the background-removal model/runtime.
6. Verify cold startup, store selection, backups, publishing, template rendering, service-worker update/offline behavior and existing regression checks. Report offline limits accurately: unvisited assets require a connection.
