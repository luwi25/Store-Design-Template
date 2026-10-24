const fs=require('fs'),assert=require('assert/strict'),{JSDOM}=require('jsdom');
const photo='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1sAAAAASUVORK5CYII=';
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 for(const mobile of [false,true])for(const templateId of ['home-back','home-collection']){
  const dom=new JSDOM(fs.readFileSync('public/index.html','utf8'),{url:'https://example.test/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
  const errors=[];let saved;
  w.console.error=(...items)=>errors.push(items.join(' '));w.console.warn=()=>{};
  w.structuredClone=structuredClone;w.matchMedia=()=>({matches:!mobile,addEventListener(){}});w.scrollTo=()=>{};w.confirm=()=>true;w.document.fonts={load:async()=>[]};
  w.Image=class{constructor(){this.width=this.naturalWidth=1280;this.height=this.naturalHeight=1924}set src(value){queueMicrotask(()=>this.onload?.())}};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
  w.HTMLCanvasElement.prototype.toDataURL=()=> 'data:image/png;base64,'+photo;
  w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({canvas:this,font:'',measureText:text=>({width:String(text).length*5}),createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(object,key)=>key in object?object[key]:(()=>{})})};
  const state=JSON.parse(fs.readFileSync('defaults/project.json','utf8')).state;state.templateId=templateId;
  const section=templateId==='home-collection'?'homeCollection':'homeBack';
  const slot=state[section].slots[0],id=slot.productId;
  const catalogProduct=state.products.find(p=>p.id===id),originalPrice=catalogProduct.price;
  if(templateId==='home-collection'){const zeroSlot=state.homeCollection.slots[2];const zeroProduct=state.products.find(p=>p.id===zeroSlot.productId);zeroProduct.price=0;zeroProduct.name='Coffee bundle fixture';zeroSlot.details=null;}
  state.publishedProjectRevision=1;
  state.sharedCatalogDraft={version:1,changes:[{identity:{id,code:catalogProduct.code,templateId:catalogProduct.templateId,name:catalogProduct.name},fields:{price:{before:originalPrice,after:originalPrice+1}}}]};
  catalogProduct.price=originalPrice+1;
  w.fetchPublishedRevision=async()=>2;
  w.loadPublishedDefault=async()=>{throw Error('Pending draft was incorrectly replaced on startup')};
  state.homeCollectionFront.slots[0].productId=id;
  state.homeCollectionFront.slots[0].details={name:'Old override',price:1};
  state.homeCollectionFront.slots[0].image='old-photo';
  w.localStorage.setItem('flashSaleStoreFilter','all');
  w.StoreDatabase={load:async()=>structuredClone(state),save:async value=>{saved=structuredClone(value)},preserveLegacy:async()=>{}};
  w.eval(fs.readFileSync('shared-catalog.js','utf8'));w.eval(fs.readFileSync('shared-catalog-ui.js','utf8'));
  w.eval([...w.document.querySelectorAll('script')].find(script=>script.textContent.includes('function renderPoster')).textContent);
  await delay(700);assert.equal(errors.length,0,errors.join('\n'));assert(w.catalogPublisher);
  w.flashSaleActions.openSlot(0);
  const beforeEdit=structuredClone(saved);
  const name=w.document.getElementById('slotName');name.value='Shared Catalog Name';name.dispatchEvent(new w.Event('input'));name.dispatchEvent(new w.Event('blur'));
  const price=w.document.getElementById('slotOriginalPrice');price.value=42;price.dispatchEvent(new w.Event('input'));
  const upload=w.document.getElementById('slotPhoto');Object.defineProperty(upload,'files',{value:[new w.File([Buffer.from(photo,'base64')],'product.png',{type:'image/png'})]});upload.dispatchEvent(new w.Event('change'));
  await delay(600);
  assert.deepEqual(saved,beforeEdit,'Name, price and photo edits remain detached until Save');
  w.document.getElementById('saveProductEdit').click();await new Promise(r=>setTimeout(r,450));
  const product=saved.products.find(p=>p.id===id);
  assert.equal(product.name,'Shared Catalog Name');assert.equal(product.price,42);assert.equal(product.image,'data:image/png;base64,'+photo);
  assert.equal(saved.homeCollectionFront.slots[0].details.name,product.name);assert.equal(saved.homeCollectionFront.slots[0].details.price,42);assert.equal(saved.homeCollectionFront.slots[0].image,product.image);
  const draft=saved.sharedCatalogDraft.changes.find(edit=>edit.identity.id===id);
  assert.deepEqual(Object.keys(draft.fields).sort(),['image','name','price']);
  assert.equal(draft.fields.price.before,originalPrice);
  assert.equal(saved[section].slots[0].discountPercent,slot.discountPercent);
  assert.deepEqual(saved[section].slots[0].textSizes,slot.textSizes);
  assert(!w.document.getElementById('publishCatalog').hidden);
  if(templateId==='home-collection'){
   w.flashSaleActions.openSlot(2);
   const bundleName=w.document.getElementById('slotName');bundleName.value='Updated coffee bundle';bundleName.dispatchEvent(new w.Event('input'));
   w.document.getElementById('saveProductEdit').click();await delay(450);
   const bundleId=state.homeCollection.slots[2].productId;
   assert.equal(saved.products.find(p=>p.id===bundleId).name,'Updated coffee bundle','Zero-price bundle name must save');
   assert(saved.sharedCatalogDraft.changes.some(change=>change.identity.id===bundleId&&change.fields.name),'Saved bundle must enter publishing list');
  }
  assert.equal(errors.length,0,errors.join('\n'));dom.window.close();
 }
 console.log('PASS: actual desktop/mobile editor name, price and photo hooks update catalog, repeated slots and saved publish drafts without altering discounts or text sizes.');
})().catch(error=>{console.error(error);process.exitCode=1});
