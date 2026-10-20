/* Device-only storage. No network requests or shared database. */
window.StoreDatabase = (() => {
  let opening, revision = 0;
  // Reuse encoded assets across text-only saves; refresh membership after GC.
  const packedImages = new Map();
  let persistedImages = new Set();
  const message = error => {
    if (error?.name === 'QuotaExceededError') return Error('Device storage is full. Download a backup, then remove unused images or free disk space.');
    return error || Error('Browser storage could not be opened. Allow site storage and retry.');
  };
  function open() {
    if (!opening) opening = new Promise((resolve, reject) => {
      const request = indexedDB.open('store-design-template-device', 1);
      request.onupgradeneeded = () => {for (const name of ['project','assets','backups']) request.result.createObjectStore(name)};
      request.onerror = () => {opening = null; reject(message(request.error))};
      request.onblocked = () => {opening = null; reject(Error('Close other tabs of this editor and reload to open device storage.'))};
      request.onsuccess = () => {const db=request.result;db.onversionchange=()=>{db.close();opening=null};resolve(db)};
    });
    return opening;
  }
  function read(request) {return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(message(request.error))})}
  function dataURL(blob) {return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)})}
  async function pack(value, assets, seen) {
    if (typeof value === 'string' && /^data:image\/[^;]+;base64,/.test(value)) {
      if (seen.has(value)) return {__deviceImage:seen.get(value)};
      const cached=packedImages.get(value);
      if(cached){if(!persistedImages.has(cached.key))assets.set(cached.key,cached.blob);seen.set(value,cached.key);return {__deviceImage:cached.key}}
      const comma=value.indexOf(','),raw=atob(value.slice(comma+1)),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
      const mime=value.slice(5,value.indexOf(';')),hash=await crypto.subtle.digest('SHA-256',bytes);
      const key=mime+':'+Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
      const blob=new Blob([bytes],{type:mime});packedImages.set(value,{key,blob});
      if(!persistedImages.has(key))assets.set(key,blob);seen.set(value,key);return {__deviceImage:key};
    }
    if (Array.isArray(value)) {const result=[];for(const item of value)result.push(await pack(item,assets,seen));return result}
    if (value && typeof value==='object') {const result={};for(const [key,item] of Object.entries(value))result[key]=await pack(item,assets,seen);return result}
    return value;
  }
  function refs(value, set=new Set()) {
    if (value && typeof value==='object') {
      if (Object.keys(value).length===1 && value.__deviceImage) set.add(value.__deviceImage);
      else for(const item of Object.values(value))refs(item,set);
    }
    return set;
  }
  async function unpack(value, images) {
    if (value && typeof value==='object') {
      if(Object.keys(value).length===1 && value.__deviceImage){if(!images.has(value.__deviceImage))throw Error('A saved image is missing. Import your last backup.');return images.get(value.__deviceImage)}
      if(Array.isArray(value))return Promise.all(value.map(item=>unpack(item,images)));
      const result={};for(const [key,item] of Object.entries(value))result[key]=await unpack(item,images);return result;
    }
    return value;
  }
  return {
    async load() {
      const db=await open(),tx=db.transaction(['project','assets'],'readonly');
      const record=await read(tx.objectStore('project').get('current'));revision=record?.revision||0;
      if(!record)return null;
      const imageTx=db.transaction('assets','readonly'),requests=[...refs(record.state)].map(key=>[key,read(imageTx.objectStore('assets').get(key))]);
      packedImages.clear();persistedImages=new Set();
      const images=new Map(await Promise.all(requests.map(async([key,promise])=>{const blob=await promise;if(!blob)throw Error('A saved image is missing. Import your last backup.');const value=await dataURL(blob);packedImages.set(value,{key,blob});persistedImages.add(key);return [key,value]})));
      return unpack(record.state,images);
    },
    async save(state) {
      const assets=new Map(),packed=await pack(state,assets,new Map()),db=await open();
      await new Promise((resolve,reject)=>{
        const tx=db.transaction(['project','assets','backups'],'readwrite');let failure,nextRevision,retainedKeys;
        tx.oncomplete=()=>{revision=nextRevision;persistedImages=retainedKeys;for(const [value,asset] of packedImages)if(!retainedKeys.has(asset.key))packedImages.delete(value);resolve()};tx.onerror=()=>reject(message(failure||tx.error));tx.onabort=()=>reject(message(failure||tx.error));
        const projects=tx.objectStore('project'),backups=tx.objectStore('backups'),store=tx.objectStore('assets');
        const current=projects.get('current');current.onsuccess=()=>{
          if((current.result?.revision||0)!==revision){failure=Object.assign(Error('Another tab saved newer changes. Download your edits as a backup, then reload.'),{status:409});tx.abort();return}
          const previous=backups.get('previous');previous.onsuccess=()=>{
            if(previous.result)backups.put(previous.result,'older');
            if(current.result)backups.put(current.result,'previous');
            nextRevision=revision+1;projects.put({revision:nextRevision,state:packed},'current');
            for(const [key,blob] of assets)store.put(blob,key);
            const legacy=backups.get('legacy');legacy.onsuccess=()=>{
              const keep=refs([packed,current.result?.state,previous.result?.state,legacy.result?.state]);
              retainedKeys=keep;
              const cursor=store.openCursor();cursor.onsuccess=()=>{const item=cursor.result;if(item){if(!keep.has(item.key))item.delete();item.continue()}};
            };
          };
        };
      });
    },
    async preserveLegacy(state) {
      const db=await open();if(await read(db.transaction('backups').objectStore('backups').get('legacy')))return;
      const assets=new Map(),packed=await pack(state,assets,new Map());
      await new Promise((resolve,reject)=>{const tx=db.transaction(['assets','backups'],'readwrite');tx.oncomplete=resolve;tx.onerror=()=>reject(message(tx.error));tx.onabort=()=>reject(message(tx.error));for(const [key,blob] of assets)tx.objectStore('assets').put(blob,key);tx.objectStore('backups').put({state:packed},'legacy')});
    },
    async removeBackground(image) {return window.removeBackgroundLocally(image)}
  };
})();
