const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {indexedDB}=require('fake-indexeddb');
class FileReader {readAsDataURL(blob){blob.arrayBuffer().then(b=>{this.result=`data:${blob.type};base64,${Buffer.from(b).toString('base64')}`;this.onload()})}}
function tab(){const context={window:{},indexedDB,FileReader,Blob,crypto:require('node:crypto').webcrypto,atob,Uint8Array,Map,Set,Error};vm.createContext(context);vm.runInContext(fs.readFileSync('browser-db.js','utf8'),context);return context.window.StoreDatabase}
(async()=>{
 const a=tab(),b=tab();assert.equal(await a.load(),null);
 const original={products:[{id:'one',image:'data:image/png;base64,YWJj'}],templates:[]};
 await a.save(original);assert.equal((await b.load()).products[0].image,original.products[0].image);
 const changed={products:[{id:'one',image:'data:image/png;base64,ZGVm'}],templates:[]};
 await a.save(changed);await assert.rejects(b.save(original),error=>error.status===409);
 assert.equal((await tab().load()).products[0].image,changed.products[0].image);
 await a.save({products:[],templates:[]});await a.save({products:[],templates:[]});await a.save({products:[],templates:[]});
 const db=await new Promise(resolve=>{const r=indexedDB.open('store-design-template-device');r.onsuccess=()=>resolve(r.result)});
 const assets=await new Promise(resolve=>{const r=db.transaction('assets').objectStore('assets').count();r.onsuccess=()=>resolve(r.result)});assert.equal(assets,0);
 await a.preserveLegacy(original);assert.equal((await a.load()).products.length,0);
 db.close();console.log('PASS: image save/reload, tab conflict prevention, recovery retention and old-image garbage collection, legacy preservation.');
})().catch(e=>{console.error(e);process.exitCode=1});
