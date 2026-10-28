"""Build the browser-only site with an explicitly published starter project, never database files or credentials."""
from pathlib import Path
import base64
import hashlib
import json
import re
import shutil
from embed_collection import embed_collection

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'public'
OUT.mkdir(exist_ok=True)
(OUT/'assets').mkdir(exist_ok=True)
html=(ROOT/'index.html').read_text(encoding='utf-8')
html=embed_collection(html,ROOT)
edit_start=html.index('// BEGIN PRODUCT EDITOR')
edit_end=html.index('// END PRODUCT EDITOR',edit_start)+len('// END PRODUCT EDITOR')
html=html[:edit_start]+'// BEGIN PRODUCT EDITOR\n'+(ROOT/'product-edit-draft.js').read_text(encoding='utf-8')+'\n'+(ROOT/'product-editor.js').read_text(encoding='utf-8')+'// END PRODUCT EDITOR'+html[edit_end:]
# Always publish the maintained UI source, even if the standalone bundle is stale.
ui_start=html.index('// Runs inside the editor closure;')
ui_end=html.index('initTemplateSettings();',ui_start)
html=html[:ui_start]+(ROOT/'studio-ui.js').read_text(encoding='utf-8')+'\n'+(ROOT/'restore-defaults.js').read_text(encoding='utf-8')+'\n'+html[ui_end:]
html=html.replace('setupStudioUI();','setupStudioUI();setupRestoreDefaults();')
html=html.replace('width=device-width,initial-scale=1','width=device-width,initial-scale=1,viewport-fit=cover')
html=html.replace('<meta name="theme-color" content="#0b1b43">','<meta name="theme-color" content="#163b65">')
html=html.replace('</head>','''<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Store Design">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="stylesheet" href="mobile.css">
<link rel="stylesheet" href="restore-defaults.css">
<style>#usePublishedProject[hidden]{display:none!important}@media print{.published-default-actions{display:none!important}}</style>
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
html=html.replace(startup,
 " if(!parsed){parsed=await loadPublishedDefault();await StoreDatabase.save(parsed)}"
 " else if(typeof parsed.publishedProjectRevision==='number'){try{const latestRevision=await fetchPublishedRevision();"
 "if(typeof latestRevision==='number'&&latestRevision>parsed.publishedProjectRevision&&!parsed.sharedCatalogDraft?.changes?.length){parsed=await loadPublishedDefault();"
 "await StoreDatabase.save(parsed);showNotice('Catalog refreshed with the latest weekly top sellers.')}}"
 "catch(e){console.warn('Catalog update check failed',e)}}\n"
 +startup)
# Keep large reference images outside the HTML so the browser can cache them.
def external_image(match):
    mime,encoded=match.groups();raw=base64.b64decode(encoded)
    extension={'png':'png','jpeg':'jpg','webp':'webp','svg+xml':'svg'}.get(mime,'bin')
    name=hashlib.sha256(raw).hexdigest()+'.'+extension
    (OUT/'assets'/name).write_bytes(raw)
    return 'assets/'+name
html=re.sub(r'data:image/(png|jpeg|webp|svg\+xml);base64,([A-Za-z0-9+/=]+)',external_image,html)
(OUT/'index.html').write_text(html,encoding='utf-8')
for name in ['default-project.js','browser-db.js','browser-background.js','background-worker.js','mobile.css','mobile.js','install-app.js','manifest.webmanifest','restore-defaults.css','download-menu.css','sidebar-spacing.css','shared-catalog.js','shared-catalog-ui.js','shared-catalog.css','store-activity-config.js','store-activity.js','store-activity.css','notification-worker.js']:
    shutil.copy2(ROOT/name,OUT/name)
# Ship current image references only, rather than every historical replacement.
published=json.loads((ROOT/'defaults/project.json').read_text(encoding='utf-8'))
published_images=set()
def collect_published_images(value):
    if isinstance(value,dict):
        if '__defaultImage' in value:
            name=value['__defaultImage']
            if not re.fullmatch(r'images/[a-f0-9]{64}\.(png|jpg|webp|svg)',name):
                raise ValueError('Invalid published image path')
            published_images.add(name)
        else:
            for item in value.values(): collect_published_images(item)
    elif isinstance(value,list):
        for item in value: collect_published_images(item)
collect_published_images(published)
(OUT/'defaults/images').mkdir(parents=True,exist_ok=True)
shutil.copy2(ROOT/'defaults/project.json',OUT/'defaults/project.json')
for name in published_images:
    shutil.copy2(ROOT/'defaults'/name,OUT/'defaults'/name)
shutil.copytree(ROOT/'vendor',OUT/'vendor',dirs_exist_ok=True)
shutil.copytree(ROOT/'icons',OUT/'icons',dirs_exist_ok=True)
(OUT/'.nojekyll').touch()
# Content hashes allow updates to reuse unchanged offline files.
files=sorted(path.relative_to(OUT).as_posix() for path in OUT.rglob('*') if path.is_file() and path.name not in ['sw.js','.nojekyll'] and
             (not path.relative_to(OUT).as_posix().startswith('defaults/images/') or path.relative_to(OUT/'defaults').as_posix() in published_images))
digest=hashlib.sha256()
for name in files:
    digest.update(name.encode());digest.update((OUT/name).read_bytes())
sw=(ROOT/'sw-template.js').read_text(encoding='utf-8').replace('__VERSION__',digest.hexdigest()[:16]).replace('__FILES__',json.dumps(files)).replace('__HASHES__',json.dumps({name:hashlib.sha256((OUT/name).read_bytes()).hexdigest() for name in files}))
(OUT/'sw.js').write_text(sw,encoding='utf-8')
assert 'src="db-config.js"' not in html and 'src="local-db.js"' not in html
print('Built browser-only site:',OUT)
