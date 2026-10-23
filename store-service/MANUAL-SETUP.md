# Manual Supabase setup

Use this guide for project **ykgywmirbytzpehsgdad**. You do not need to connect Supabase to Codex or share credentials in chat.

The website stays on GitHub Pages. Supabase stores shared activity records and print requests. Sales sync and its schedules are unchanged. The website connection is now **enabled** for the manually deployed `quick-handler` endpoint. The steps below document setup and recovery.

**Current deployment:** Your function is named `quick-handler`. Keep that name and paste the latest `index.ts` into its editor, then deploy updates. The website endpoint is configured for `quick-handler`; the code also supports the originally planned `store-activity` name. You do not need to create another function or repeat the SQL/secrets setup.

## 1. Create the database tables

### Updating an existing installation: IP addresses for every logged action

If monitoring is already installed, apply this update in this order:

1. Run the entire updated [supabase-setup.sql](supabase-setup.sql) in SQL Editor again. It updates the existing function and preserves your logs and requests.
2. Open the existing Edge Function (displayed as `store-activity`, endpoint `quick-handler`). Replace its code with the updated [index.ts](index.ts), then click **Deploy updates**.
3. Publish the updated website code to GitHub so Admin activity cards display **IP address**.
4. Sign in or perform a logged action to create a new entry. Historical entries are not retroactively updated.

No secret or password changes are needed. The backend records a valid IPv4 or IPv6 address from the request's gateway headers and stores it with each new logged action: sign-in, template opened, saved product edits, print request, approval/rejection, and print initiation. It prefers `cf-connecting-ip`, falling back to a single `x-forwarded-for` address; an ambiguous chain or missing address is left unrecorded. Supabase documents the forwarded header in its [Edge Function example](https://supabase.com/docs/guides/functions/examples/cloudflare-turnstile).

The Admin log displays **Not recorded** for entries without an address. An IP represents the connection and may be shared or changed by a VPN; it is not used to prove a store's physical location or grant access. Each action uses the connection observed when the server receives it, rather than reusing the sign-in IP. Offline queued events use the IP at sync time. Retries retain the original recorded entry and its IP. No external IP lookup service is used. Network metadata is visible through the admin-only activity endpoint.

1. Open [your project](https://supabase.com/dashboard/project/ykgywmirbytzpehsgdad).
2. In the sidebar, open **SQL Editor**, then create a new query.
3. Open [supabase-setup.sql](supabase-setup.sql) from this folder in a text editor. Copy its **entire contents** into the query.
4. Run it using the default `postgres` role. Wait for the success message.

The script creates a separate `store_monitor` schema and a service-only function named `public.store_monitor_api`. It does not alter your existing product tables. You can rerun the script without deleting monitoring records. Do not expose the `store_monitor` schema in Data API settings or grant its tables to browser roles.

## 2. Save the store passwords

Open **Edge Functions → Secrets** in your Supabase project. Add these four secrets:

| Name | Value you enter |
| --- | --- |
| `HOME_EXPRESS_PASSWORD` | A new password for Home Express, at least 12 characters |
| `PESOPLUS_PASSWORD` | A different new password for PesoPlus, at least 12 characters |
| `ADMIN_PASSWORD` | A separate new password for Admin, at least 12 characters |
| `ALLOWED_ORIGINS` | `https://luwi25.github.io` |

Save the secrets. Enter the actual passwords **only in Supabase**. Keep them somewhere private and give each store only its own password. Use new passwords: the previous browser-only passwords are present in the public website source.

The allowed origin has no trailing slash and no `/Store-Design-Template/` path. For a preview served from another address, add its exact origin separated by a comma, for example `https://luwi25.github.io,http://localhost:8080`. Only add origins you actually use. Opening the HTML directly as a `file://` page is not supported for this feature.

Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to hosted functions. Do not copy these into the website. See [Supabase secrets documentation](https://supabase.com/docs/guides/functions/secrets).

## 3. Deploy the backend function

1. Open **Edge Functions → Deploy a new function → Via Editor**.
2. Name the function exactly **`store-activity`**.
3. Replace the editor's `index.ts` contents with the **entire contents** of [index.ts](index.ts) in this folder.
4. Deploy the function.
5. In that function's configuration, turn **Verify JWT** (sometimes labelled **Enforce JWT verification**) **off**, then save the setting. If that option is shown during deployment, turn it off there.

This function implements its own password and session checks. Supabase's JWT gateway must be off because the website sends these custom session tokens, not Supabase Auth JWTs. Private database operations still require the function's server-side service credential.

The function URL must be:

```text
https://ykgywmirbytzpehsgdad.supabase.co/functions/v1/store-activity
```

Use [Supabase's dashboard deployment guide](https://supabase.com/docs/guides/functions/quickstart-dashboard) if the editor labels differ. Do not paste the TypeScript into SQL Editor; SQL Editor is only for step 1.

## 4. Enable the website connection

After steps 1–3 succeed, open [store-activity-config.js](../store-activity-config.js) in the project root and change:

```js
enabled:false,
```

to:

```js
enabled:true,
```

The project URL is already filled in. This configuration contains no password or API key.

Publish the website changes to GitHub together: `index.html`, `build_pages.py`, `mobile.js`, `store-activity-config.js`, `store-activity.js`, and `store-activity.css`. Keep the backend files in the repository for future updates; the Pages build does not copy them into the published website. The existing GitHub Pages workflow builds the browser assets. Wait for that deployment to succeed, then refresh the website. Supabase changes alone do not update the website.

## 5. Use the feature

### Store

1. Choose Home Express or PesoPlus and enter its new password.
2. Open a template and edit products as usual. Saved product changes are queued for logging.
3. Click **Print poster**. A preview appears with an optional note.
4. Click **Send request to admin**. The overlay shows that approval is pending.
5. After approval, click **Approved — Print poster**. If rejected, read the admin comment and send another request when ready.

### Admin

1. Choose **Admin** and enter the admin password.
2. Open **Store activity** in the top toolbar. On mobile it is in **More**.
3. In **Print approvals**, open a pending request, check its preview, optionally enter a comment, and approve or reject it.
4. In **Activity logs**, filter by store, action, dates, or template. Dates use Philippine time. The panel also shows the last recorded activity for each store.

The visible page checks approval status about every **30 seconds** while online. Opening a request or pressing Refresh also fetches current data. Stores have shared identities, so a log identifies the store, not a particular employee. Sessions expire after eight hours.

This is the agreed simple approval flow: no copy count and no poster-version locking. The submitted image is an admin review preview; printing uses the current poster. PDF/PNG downloads are unchanged. A print log means the app authorized a print attempt, not that a physical printer completed it. The browser's own menus and downloaded files are outside this approval flow.

## If setup does not work

| Message or symptom | What to check |
| --- | --- |
| Old passwords still work; no Store activity button | `enabled` is still false, or the website update has not deployed/refreshed. |
| Invalid JWT / Missing authorization header before sign-in | Turn off JWT verification for **store-activity**. |
| Store password has not been configured | Check the exact secret name and use at least 12 characters. |
| Website is not allowed / browser connection failure | Check `ALLOWED_ORIGINS`, the function name/URL, deployment status, and JWT setting. |
| Shared database unavailable | Run the complete SQL setup in the same project. Ensure the Data API is enabled for `public`; keep `store_monitor` private. |
| Too many sign-in attempts | There is a limit of 12 attempts per store per 15-minute window. Wait for the window to expire. |
| Activity sync pending | Keep the tab open, reconnect, and press retry. Unsent events are queued in that tab's session storage. Closing the tab can lose unsent events. |

Do not put an anon key, service key, or password into the website as a workaround.

## Change a password or disable the feature

Change the appropriate password in **Edge Functions → Secrets**. Existing sessions remain valid until they expire. To sign out all devices for a store immediately, run this in SQL Editor, replacing the store value if necessary:

```sql
delete from store_monitor.sessions where store = 'home-express';
```

Use `pesoplus` or `all` for the other roles. This deletes sessions only, not activity or print requests.

To return to the previous browser-only behavior, set `enabled:false` and publish that configuration. This disables shared monitoring and print approval; keep Supabase records if you want the history. No Supabase account connection to Codex is required for any of these steps.

## Delivery status

The files are prepared locally. They have not been applied to your Supabase project or deployed to GitHub by this setup task. Automated tests were not run. Complete the dashboard steps and check the store → request → admin decision → print flow before using it for store operations.
