"""Build the browser-only site with an explicitly published starter project, never database files or credentials."""
from pathlib import Path
import base64
import hashlib
import json
import re
import shutil

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'public'
OUT.mkdir(exist_ok=True)
(OUT/'assets').mkdir(exist_ok=True)
html=(ROOT/'index.html').read_text(encoding='utf-8')
html=html.replace('width=device-width,initial-scale=1','width=device-width,initial-scale=1,viewport-fit=cover')
html=html.replace('<meta name="theme-color" content="#0b1b43">','<meta name="theme-color" content="#163b65">')
html=html.replace('</head>','''<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Store Design">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="stylesheet" href="mobile.css">
<script src="mobile.js" defer></script>
<script src="install-app.js" defer></script>
</head>''')
html=html.replace('<script src="db-config.js"></script>','<script src="browser-background.js"></script>')
html=html.replace('<script src="local-db.js"></script>','<script src="browser-db.js"></script><script src="default-project.js"></script>')
html=html.replace('Local database','Device storage').replace('local database','device storage')
html=html.replace('Connecting to your device storage...','Opening your browser’s device storage...')
html=html.replace('The device storage files are missing. Open Start Store Design Template.cmd from the project folder.','Device storage could not load. Refresh this page and try again.')
html=html.replace('Start your device storage','Allow browser storage')
html=html.replace('Open Start Store Design Template.cmd in the flash-sale-studio folder, then click Reconnect. Existing browser data has not been removed.','Allow this website to store data in your browser, then click Retry. Existing data has not been removed.')
html=html.replace("retry.textContent='Reconnect'","retry.textContent='Retry'")
html=html.replace('Templates, products and images are saved on this computer. Use the launcher to start the app.','Templates, products and images are saved only in this browser. Use a backup to move your edits.')
html=html.replace('Click a product card on the poster to edit its details.','Tap a product card to edit its details.')
html=html.replace('Print quality: 300 DPI. PNG: 1650 × 2550 pixels at 5.5 × 8.5 inches. Print rendering adapts to your paper size.','Download a print-ready PDF at 300 DPI. Page dimensions follow your print settings.')
html=html.replace('<h2>Device storage</h2>','<h2>Device storage</h2>')
needle='<div class="panel-head"><h2>Device storage</h2></div>'
html=html.replace(needle,needle+'<p class="helper">Images and edits stay in this browser only. They are never uploaded or shared. Download a backup before clearing browser data or changing devices.</p>')
# Seed only an empty device; local and legacy projects always take precedence.
startup = ' if(parsed){hasStoredState=true;'
assert html.count(startup) == 1
html=html.replace(startup, ' if(!parsed){parsed=await loadPublishedDefault();await StoreDatabase.save(parsed)}\n'+startup)
# Keep large reference images outside the HTML so the browser can cache them.
def external_image(match):
    mime,encoded=match.groups();raw=base64.b64decode(encoded)
    extension={'png':'png','jpeg':'jpg','webp':'webp','svg+xml':'svg'}.get(mime,'bin')
    name=hashlib.sha256(raw).hexdigest()+'.'+extension
    (OUT/'assets'/name).write_bytes(raw)
    return 'assets/'+name
html=re.sub(r'data:image/(png|jpeg|webp|svg\+xml);base64,([A-Za-z0-9+/=]+)',external_image,html)
(OUT/'index.html').write_text(html,encoding='utf-8')
for name in ['default-project.js','browser-db.js','browser-background.js','background-worker.js','mobile.css','mobile.js','install-app.js','manifest.webmanifest']:
    shutil.copy2(ROOT/name,OUT/name)
shutil.copytree(ROOT/'defaults',OUT/'defaults',dirs_exist_ok=True)
shutil.copytree(ROOT/'vendor',OUT/'vendor',dirs_exist_ok=True)
shutil.copytree(ROOT/'icons',OUT/'icons',dirs_exist_ok=True)
(OUT/'.nojekyll').touch()
# Content-derived cache version: updates wait until old app windows close.
files=sorted(path.relative_to(OUT).as_posix() for path in OUT.rglob('*') if path.is_file() and path.name not in ['sw.js','.nojekyll'])
digest=hashlib.sha256()
for name in files:
    digest.update(name.encode());digest.update((OUT/name).read_bytes())
sw=(ROOT/'sw-template.js').read_text(encoding='utf-8').replace('__VERSION__',digest.hexdigest()[:16]).replace('__FILES__',json.dumps(files))
(OUT/'sw.js').write_text(sw,encoding='utf-8')
assert 'src="db-config.js"' not in html and 'src="local-db.js"' not in html
print('Built browser-only site:',OUT)
