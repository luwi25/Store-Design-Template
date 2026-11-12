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

 api.setStoreFilter('all');
 const field=w.document.getElementById('adminTemplateStoreField'),select=w.document.getElementById('adminTemplateStore');
 assert.equal(field.hidden,false);assert.ok(select.options.length>=10);
 const active=api.getState().templateId;
 select.value='Pesoplus Mambaling';assert.equal(select.value,'Pesoplus Mambaling');select.dispatchEvent(new w.Event('change'));
 let visible=[...w.document.querySelectorAll('.template-store-group:not(.admin-filter-hidden)')];
 assert.equal(visible.length,1);assert.match(visible[0].textContent,/Pesoplus/);assert.equal(api.getState().templateId,active);
 api.renderAll();assert.equal(select.value,'Pesoplus Mambaling');assert.equal(w.document.querySelectorAll('.template-store-group:not(.admin-filter-hidden)').length,1);
 api.setStoreFilter('home-express');assert.equal(field.hidden,true);assert.equal(w.document.querySelectorAll('.admin-filter-hidden').length,0);
 api.setStoreFilter('all');select.value='';select.dispatchEvent(new w.Event('change'));assert.equal(w.document.querySelectorAll('.admin-filter-hidden').length,0);
 assert.equal(errors.length,0,errors.join('\n'));dom.window.close();console.log('PASS sidebar store filtering, rerender, active poster preservation, store-role isolation and All stores.');
})().catch(e=>{console.error(e);process.exit(1)});
