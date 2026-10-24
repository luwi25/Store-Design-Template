const fs=require('fs'),assert=require('assert/strict'),{JSDOM}=require('jsdom');
const mobile=process.argv.includes('--mobile'),back=process.argv.includes('--back');
const section=back?'pesoCollectionBack':'pesoCollectionFront',count=back?25:8;
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
 source.templateId=back?'peso-collection-back':'peso-collection-front';
 w.StoreDatabase={load:async()=>structuredClone(source),save:async s=>{saved=JSON.parse(JSON.stringify(s))},preserveLegacy:async()=>{}};
 w.eval([...w.document.querySelectorAll('script')].find(s=>s.textContent.includes('function renderPoster')).textContent);
 await new Promise(r=>setTimeout(r,700));assert.equal(errors.length,0,errors.join('\n'));
 assert.equal(w.document.querySelectorAll('.studio-product').length,count);
 const card=[...w.document.querySelectorAll('.template-card')].find(c=>c.textContent.includes(back?'Template #2 - PESOPLUS - BACK':'Template #2 - PESOPLUS - FRONT'));
 assert(card);assert.equal(card.dataset.storeGroup,'Pesoplus Mambaling');
 assert.equal(w.document.querySelectorAll('.duplex-hit').length,count);
 for(const hit of w.document.querySelectorAll('.duplex-hit')){assert(parseFloat(hit.style.left)>=0);assert(parseFloat(hit.style.top)>=0);assert(parseFloat(hit.style.left)+parseFloat(hit.style.width)<=100);assert(parseFloat(hit.style.top)+parseFloat(hit.style.height)<=100)}
 const lastSlot=source[section].slots[count-1],lastProduct=source.products.find(p=>p.id===lastSlot.productId);
 w.flashSaleActions.openSlot(count-1);assert.equal(w.document.getElementById('slotName').value,lastSlot.details?.name||lastProduct.name);
 const price=w.document.getElementById('slotOriginalPrice');price.value='150';price.dispatchEvent(new w.Event('input'));
 const text=w.document.getElementById('slotText-name');text.value='140';text.dispatchEvent(new w.Event('input'));
 w.document.getElementById('saveProductEdit').click();await new Promise(r=>setTimeout(r,400));
 assert.equal(saved[section].slots.length,count);assert.equal(saved[section].slots[count-1].textSizes.name,140);
 assert.equal(saved.products.find(p=>p.id===saved[section].slots[count-1].productId).price,150);
 if(back){const heading=w.document.getElementById('pesoCollectionBackLabel-1');assert(heading);heading.value='Kitchen favorites';heading.dispatchEvent(new w.Event('input'));await new Promise(r=>setTimeout(r,400));assert.equal(saved[section].groupNames[1],'Kitchen favorites');}
 assert.deepEqual(saved.homeBack,source.homeBack);
 assert.equal(errors.length,0,errors.join('\n'));dom.window.close();console.log('PASS: Pesoplus Template #2 store grouping, editable positions and section headings, hitboxes, saved product fields and existing template isolation.');
})().catch(e=>{console.error(e);process.exit(1)});
