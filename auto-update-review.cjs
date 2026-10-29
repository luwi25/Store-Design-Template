const fs=require('fs'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
async function scenario(controlled){
 const dom=new JSDOM('<div class="app"><div class="top-actions"></div><button id="printBtn"></button><input id="edit"><dialog id="dialog"></dialog></div>',{url:'https://example.test/',runScripts:'outside-only'}),w=dom.window;
 const sw=new w.EventTarget();sw.controller=controlled?{}:null;sw.register=async()=>({active:{},update:async()=>{}});sw.ready=Promise.resolve({});Object.defineProperty(w.navigator,'serviceWorker',{value:sw});
 let reloads=0,ready=true;const timers=[];w.__reload=()=>reloads++;w.flashSaleActions={canReloadForUpdate:()=>ready};w.setInterval=fn=>{timers.push(fn);return timers.length};w.matchMedia=()=>({matches:false});Object.defineProperty(w.document,'hidden',{value:false,configurable:true});
 w.eval(fs.readFileSync('install-app.js','utf8').replaceAll('location.reload()','window.__reload()'));
 await Promise.resolve();await Promise.resolve();
 const tick=()=>timers.forEach(fn=>fn());
 const change=()=>{sw.controller={};sw.dispatchEvent(new w.Event('controllerchange'))};
 return {w,dom,tick,change,get reloads(){return reloads},set ready(v){ready=v}};
}
(async()=>{
 let s=await scenario(true);s.ready=false;s.change();s.tick();assert.equal(s.reloads,0,'Unsaved edits block reload');assert.equal(s.w.document.getElementById('appUpdateReady'),null,'No manual update button');
 s.ready=true;s.tick();assert.equal(s.reloads,1,'Automatically reload once safe');s.change();s.tick();assert.equal(s.reloads,1,'Reload only once');s.dom.window.close();
 s=await scenario(false);s.change();s.tick();assert.equal(s.reloads,0,'First offline installation must not reload');s.change();s.tick();assert.equal(s.reloads,1);s.dom.window.close();
 s=await scenario(true);const dialog=s.w.document.getElementById('dialog');dialog.open=true;s.change();s.tick();assert.equal(s.reloads,0);dialog.open=false;
 s.w.document.getElementById('edit').focus();s.tick();assert.equal(s.reloads,0);s.w.document.getElementById('edit').blur();
 s.w.document.body.classList.add('printing-top');s.tick();assert.equal(s.reloads,0);s.w.document.body.classList.remove('printing-top');
 s.w.document.getElementById('printBtn').disabled=true;s.tick();assert.equal(s.reloads,0);s.w.document.getElementById('printBtn').disabled=false;
 Object.defineProperty(s.w.navigator,'onLine',{value:false,configurable:true});s.tick();assert.equal(s.reloads,0);Object.defineProperty(s.w.navigator,'onLine',{value:true});s.tick();assert.equal(s.reloads,1);s.dom.window.close();
 s=await scenario(true);delete s.w.flashSaleActions;s.change();s.tick();assert.equal(s.reloads,0,'Wait for editor startup');s.dom.window.close();
 console.log('PASS: automatic deployment refresh, no update button, safe editing/printing/offline guards, first install and reload-loop prevention.');
})().catch(e=>{console.error(e);process.exitCode=1});
