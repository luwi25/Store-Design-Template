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
 w.eval([...w.document.querySelectorAll('script')].find(s=>s.textContent.includes('function renderPoster')).textContent.replace('window.flashSaleActions={','window.__visibilityTest={setStoreFilter,getState:()=>state,renderAll,choosePrintPaper,printGeometry,preparePrintPages,printPoster,stubExport:()=>{exportPosterCanvas=async()=>document.createElement("canvas");printQualityPNG=async canvas=>{window.__sheet=[canvas.width,canvas.height];return new Blob(["png"],{type:"image/png"})}}};window.flashSaleActions={'));
 await new Promise(r=>setTimeout(r,700));assert.equal(errors.length,0,errors.join('\n'));
 const api=w.__visibilityTest;


 api.setStoreFilter('all');api.stubExport();let filename='';w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){filename=this.download};
 const button=w.document.getElementById('printPngBtn');assert.equal(button.closest('#downloadOptions').id,'downloadOptions');
 for(const [paper,width,height] of [['a4',2480,3508],['letter',2550,3300]]){
  w.flashSaleActions.exportPrintPNG();const dialog=w.document.getElementById('printPaperDialog');assert(dialog.open);assert.equal(dialog.querySelector('[data-continue]').textContent,'Download PNG');w.document.getElementById('outputPaperSize').value=paper;dialog.querySelector('form').dispatchEvent(new w.Event('submit',{cancelable:true}));await new Promise(r=>setTimeout(r,150));assert.deepEqual(Array.from(w.__sheet),[width,height]);assert(filename.endsWith(' - print-ready.png'));assert.equal(button.disabled,false);assert.equal(button.hasAttribute('aria-busy'),false);
 }
 assert.equal(errors.length,0,errors.join('\n'));dom.window.close();console.log('PASS ready-to-print PNG menu, A4/Letter 300 DPI sheet dimensions, filename and busy reset.');
})().catch(e=>{console.error(e);process.exit(1)});
