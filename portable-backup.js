/* Keep backups self-contained while normal editing uses lightweight image URLs. */
window.preparePortableBackup=async function(state){
 const copies=new Map();
 async function image(value){
  if(!copies.has(value))copies.set(value,(async()=>{
   const response=await fetch(value);if(!response.ok)throw Error('A backup image could not load. Connect to the internet and retry.');
   const blob=await response.blob();return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)});
  })());
  return copies.get(value);
 }
 async function visit(value){
  if(typeof value==='string'&&/^(?:\.\/)?(?:defaults\/images|assets)\/[a-f0-9]{64}\.(?:png|jpg|webp|svg)$/.test(value))return image(value);
  if(Array.isArray(value)){const result=[];for(const item of value)result.push(await visit(item));return result}
  if(value&&typeof value==='object'){const result={};for(const [key,item] of Object.entries(value))result[key]=await visit(item);return result}
  return value;
 }
 return visit(state);
};
