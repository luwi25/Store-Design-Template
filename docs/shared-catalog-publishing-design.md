# Shared catalog publishing

Status: restricted GitHub token option selected by the owner and implemented.

## Approved behavior

All Stores admins edit product names, original prices and photos and explicitly publish those edits to the shared catalog. Individual-store editing stays private to that browser. Names and images are reused by the existing weekly sales sync; API prices continue to take precedence during the next sync. Sales scheduling, rankings, exclusions, template assignments and image automation are unchanged.

## Findings

- GitHub Pages serves the browser application. There is no deployed authenticated publishing backend in this repository.
- Store passwords currently control a client-side view; they do not authorize repository writes.
- Published catalog and template state are in `defaults/project.json`; images use content-addressed references in `defaults/images/`.
- Product-name and original-price editing updates both catalog records and slot details. Replacing or removing a photo background currently writes a slot image override only. The publishing implementation must explicitly reconcile these overrides.
- `scripts/weekly_sync.py` already matches stock codes within store identity, prefers catalog names/photos, and uses current API prices.
- The Pages workflow already builds and deploys commits to main. Existing browsers check the published source revision at startup. Legacy saved projects without that revision need an explicit update path.

## Authorization options

Recommended minimal infrastructure: an administrator enters a fine-grained GitHub token restricted to this repository with Contents read/write permission. The browser sends authenticated requests directly to GitHub's REST API over HTTPS. The token exists only in memory while publishing and is never included in browser databases, backups, logs, project data, commits or deployed files. Close, completion and failure clear the entered credential. GitHub permissions, not the store selector, authorize writes.

Alternative: a separately hosted backend with real admin authentication and a repository credential stored server-side. This requires choosing a host and configuring the authentication provider and server secrets. The current public store passwords cannot be reused as sufficient write authorization.

The direct GitHub option is selected. No credential should be pasted into a conversation or committed to the repository. The backend alternative is not part of this implementation.

## Publish operation

1. Show Publish changes only in All Stores, with a pending count and clear progress/error messages. Keep the action accessible through the mobile toolbar's More menu.
2. Record a baseline before editing. Track only intentional changes to name, image and original price in All Stores; exclude discounts, text sizes, template names, layouts, placement and unrelated browser data.
3. Show a concrete change summary before sending the update. Handle newly selected products without treating product selection as a catalog rename. Support retry without duplicate publication.
4. Fetch the current main revision and project. Resolve products by stable ID with matching store identity and stock code; use a unique store/code match for restored IDs. Never guess ambiguous matches or conflate identical stock codes across stores. Reject unmatched products with an actionable message instead of silently dropping edits.
5. Perform field-level conflict checks against the editing baseline. Do not upload a stale browser snapshot or overwrite a newer weekly sales result. Preserve unrelated remote updates. Conflicts retain the admin's pending edits for resolution.
6. Validate names, finite nonnegative original prices, and decoded product image types/sizes. Preserve image quality. Hash new raster image bytes, deduplicate them, and retain provenance indicating an admin-provided photo without inventing verification status.
7. Apply changed fields to the matched catalog record and corresponding slot overrides wherever that same record is used in the six published designs. This is necessary because old slot details and images can mask a catalog update. Preserve all discount and typography fields.
8. Commit the updated catalog and new image files together, incrementing sourceRevision. For direct GitHub publication use Git objects and a non-forced branch update, aborting if main advanced. Never delete historical assets or modify workflow files.
9. Report Saved to GitHub separately from Live deployment complete. Link the commit and deployment; deployment failure must not report a live update as successful.
10. After deployment, offer a shared-catalog refresh to already-open clients. Preserve unsaved local work and clearly explain when a restore replaces saved browser edits. Avoid silently replacing an entire edited project just to refresh three catalog fields.

## Expected code boundaries

- A focused publishing module for change tracking, identity resolution, validation, conflict checks and the chosen transport.
- Editor hooks for catalog and slot edits plus the All Stores publish action.
- Build inclusion and responsive action styling following the current navy/teal theme.
- A reader update path that distinguishes owner-published catalog changes from private browser edits.
- No changes to `scripts/weekly_sync.py`, `.github/workflows/weekly-sales-sync.yml` or image automation schedules.

## Required checks

Use fixture projects and mocked transport to check cross-store identity, ambiguous codes, stale-revision conflicts, no unintended fields changed, photo deduplication, invalid-image rejection, atomic publication failures and credential exclusion from backups/storage. Check desktop and mobile action visibility, failure/retry handling, and catalog-to-slot photo propagation. Verify the sales sync script and schedule have no diff. Do not publish real catalog edits as a test.

## References

- https://docs.github.com/en/rest/git/refs
- https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests
