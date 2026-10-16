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
 w.StoreDatabase={load:async()=>structuredClone(source),save:async s=>{saved=JSON.parse(JSON.stringify(s))},preserveLegacy:async()=>{}};
 w.eval([...w.document.querySelectorAll('script')].find(s=>s.textContent.includes('function renderPoster')).textContent);
 await new Promise(r=>setTimeout(r,700));assert.equal(errors.length,0,errors.join('\n'));
 assert.equal(w.document.querySelectorAll('.studio-product').length,15);
 w.flashSaleActions.openSlot(0);if(mobile){assert(w.document.querySelector('#slotDialog #slotEditor'));assert.equal(w.document.querySelector('#slotDialog').open,true)}else{assert(w.document.querySelector('#studioInspectorBody #slotEditor'));assert.equal(w.document.querySelector('#slotDialog').open,false)}
 const input=w.document.querySelector('#slotText-name');assert(input);input.value=140;input.dispatchEvent(new w.Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,400));
 assert.equal(saved.homeBack.slots[0].textSizes.name,140);assert.equal(saved.homeBack.slots[1].textSizes,undefined);
 assert(draws.some(d=>d.text==='TUPPERWARE'&&Math.abs(Number(d.font.match(/([\d.]+)px/)?.[1])-33.6)<.01), 'Selected product uses independent size in canvas');
 w.flashSaleActions.openSlot(1);assert.equal(w.document.querySelector('#slotText-name').value,'100');
 w.flashSaleActions.openSlot(0);assert.equal(w.document.querySelector('#slotText-name').value,'140');
 w.document.querySelector('#studioProductSearch').value='Pail';w.document.querySelector('#studioProductSearch').dispatchEvent(new w.Event('input'));assert.equal(w.document.querySelectorAll('.studio-product').length,1);
 w.document.querySelector('#studioProductSearch').value='';w.document.querySelector('#studioProductSearch').dispatchEvent(new w.Event('input'));
 const preset=[...w.document.querySelectorAll('.discount-presets button')].find(b=>b.textContent==='20%');preset.click();await new Promise(r=>setTimeout(r,400));assert.equal(saved.homeBack.slots[0].discountPercent,20);assert.equal(saved.homeBack.slots[1].discountPercent,0);
 // Every active template initializes and renders without a missing slot reference.
 for(let i=0;i<4;i++){w.document.querySelectorAll('.template-card')[i].click();await new Promise(r=>setTimeout(r,80));w.flashSaleActions.openSlot(0);const size=w.document.querySelector('#slotText-sale');size.value=120;size.dispatchEvent(new w.Event('input'));await new Promise(r=>setTimeout(r,80));}
 assert.equal(errors.length,0,errors.join('\n'));dom.window.close();console.log('PASS: independent text sizes, canvas sizes, saved overrides, sibling isolation, search, inspector, discount presets, all four templates.');
})().catch(e=>{console.error(e);process.exitCode=1});
