"""Build the browser-only site without copying local saves or credentials."""
from pathlib import Path
import base64
import hashlib
import re
import shutil

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'public'
OUT.mkdir(exist_ok=True)
(OUT/'assets').mkdir(exist_ok=True)
html=(ROOT/'index.html').read_text(encoding='utf-8')
html=html.replace('<script src="db-config.js"></script>','<script src="browser-background.js"></script>')
html=html.replace('<script src="local-db.js"></script>','<script src="browser-db.js"></script>')
html=html.replace('Local database','Device storage').replace('local database','device storage')
html=html.replace('Connecting to your device storage...','Opening your browser’s device storage...')
html=html.replace('The device storage files are missing. Open Start Store Design Template.cmd from the project folder.','Device storage could not load. Refresh this page and try again.')
html=html.replace('Start your device storage','Allow browser storage')
html=html.replace('Open Start Store Design Template.cmd in the flash-sale-studio folder, then click Reconnect. Existing browser data has not been removed.','Allow this website to store data in your browser, then click Retry. Existing data has not been removed.')
html=html.replace("retry.textContent='Reconnect'","retry.textContent='Retry'")
html=html.replace('<h2>Device storage</h2>','<h2>Device storage</h2>')
needle='<div class="panel-head"><h2>Device storage</h2></div>'
html=html.replace(needle,needle+'<p class="helper">Images and edits stay in this browser only. They are never uploaded or shared. Download a backup before clearing browser data or changing devices.</p>')
# Keep large reference images outside the HTML so the browser can cache them.
def external_image(match):
    mime,encoded=match.groups();raw=base64.b64decode(encoded)
    extension={'png':'png','jpeg':'jpg','webp':'webp','svg+xml':'svg'}.get(mime,'bin')
    name=hashlib.sha256(raw).hexdigest()+'.'+extension
    (OUT/'assets'/name).write_bytes(raw)
    return 'assets/'+name
html=re.sub(r'data:image/(png|jpeg|webp|svg\+xml);base64,([A-Za-z0-9+/=]+)',external_image,html)
(OUT/'index.html').write_text(html,encoding='utf-8')
for name in ['browser-db.js','browser-background.js','background-worker.js']:
    shutil.copy2(ROOT/name,OUT/name)
shutil.copytree(ROOT/'vendor',OUT/'vendor',dirs_exist_ok=True)
(OUT/'.nojekyll').touch()
assert 'src="db-config.js"' not in html and 'src="local-db.js"' not in html
print('Built browser-only site:',OUT)
