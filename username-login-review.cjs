const fs=require('fs'),assert=require('assert/strict'),{JSDOM}=require('jsdom');
(async()=>{
 for(const username of ['admin','HOME EXPRESS BASAK','pesoplus-mambaling','sheldon-pinamungajan','mandarin-catmon','mandarin-dalaguete','bestco-tuburan','ginsey-sibonga']){
 const dom=new JSDOM(fs.readFileSync('public/index.html','utf8'),{url:'https://example.test',runScripts:'outside-only'}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.AbortSignal=AbortSignal;
 w.STORE_ACTIVITY_CONFIG={enabled:true,apiBase:'https://example.test/api'};let calls=[];
 w.fetch=async(url,options)=>{const data=JSON.parse(options.body);calls.push(data);return {ok:data.password==='correct-password',status:401,json:async()=>data.password==='correct-password'?{store:data.store,token:'a'.repeat(64)}:{error:'Incorrect password.'}}};
 w.eval(fs.readFileSync('store-activity.js','utf8'));w.eval(fs.readFileSync('startup-gate.js','utf8'));
 const d=w.document,f=d.getElementById('storePasswordGate');assert.equal(d.querySelectorAll('#storeChooserDialog [data-store]').length,0);assert.equal(f.hidden,false);
 d.getElementById('storeUsername').value='unknown';d.getElementById('storePassword').value='wrong';f.dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(calls.length,0);
 d.getElementById('storeUsername').value=username;f.dispatchEvent(new w.Event('submit',{cancelable:true}));await new Promise(r=>setTimeout(r,10));assert.equal(d.getElementById('storePasswordError').textContent,'Incorrect username or password.');assert.equal(d.getElementById('storeChooserDialog').open,true);
 d.getElementById('storePassword').value='correct-password';f.dispatchEvent(new w.Event('submit',{cancelable:true}));const choice=await w.StoreStartup.ready;assert.equal(choice,w.StoreActivity.resolveUsername(username));assert.equal(d.getElementById('storeChooserDialog').open,false);assert.equal(d.getElementById('storePassword').value,'');dom.window.close();
 }
 console.log('PASS: username-only sign-in, Admin/store mapping, invalid credentials, retry and session selection.');
})().catch(e=>{console.error(e);process.exit(1)});
