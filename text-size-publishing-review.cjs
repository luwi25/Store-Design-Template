const fs=require('fs'),assert=require('assert/strict'),{JSDOM}=require('jsdom');
const mobile=process.argv.includes('--mobile'),back=false;
const section='felconFront',count=8;
const html=fs.readFileSync('public/index.html','utf8');
(async()=>{
 const dom=new JSDOM(html,{url:'https://example.test/',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;const errors=[],draws=[];let saved=null;
 w.console.error=(...args)=>errors.push(args.map(String).join(' '));w.console.warn=()=>{};
 w.structuredClone=structuredClone;w.matchMedia=()=>({matches:!mobile,addEventListener(){}});w.scrollTo=()=>{};w.confirm=()=>true;w.document.fonts={load:async()=>[]};
 w.Image=class{constructor(){this.width=this.naturalWidth=1280;this.height=this.naturalHeight=1924}set src(v){queueMicrotask(()=>this.onload?.())}};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 w.HTMLCanvasElement.prototype.toDataURL=()=> 'data:image/png;base64,YWJj';
 w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({canvas:this,font:'',measureText:t=>({width:String(t).length*5}),fillText(t){draws.push({text:t,font:this.font})},createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})}, {get:(o,k)=>k in o?o[k]:(()=>{})})};
 const source=JSON.parse(fs.readFileSync('defaults/project.json','utf8')).state;
 // This scenario exercises Home Express Back. A published backup can open any
 // template, so select the scenario explicitly instead of inheriting that choice.
 source.templateId='felcon-bato-front';
 w.localStorage.setItem('flashSaleStoreFilter','all');
 w.StoreDatabase={load:async()=>structuredClone(source),save:async s=>{saved=JSON.parse(JSON.stringify(s))},preserveLegacy:async()=>{}};
 w.eval(fs.readFileSync('shared-catalog.js','utf8'));w.eval(fs.readFileSync('shared-catalog-ui.js','utf8'));
 w.eval([...w.document.querySelectorAll('script')].find(s=>s.textContent.includes('function renderPoster')).textContent);
 await new Promise(r=>setTimeout(r,700));assert.equal(errors.length,0,errors.join('\n'));
 assert.equal(w.document.querySelectorAll('.studio-product').length,count);
 const card=[...w.document.querySelectorAll('.template-card')].find(c=>c.textContent.includes('Template #1 - FELCON BATO - FRONT'));
 assert.equal(w.document.querySelectorAll('.duplex-hit').length,count);
 if(back){
  assert.equal(source.pesoCollectionBack.groupNames.length,5);
  assert(!source.pesoCollectionBack.groupNames.some(name=>/christmas/i.test(name)));
  assert(!draws.some(item=>/christmas/i.test(item.text)));
  for(const name of source.pesoCollectionBack.groupNames)assert(draws.some(item=>item.text===name.toUpperCase()),`Missing rendered heading: ${name}`);
 }
 for(const hit of w.document.querySelectorAll('.duplex-hit')){assert(parseFloat(hit.style.left)>=0);assert(parseFloat(hit.style.top)>=0);assert(parseFloat(hit.style.left)+parseFloat(hit.style.width)<=100);assert(parseFloat(hit.style.top)+parseFloat(hit.style.height)<=100)}
 const lastSlot=source[section].slots[count-1],lastProduct=source.products.find(p=>p.id===lastSlot.productId);
 w.flashSaleActions.openSlot(count-1);assert.equal(w.document.getElementById('slotName').value,lastSlot.details?.name||lastProduct.name);
 const price=w.document.getElementById('slotOriginalPrice');price.value='150';price.dispatchEvent(new w.Event('input'));
 const text=w.document.getElementById('slotText-name');text.value='140';text.dispatchEvent(new w.Event('input'));
 w.document.getElementById('saveProductEdit').click();await new Promise(r=>setTimeout(r,400));
 assert.equal(saved[section].slots.length,count);assert.equal(saved[section].slots[count-1].textSizes.name,140);
 for(const oldId of Object.keys(source.catalogAliases||{}))assert(!saved.products.some(p=>p.id===oldId),'Merged seed product was recreated: '+oldId);
 assert.equal(saved.products.find(p=>p.id===saved[section].slots[count-1].productId).price,150);
 if(back){const heading=w.document.getElementById('pesoCollectionBackLabel-1');assert(heading);heading.value='Kitchen favorites';heading.dispatchEvent(new w.Event('input'));await new Promise(r=>setTimeout(r,400));assert.equal(saved[section].groupNames[1],'Kitchen favorites');}
 const changes=saved.sharedCatalogDraft.changes,textEdit=changes.find(c=>c.kind==='textSizes');
 assert(textEdit,'Saved name size enters pending publish list');assert.equal(textEdit.fields.name.after,140);
 w.document.getElementById('publishCatalog').click();assert.match(w.document.querySelector('[data-changes]').textContent,/name text size/);
 const core=require('./shared-catalog.js'),project=JSON.parse(fs.readFileSync('defaults/project.json','utf8'));
 const result=await core.prepare(project,changes);
 assert.equal(result.project.state[section].slots[count-1].textSizes.name,140);
 assert.deepEqual(result.project.state[section].slots.slice(0,count-1),project.state[section].slots.slice(0,count-1));
 assert.deepEqual(result.project.state.felconBack,project.state.felconBack);
 assert.equal((await core.prepare(result.project,changes)).count,0,'Retry is idempotent');
 const conflict=structuredClone(project);conflict.state[section].slots[count-1].textSizes={name:75};
 await assert.rejects(core.prepare(conflict,[textEdit]),/published product text size changed/);
 const moved=structuredClone(project);moved.state[section].slots[count-1].productId='different-product';
 await assert.rejects(core.prepare(moved,[textEdit]),/product in this template position changed/);
 await assert.rejects(core.prepare(project,[{...textEdit,fields:{name:{before:null,after:999}}}]),/Invalid product text size/);
 // A name-only size adjustment does not overwrite other text fields or discounts.
 const concurrent=structuredClone(project);concurrent.state[section].slots[count-1].textSizes={...(concurrent.state[section].slots[count-1].textSizes||{}),sale:125};
 const merged=await core.prepare(concurrent,[textEdit]);assert.equal(merged.project.state[section].slots[count-1].textSizes.sale,125);
 w.document.getElementById('publishCatalogDialog').close();
 w.flashSaleActions.openSlot(count-1);const reset=w.document.getElementById('slotText-name');reset.value='120';reset.dispatchEvent(new w.Event('input'));w.document.getElementById('saveProductEdit').click();await new Promise(r=>setTimeout(r,400));
 const repeated=saved.sharedCatalogDraft.changes.find(c=>c.kind==='textSizes');assert.equal(repeated.fields.name.before,textEdit.fields.name.before);assert.equal(repeated.fields.name.after,120);
 assert.deepEqual(saved.homeBack,source.homeBack);assert.deepEqual(saved.felconBack,source.felconBack);
 assert.equal(errors.length,0,errors.join('\n'));dom.window.close();console.log('PASS: saved text sizes enter pending list, publish per position, preserve sibling/other fields, retain original baseline and reject stale changes.');
})().catch(e=>{console.error(e);process.exit(1)});