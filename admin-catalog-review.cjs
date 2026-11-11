const fs=require('fs'),assert=require('assert/strict'),{JSDOM}=require('jsdom');
const mobile=process.argv.includes('--mobile');
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
 source.templateId='home-back';
 w.StoreDatabase={load:async()=>structuredClone(source),save:async s=>{saved=JSON.parse(JSON.stringify(s))},preserveLegacy:async()=>{}};
 w.eval([...w.document.querySelectorAll('script')].find(s=>s.textContent.includes('function renderPoster')).textContent.replace('window.flashSaleActions={','window.__visibilityTest={setStoreFilter,getState:()=>state,renderAll};window.flashSaleActions={'));
 await new Promise(r=>setTimeout(r,700));assert.equal(errors.length,0,errors.join('\n'));
 const api=w.__visibilityTest;
 w.SharedCatalog=require('./shared-catalog.js');
 w.eval(fs.readFileSync('shared-catalog-ui.js','utf8'));
 let mode='all',canApply=true;api.setStoreFilter(mode);
 w.catalogPublisher=w.setupSharedCatalogPublishing({getState:api.getState,getMode:()=>mode,save:()=>{},render:api.renderAll,canApplyVisibility:()=>canApply});

 const $=id=>w.document.getElementById(id),input=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new w.Event('input',{bubbles:true}))},change=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new w.Event('change',{bubbles:true}))};
 assert.equal($('adminCatalogButton').hidden,false);$('adminCatalogButton').click();assert($('adminCatalogDialog').open);
 assert($('adminCatalogDialog').contains($('catalogList')));assert(w.document.querySelectorAll('#catalogList .product-mini').length<=20);
 change('adminCatalogStore','alkeia-tayud');assert($('productCount').textContent.includes('products'));input('catalogSearch','nonexistent-test-product');assert.equal(w.document.querySelectorAll('#catalogList .product-mini').length,0);
 input('catalogSearch','');change('adminCatalogStore','');change('adminCatalogPhoto','missing');assert.equal(w.document.querySelectorAll('#catalogList .product-mini').length,Math.min(20,api.getState().products.filter(p=>!p.image).length));change('adminCatalogPhoto','');change('adminCatalogPrice','zero');assert.equal(w.document.querySelectorAll('#catalogList .product-mini').length,Math.min(20,api.getState().products.filter(p=>p.price===0).length));change('adminCatalogPrice','');
 w.flashSaleActions.addProduct();assert($('productDialog').open);input('productName','Catalog overlay test');input('productPrice','125');$('productForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await new Promise(r=>setTimeout(r,400));
 let p=api.getState().products.find(p=>p.name==='Catalog overlay test');assert(p);assert.equal(p.price,125);const id=p.id;
 input('catalogSearch','Catalog overlay test');w.document.querySelector('#catalogList .icon-btn').click();input('productName','Catalog overlay edited');input('productPrice','130');$('productForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await new Promise(r=>setTimeout(r,400));assert.equal(api.getState().products.find(p=>p.id===id).price,130);
 input('catalogSearch','Catalog overlay edited');w.document.querySelector('#catalogList .delete-product').click();await new Promise(r=>setTimeout(r,300));assert(!api.getState().products.some(p=>p.id===id));assert(saved.deletedProductIds.includes(id));
 mode='home-express';api.setStoreFilter(mode);assert($('adminCatalogButton').hidden);assert(!$('adminCatalogDialog').open);$('adminCatalogButton').click();assert(!$('adminCatalogDialog').open);w.flashSaleActions.addProduct();assert(!$('productDialog').open);
 assert.equal(errors.length,0,errors.join('\n'));dom.window.close();console.log('PASS: Admin catalog overlay filters, pagination, add/edit/delete persistence and store access guards.');
})().catch(e=>{console.error(e);process.exitCode=1});
