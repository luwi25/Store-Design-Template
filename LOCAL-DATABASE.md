# Local database

Double-click **Start Store Design Template.cmd** to start the database service and open the editor. Python is already installed on this computer. No MySQL installation or internet connection is required.

The app now uses SQLite at `data/store-design.sqlite3`. Product and template settings are saved transactionally. Image data is compressed and deduplicated in the `assets` table, so repeated references do not store duplicate images. The last 30 state revisions are kept in `backups`; original migrated browser saves are retained in `legacy_imports`.

## Existing browser saves

The launcher opens the original `index.html` file location. Use the same browser and browser profile previously used for the editor. On first connection, the editor imports existing saved browser data when the database is empty. It also retains the browser copy. Once the database has a saved project, it takes priority over stale browser data. Other detected browser saves are archived in the database rather than overwriting the current project.

The browser no longer receives localStorage writes. Edits that had already failed to save before this update are not present in the old browser save.

## Backups and recovery

Use **Local database → Download backup** to save a portable JSON copy of the current project, including images. **Import backup** restores one of those files after confirmation. The previous database state is retained as a recovery revision.

If the service stops, edits remain on screen. Start the launcher again, then click **Retry save** in the existing editor tab. You may also download a backup of the current edits. Wait for **Saved to local database** before closing the editor.

When another tab has saved a newer revision, the app blocks an overwrite. Download your current edits as a backup, then reload to load the latest database state.

Use the app's JSON backup feature while the service is running. For a raw database copy, stop the service first or use SQLite's backup API; copying only the `.sqlite3` file while WAL writes are active can omit recent saves.

## Service

- Address: `http://127.0.0.1:8766` (local computer only).
- Manual startup: `python server.py` from this directory.
- Launcher: `launch.ps1`, invoked by `Start Store Design Template.cmd`.
- SQLite schema and HTTP API: `server.py`.
- Browser database client: `local-db.js`.
- Local access token: `data/service-token.txt`; generated configuration: `db-config.js`.
- The service accepts authenticated requests from the local editor and does not serve database files or tokens as downloadable data files.

Keep the `data` directory when moving or upgrading the project. Closing the browser does not stop the service; restarting the computer does. Run the launcher again after restarting Windows.

## Transparent product images

Open a product in the catalog or click a product on the poster. Under its image, choose **Remove background**. The checkerboard preview shows transparency. **Restore original** returns the exact prior image, and **Download PNG** exports the current image with its alpha channel.

Template image changes save automatically. In the catalog editor, click **Save product** to keep the result. Closing the catalog editor without saving discards the draft. Uploading another photo starts a new image edit; restoring an original never changes another product.

Background removal is installed locally in `.venv` and uses OpenCV with the U²-Net model in `data/models/u2net.onnx`. Photos are processed on this computer. Automatic cutouts may need a different source photo for fine wires, glass or complex backgrounds; inspect the preview and use Restore original as needed.

To install the feature on another computer, run `Setup Background Removal.cmd` (internet required for dependencies and the model), then start the service using the project's `.venv\Scripts\python.exe server.py`. The normal launcher prefers this environment. Current pinned dependencies are in `requirements-background.txt`.

Model distribution and normalization reference: [rembg](https://github.com/danielgatis/rembg). The downloaded model checksum is verified during setup.
