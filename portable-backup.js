/* Keep backups self-contained without building one enormous JSON string. */
window.preparePortableBackup=async function(state,onProgress=()=>{}){
 const copies=new Map(),paths=new Set();
 const isAsset=value=>typeof value==='string'&&/^(?:\.\/)?(?:defaults\/images|assets)\/[a-f0-9]{64}\.(?:png|jpg|webp|svg)$/.test(value);
 function collect(value){
  if(isAsset(value))paths.add(value);
  else if(value&&typeof value==='object')for(const item of Object.values(value))collect(item);
 }
 collect(state);const queue=[...paths];let next=0,done=0;
 onProgress(done,queue.length);
 async function worker(){
  while(next<queue.length){
   const path=queue[next++],response=await fetch(path);
   if(!response.ok)throw Error('A backup image could not load. Connect to the internet and retry.');
   const blob=await response.blob();
   const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)});
   copies.set(path,data);onProgress(++done,queue.length);
  }
 }
 await Promise.all(Array.from({length:Math.min(4,queue.length)},worker));
 function visit(value){
  if(isAsset(value))return copies.get(value);
  if(Array.isArray(value))return value.map(visit);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,visit(item)]));
  return value;
 }
 return visit(state);
};
window.portableBackupBlob=function(state){
 const parts=[];
 function write(value,inArray=false){
  if(value===undefined||typeof value==='function'||typeof value==='symbol'){if(inArray)parts.push('null');return}
  if(value===null||typeof value!=='object'){parts.push(JSON.stringify(value));return}
  if(Array.isArray(value)){
   parts.push('[');for(let i=0;i<value.length;i++){if(i)parts.push(',');write(value[i],true)}parts.push(']');
  }else{
   parts.push('{');let first=true;
   for(const [key,item] of Object.entries(value)){
    if(item===undefined||typeof item==='function'||typeof item==='symbol')continue;
    if(!first)parts.push(',');first=false;parts.push(JSON.stringify(key),':');write(item);
   }
   parts.push('}');
  }
 }
 write(state);return new Blob(parts,{type:'application/json'});
};
