# Local project integration

Open http://127.0.0.1:8766/ and sign in as Admin. Select Import template (inside More on mobile). The workspace opens at /template-import/index.html. Back to poster editor returns to the main screen.

Use the normal project launcher. No Supabase schema update is required. The workspace checks the existing Admin session and reads the repository catalog.

Drafts are stored separately from the main project. Earlier drafts created at port 8767 remain on that browser origin and are not automatically transferred to port 8766.

Imported templates stay in the import library; they are not added to sales sync, publishing or print approvals.

Before saving, enter a template name and choose its store in Template details. Save retains the original background, replacement photos, region positions and sizes, text styling and catalog selection in the separate import database. Existing drafts open as Unassigned until a store is chosen. Assignment currently labels the draft; it does not publish the template into a store?s main list.

Image regions support browser-based background removal using the existing U2Netp worker. Original photos are retained in the draft for restoration. Uncheck Cover the original image area for blank placeholders to show the underlying poster through transparent pixels. The operation applies only to the selected import region, not the source catalog.
