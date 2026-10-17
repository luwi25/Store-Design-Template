const fs=require('fs'),assert=require('assert/strict'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('public/index.html','utf8');
(async()=>{
 const dom=new JSDOM(html,{url:'https://example.test/',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;const errors=[];
 w.console.error=(...args)=>errors.push(args.map(String).join(' '));w.console.warn=()=>{};
 w.structuredClone=structuredClone;w.matchMedia=()=>({matches:false,addEventListener(){}});w.scrollTo=()=>{};w.confirm=()=>true;w.document.fonts={load:async()=>[]};
 w.Image=class{constructor(){this.width=this.naturalWidth=1280;this.height=this.naturalHeight=1924}set src(v){queueMicrotask(()=>this.onload?.())}};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
 w.HTMLCanvasElement.prototype.toDataURL=()=> 'data:image/png;base64,YWJj';
 w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({canvas:this,font:'',measureText:t=>({width:String(t).length*5}),fillText(){},drawImage(){}}, {get:(o,k)=>k in o?o[k]:(()=>{})})};
 const source=JSON.parse(fs.readFileSync('defaults/project.json','utf8')).state;
 let removeBgCalls=0;
 w.StoreDatabase={load:async()=>structuredClone(source),save:async()=>{},preserveLegacy:async()=>{},removeBackground:async(image)=>{removeBgCalls++;return {image:'data:image/png;base64,Y3V0b3V0',width:10,height:10}}};
 w.eval([...w.document.querySelectorAll('script')].find(s=>s.textContent.includes('function renderPoster')).textContent);
 await new Promise(r=>setTimeout(r,700));assert.equal(errors.length,0,errors.join('\n'));

 // Button exists in the toolbar, dialog starts closed.
 const btn=w.document.querySelector('#bgRemoverBtn');assert(btn,'bgRemoverBtn missing');
 const dialog=w.document.querySelector('#bgRemoverDialog');assert(dialog,'bgRemoverDialog missing');
 assert.equal(dialog.open,false,'dialog should start closed');

 // jsdom's outside-only mode does not execute inline onclick="" attributes (same limitation the
 // project's own studio-review.cjs works around), so verify the wiring string, then call the action.
 assert.equal(btn.getAttribute('onclick'),'window.flashSaleActions.openBgRemover()','button onclick wiring');
 w.flashSaleActions.openBgRemover();
 assert.equal(dialog.open,true,'dialog should open');
 const toolsHolder=w.document.querySelector('#bgRemoverTools');
 const removeBtn=[...toolsHolder.querySelectorAll('button')].find(b=>b.dataset.action==='remove-background');
 assert(removeBtn,'Remove background button should be mounted');
 assert.equal(removeBtn.disabled,true,'Remove background should be disabled with no image loaded');
 const preview=toolsHolder.querySelector('.cutout-preview');
 assert.equal(preview.hidden,true,'preview should be hidden with no image');

 // Simulate choosing a file.
 const fileInput=w.document.querySelector('#bgRemoverFile');
 const file=new w.File(['fake-bytes'],'photo.png',{type:'image/png'});
 Object.defineProperty(fileInput,'files',{value:[file],configurable:true});
 fileInput.dispatchEvent(new w.Event('change',{bubbles:true}));
 await new Promise(r=>setTimeout(r,300));
 assert.equal(errors.length,0,errors.join('\n'));
 assert.equal(preview.hidden,false,'preview should show after choosing a file');
 assert.equal(removeBtn.disabled,false,'Remove background should enable after choosing a file');

 // Click Remove background and verify it calls the (stubbed) removal endpoint and updates the preview.
 removeBtn.click();
 await new Promise(r=>setTimeout(r,300));
 assert.equal(errors.length,0,errors.join('\n'));
 assert.equal(removeBgCalls,1,'removeBackground should be called once');
 assert.equal(preview.src,'data:image/png;base64,Y3V0b3V0','preview should show the cutout result');
 const restoreBtn=[...toolsHolder.querySelectorAll('button')].find(b=>b.dataset.action==='restore-background');
 assert.equal(restoreBtn.hidden,false,'Restore original should appear after a successful removal');

 // Closing and reopening clears the previous photo (standalone tool is not tied to any product).
 w.flashSaleActions.closeBgRemover();
 assert.equal(dialog.open,false);
 w.flashSaleActions.openBgRemover();
 const removeBtn2=[...w.document.querySelector('#bgRemoverTools').querySelectorAll('button')].find(b=>b.dataset.action==='remove-background');
 assert.equal(removeBtn2.disabled,true,'reopening should reset to no image loaded');

 dom.window.close();
 console.log('PASS: background remover button opens dialog, mounts tool, accepts upload, removes background, resets on reopen.');
})().catch(e=>{console.error(e);process.exitCode=1});
