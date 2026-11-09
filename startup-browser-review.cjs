const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  for(const store of ['felcon-bato','home-express','pesoplus','alkeia-talamban']){
  const context=await browser.newContext({viewport:{width:store==='pesoplus'?390:1440,height:900}});const page=await context.newPage();const requests=[],errors=[];
  page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/functions/v1/**',route=>{const path=new URL(route.request().url()).pathname;return route.fulfill({json:path.endsWith('/login')?{store,token:'a'.repeat(64)}:path.endsWith('/session')?{store}:{items:[],requests:[],activity:[],notifications:[],unread:0}})});
  await page.goto('http://127.0.0.1:8871/',{waitUntil:'domcontentloaded'});
  await page.locator('#storeChooserDialog').waitFor({state:'visible'});
  assert(!requests.some(url=>url.includes('/defaults/project.json')),'Catalog must wait for sign-in');
  assert(!requests.some(url=>/\/(assets|defaults\/images|vendor)\//.test(url)),'No artwork or models before sign-in');
  await page.locator('[data-store="'+store+'"]').click();await page.locator('#storePassword').fill('test-password');await page.locator('#storePasswordGate button[type=submit]').click();
  if(store==='alkeia-talamban'){
   await page.locator('#templateVisibilityEmpty').waitFor({state:'visible'});
   assert(!requests.some(url=>/\/(assets|defaults\/images|vendor)\//.test(url)),'Store with hidden templates must not download another store artwork');
   console.log(store+': PASS: hidden templates remain hidden; no unrelated artwork loaded.');await context.close();continue;
  }
  await page.locator('#duplexLayer .duplex-preview').waitFor({state:'visible',timeout:60000});
  assert((await page.locator('#studioTemplate').inputValue())!==null);
  assert(!requests.some(url=>/u2netp|ort-wasm/.test(url)),'Background-removal model is on demand');
  const images=requests.filter(url=>/\/(assets|defaults\/images)\//.test(url));assert(images.length<70,'Only the selected store/template images should load: '+images.length);
  assert.equal(errors.length,0,errors.join('\n'));
  if(store==='felcon-bato'){
   const downloading=page.waitForEvent('download');await page.evaluate(()=>window.flashSaleActions.exportPNG());
   const download=await downloading;assert.equal(await download.failure(),null);
   const chunks=[];for await(const chunk of await download.createReadStream())chunks.push(chunk);
   const png=Buffer.concat(chunks);assert.equal(png.toString('ascii',1,4),'PNG');assert(png.readUInt32BE(16)>=1500,'Export keeps print resolution');
  }
  await page.evaluate(()=>navigator.serviceWorker.ready);
  // The same selected poster remains usable offline after its first successful load.
  await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#duplexLayer .duplex-preview').waitFor({state:'visible',timeout:60000});
  console.log(store+': PASS: cold sign-in before catalog; selected store preview; '+images.length+' image requests, no model download; visited poster reopens offline.');
  await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
