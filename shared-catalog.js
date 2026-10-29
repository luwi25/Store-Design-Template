/* Catalog fields and saved template replacements. Credentials never enter drafts. */
(function(root){
 'use strict';
 const REPO='luwi25/Store-Design-Template', API='https://api.github.com/repos/'+REPO;
 const fields=['name','price','image'];
 const templateSections={'home-collection':'homeCollection','home-collection-front':'homeCollectionFront','home-back':'homeBack','home-everyday':'everyday','peso-back':'pesoBack','peso-collection-front':'pesoCollectionFront','peso-collection-back':'pesoCollectionBack','alkeia-talamban-front':'alkeiaFront','alkeia-talamban-back':'alkeiaBack','peso-plus':'peso','home-express':'approved','home-bestsellers':'bestsellers'};
 function templateSlots(state,id){return Object.hasOwn(templateSections,id)?state[templateSections[id]]?.slots:null}
 const clone=value=>structuredClone(value);
 const code=p=>String(p.code||'').trim().toLowerCase();
 function store(p){
  if(p.sharedCatalog)return 'shared';
  if(String(p.id).startsWith('sales-heb-')||String(p.templateId).startsWith('home-'))return 'home';
  if(String(p.id).startsWith('sales-ppm-')||String(p.templateId).startsWith('peso-'))return 'peso';
  return 'shared';
 }
 function slots(value,visit){
  if(!value||typeof value!=='object')return;
  if(Object.hasOwn(value,'productId'))visit(value);
  for(const [key,item] of Object.entries(value))if(key!=='products'&&key!=='sharedCatalogDraft')slots(item,visit);
 }
 function apply(state,product,field,value,preserveOriginal=false){
  product[field]=clone(value);
  slots(state,slot=>{
   if(slot.productId!==product.id)return;
   if(field==='image'){slot.image=clone(value);if(!preserveOriginal)slot.imageOriginal=null}
   else if(slot.details&&Object.hasOwn(slot.details,field))slot.details[field]=value;
  });
  if(field==='image'){
   if(!preserveOriginal)product.imageOriginal=null;product.photoSource='admin-upload';delete product.photoApproval;
  }
 }
 async function digest(bytes){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('')}
 function imageBytes(value){
  const m=typeof value==='string'&&value.match(/^data:image\/(png|jpeg|webp|svg\+xml);base64,([A-Za-z0-9+/=\s]+)$/);
  if(!m)throw Error('Use an uploaded PNG, JPEG or WebP product photo.');
  const raw=atob(m[2]),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
  return {bytes,mime:'image/'+m[1],ext:{png:'png',jpeg:'jpg',webp:'webp','svg+xml':'svg'}[m[1]],base64:m[2].replace(/\s/g,'')};
 }
 async function imageKey(value){
  if(!value)return '';
  if(value.__defaultImage)return value.__defaultImage;
  if(typeof value==='string'&&value.startsWith('data:')){const im=imageBytes(value);return 'images/'+await digest(im.bytes)+'.'+im.ext}
  return String(value);
 }
 async function same(field,a,b){return field==='image'?(await imageKey(a))===(await imageKey(b)):a===b}
 async function encodeImage(value){
  if(value===null)return {value:null};
  const im=imageBytes(value),b=im.bytes;
  const valid=(im.ext==='png'&&[137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v))||
   (im.ext==='jpg'&&b[0]===255&&b[1]===216&&b[2]===255)||
   (im.ext==='webp'&&String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP');
  if(!valid||b.length>5*1024*1024)throw Error('Product photos must be valid PNG, JPEG or WebP files up to 5 MB.');
  const path='images/'+await digest(b)+'.'+im.ext;
  return {value:{__defaultImage:path,mime:im.mime},path:'defaults/'+path,content:im.base64};
 }
 function match(products,identity){
  const exact=products.find(p=>p.id===identity.id);
  if(exact&&code(exact)===code(identity)&&store(exact)===store(identity))return exact;
  if(!code(identity))throw Error('This product is not in the published catalog: '+identity.name+'. Publish an existing catalog product.');
  const matches=products.filter(p=>code(p)===code(identity)&&store(p)===store(identity));
  if(matches.length!==1)throw Error('No unique published catalog match for '+identity.name+'. Check its stock code and store.');
  return matches[0];
 }
 async function prepare(project,changes){
  if(project.version!==1||!Array.isArray(project.state?.products)||!Number.isSafeInteger(project.sourceRevision))throw Error('The published catalog format is invalid.');
  const next=clone(project),images=new Map(),resolved=new Map();let count=0;
  for(const change of changes.filter(change=>!['replacement','visibility'].includes(change.kind))){
   if(!change.identity||!change.fields)throw Error('Invalid publishing draft.');
   const product=match(next.state.products,change.identity);
   for(const [field,edit] of Object.entries(change.fields)){
    if(!fields.includes(field))throw Error('Only names, original prices and photos can be published.');
    const key=product.id+':'+field;
    if(resolved.has(key)&&!await same(field,resolved.get(key),edit.after))throw Error('Two edits target the same product. Resolve the duplicate before publishing.');
    resolved.set(key,edit.after);
    if(field==='name'&&(typeof edit.after!=='string'||!edit.after.trim()||edit.after.length>160))throw Error('Enter a product name between 1 and 160 characters.');
    if(field==='price'&&(typeof edit.after!=='number'||!Number.isFinite(edit.after)||edit.after<0))throw Error('Enter a valid original price.');
    if(await same(field,product[field]??null,edit.after))continue;
    if(!await same(field,product[field]??null,edit.before))throw Error(product.name+': the published '+field+' changed since this edit. Restore the latest published template and reapply your edit. Your pending changes are still saved here.');
    let value=edit.after;
    if(field==='image'){const encoded=await encodeImage(value);value=encoded.value;if(encoded.path)images.set(encoded.path,encoded.content)}
    apply(next.state,product,field,value);count++;
   }
  }
  const replaced=new Set();
  for(const change of changes.filter(change=>change.kind==='replacement')){
   const list=templateSlots(next.state,change.templateId),index=change.slotIndex;
   if(!Array.isArray(list)||!Number.isSafeInteger(index)||index<0||index>=list.length||!change.before||!change.after)throw Error('Invalid template replacement. Reload the published template and select the product again.');
   const key=change.templateId+':'+index;
   if(replaced.has(key))throw Error('Two replacements target the same template position. Save the product again.');
   replaced.add(key);
   const slot=list[index],replacement=match(next.state.products,change.after);
   if(list.length!==change.slotCount||(slot.group??null)!==change.group)throw Error('The published template layout changed. Reload the latest template before replacing this product.');
   if(slot.productId===replacement.id)continue;
   if((slot.productId??null)!==(change.before.id??null))throw Error('The product in this published template position changed since your edit. Reload the latest template and reapply the replacement.');
   slot.productId=replacement.id;slot.details=null;slot.image=null;slot.imageOriginal=null;count++;
  }
  const visibilityIds=new Set();
  for(const change of changes.filter(change=>change.kind==='visibility')){
   const id=change.templateId;
   if(typeof id!=='string'||(!Object.hasOwn(templateSections,id)&&!next.state.templates?.some(t=>t.id===id)))throw Error('Unknown template for visibility change.');
   if(typeof change.before!=='boolean'||typeof change.after!=='boolean'||visibilityIds.has(id))throw Error('Invalid template visibility change.');
   visibilityIds.add(id);
   const current=next.state.templateVisibility?.[id]!==false;
   if(current===change.after)continue;
   if(current!==change.before)throw Error('Template visibility changed since your edit. Reload and retry.');
   next.state.templateVisibility ||= {};
   next.state.templateVisibility[id]=change.after;count++;
  }
  if(count)next.sourceRevision++;
  return {project:next,images,count};
 }
 async function publish(changes,token,onProgress=()=>{},fetcher=fetch){
  // The token is scoped to this call; never return, persist or log it.
  token=token.trim();if(!token)throw Error('Enter a restricted GitHub token.');
  async function request(path,method='GET',body){
   let response;
   try{response=await fetcher(API+path,{method,cache:'no-store',signal:AbortSignal.timeout(30000),headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},...(body?{body:JSON.stringify(body)}:{})})}
   catch{throw Error('Could not reach GitHub. Reconnect and retry; your edits are still saved here.')}
   if(!response.ok){
    if(response.status===401||response.status===403)throw Error('GitHub denied publishing. Use a valid token restricted to this repository with Contents: Read and write.');
    if(response.status===409||response.status===422)throw Error('The repository changed or rejected this update. Retry to check the latest catalog; nothing was overwritten.');
    throw Error('GitHub request failed ('+response.status+'). Check repository access and retry.');
   }
   return response.json();
  }
  try{
   onProgress('Checking the latest published catalog…');
   const ref=await request('/git/ref/heads/main'),head=ref.object.sha;
   const commit=await request('/git/commits/'+head);
   const file=await request('/contents/defaults/project.json?ref='+head);
   // The contents endpoint omits base64 for large files; read its Git blob.
   const blob=file.content?file:await request('/git/blobs/'+file.sha);
   const bytes=Uint8Array.from(atob(blob.content.replace(/\s/g,'')),c=>c.charCodeAt(0));
   const prepared=await prepare(JSON.parse(new TextDecoder().decode(bytes)),changes);
   if(!prepared.count)return {unchanged:true,sha:head};
   const tree=[];let uploaded=0;
   for(const [path,content] of prepared.images){
    onProgress('Uploading product photos '+(++uploaded)+' / '+prepared.images.size+'…');
    const object=await request('/git/blobs','POST',{content,encoding:'base64'});
    tree.push({path,mode:'100644',type:'blob',sha:object.sha});
   }
   onProgress('Saving catalog changes to GitHub…');
   const data=await request('/git/blobs','POST',{content:JSON.stringify(prepared.project),encoding:'utf-8'});
   tree.push({path:'defaults/project.json',mode:'100644',type:'blob',sha:data.sha});
   const newTree=await request('/git/trees','POST',{base_tree:commit.tree.sha,tree});
   const saved=await request('/git/commits','POST',{message:'Publish shared catalog edits from Admin',tree:newTree.sha,parents:[head]});
   // force:false makes concurrent weekly-sync commits win instead of overwriting them.
   await request('/git/refs/heads/main','PATCH',{sha:saved.sha,force:false});
   return {sha:saved.sha,url:'https://github.com/'+REPO+'/commit/'+saved.sha,revision:prepared.project.sourceRevision};
  }finally{token=''}
 }
 const api={prepare,publish,apply,match,imageKey,fields,templateSlots};
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.SharedCatalog=api;
})(globalThis);
