# Store monitoring and print approval implementation plan

**Goal:** Shared store activity and simple print requests, with manual Supabase dashboard setup.
**Architecture:** GitHub Pages calls a single Supabase Edge Function. The function verifies store passwords from server secrets and uses private PostgreSQL tables through a service-only RPC. Opaque sessions expire after eight hours. All Stores is the administrator.
**Constraints:** Preserve sales sync, schedules, template artwork, and PDF/PNG downloads. No copies field or version locking. Store requests carry a review preview, optional note, and approve/reject status. Log print initiation, not physical printing. Do not connect to the user's Supabase account.

- [x] Replace the unused Cloudflare draft with an additive PostgreSQL setup script and a single-file Edge Function.
- [x] Integrate remote sign-in, saved-edit events, request overlay and admin dashboard. Keep the feature disabled until explicitly configured.
- [x] Include browser assets in the Pages build and mobile toolbar.
- [x] Write manual setup, activation, password rotation and rollback instructions with exact project URLs.
- [x] Inspect changes for role isolation, retry behavior, secret exposure and unchanged sales automation. No tests requested; no tests added or run.

Ruling: Continue in the existing workspace to preserve the already-started feature files and unrelated user changes. No push or remote deployment in this manual setup task.

Delivery evidence: browser build completed. Browser JS and stripped Edge Function TypeScript parsed. PostgreSQL has not been executed and the end-to-end hosted flow remains unverified until the user completes manual setup. Existing image-skill reference edits and untracked reports/exports were preserved.
