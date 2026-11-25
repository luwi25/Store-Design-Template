const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Blob,fetch:async()=>({ok:true,blob:async()=>new Blob(['photo'])}),FileReader:class{readAsDataURL(){this.result='data:image/png;base64,cGhvdG8=';queueMicrotask(()=>this.onload())}}};
vm.runInNewContext(fs.readFileSync('portable-backup.js','utf8'),context);
(async()=>{
 const small={products:[{name:'Quotes " and unicode ₱',image:null}],nested:[undefined,NaN,false],ignored:undefined};
 assert.equal(await context.window.portableBackupBlob(small).text(),JSON.stringify(small));
 const path='defaults/images/'+'a'.repeat(64)+'.png',state={products:[{image:path}],slot:{image:path}},progress=[];
 const prepared=await context.window.preparePortableBackup(state,(done,total)=>progress.push([done,total]));
 assert.equal(prepared.products[0].image,prepared.slot.image);assert.equal(state.slot.image,path);assert.deepEqual(progress,[[0,1],[1,1]]);
 context.fetch=async()=>({ok:false});await assert.rejects(context.window.preparePortableBackup(state),/could not load/);
 // Exceeds V8's single-string limit with repeated photos, like the full catalog.
 const photo='x'.repeat(3*1024*1024),large=Array(180).fill(photo);
 assert.throws(()=>JSON.stringify(large),/Invalid string length/);
 const backup=context.window.portableBackupBlob(large);assert.equal(backup.size,180*(photo.length+3)+1);
 console.log('PASS: portable image hydration, progress, failure preservation, JSON compatibility and backup larger than the browser string limit.');
})().catch(error=>{console.error(error);process.exitCode=1});
