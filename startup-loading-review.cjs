const fs=require('fs'),assert=require('assert/strict'),{JSDOM}=require('jsdom');
(async()=>{
 const dom=new JSDOM('',{url:'https://example.test/Store-Design-Template/',runScripts:'outside-only'}),w=dom.window;
 const hash='a'.repeat(64),marker={__defaultImage:'images/'+hash+'.png',mime:'image/png'};
 const requests=[];w.AbortSignal=AbortSignal;w.fetch=async url=>{requests.push(String(url));if(String(url).includes('project.json'))return {ok:true,json:async()=>({version:1,sourceRevision:7,state:{products:[{id:'one',image:marker}],slots:[]}})};throw Error('Unexpected image download at startup')};
 w.eval(fs.readFileSync('default-project.js','utf8'));
 const state=await w.loadPublishedDefault();assert.equal(requests.length,1);assert.equal(state.products[0].image,'defaults/images/'+hash+'.png');assert.equal(state.publishedProjectRevision,7);
 w.eval(fs.readFileSync('portable-backup.js','utf8'));let imageFetches=0;
 w.fetch=async()=>{imageFetches++;return {ok:true,blob:async()=>new w.Blob(['original-pixels'],{type:'image/png'})}};
 const original={products:[{name:'Same name',price:99,image:state.products[0].image}],slots:[{image:state.products[0].image,textSizes:{name:110}}]};
 const backup=await w.preparePortableBackup(original);assert.equal(imageFetches,1);assert(backup.products[0].image.startsWith('data:image/png;base64,'));assert.equal(backup.slots[0].image,backup.products[0].image);assert.equal(backup.products[0].name,'Same name');assert.equal(backup.products[0].price,99);assert.equal(backup.slots[0].textSizes.name,110);assert.equal(original.products[0].image,state.products[0].image);
 w.fetch=async()=>({ok:false});await assert.rejects(w.preparePortableBackup(original),/backup image could not load/);
 dom.window.close();console.log('PASS: metadata-only startup; portable backup embeds originals once, preserves fields and rejects missing images.');
})().catch(e=>{console.error(e);process.exitCode=1});
