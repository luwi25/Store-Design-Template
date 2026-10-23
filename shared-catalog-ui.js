/* Loaded with the editor; all credentials stay inside one submit call. */
window.setupSharedCatalogPublishing=function({getState,getMode,save,render}){
 const service=window.SharedCatalog;if(!service)return null;
 const toolbar=document.querySelector('.top-actions');
 const button=document.createElement('button');button.id='publishCatalog';button.type='button';button.className='btn';toolbar.append(button);
 const dialog=document.createElement('dialog');dialog.id='publishCatalogDialog';dialog.className='catalog-publish-dialog';dialog.setAttribute('aria-labelledby','publishCatalogTitle');
 dialog.innerHTML='<form class="catalog-publish-form"><h2 id="publishCatalogTitle">Publish catalog changes</h2><p>Share these product edits with everyone after the website finishes deploying. The next sales sync will still get prices from UBEST.</p><ul data-changes></ul><p class="helper">Only edits made in All Stores are included. Product placement, discounts and text settings stay separate.</p><label for="catalogPublishToken">Restricted GitHub token</label><input id="catalogPublishToken" type="password" autocomplete="off" spellcheck="false" required placeholder="Enter token for this publication"><p class="helper">Use a fine-grained token for luwi25/Store-Design-Template with Contents: Read and write. It is cleared after use and never saved in your project.</p><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">Create a restricted token on GitHub</a><p data-status role="status" aria-live="polite"></p><div data-result></div><div class="catalog-publish-actions"><button type="button" class="btn" data-discard>Clear pending list</button><button type="button" class="btn" data-close>Cancel</button><button type="submit" class="btn btn-dark" data-submit>Publish changes</button></div></form>';
 document.body.append(dialog);
 const form=dialog.querySelector('form'),input=dialog.querySelector('input'),status=dialog.querySelector('[data-status]'),submit=dialog.querySelector('[data-submit]');
 let busy=false,trigger=null;
 function changes(){const draft=getState().sharedCatalogDraft;return draft?.version===1&&Array.isArray(draft.changes)?draft.changes:[]}
 function refresh(){button.hidden=getMode()!=='all';button.textContent='Publish changes'+(changes().length?' ('+changes().length+')':'');button.disabled=busy}
 function record(product,field,value){
  if(getMode()!=='all'||!product||!service.fields.includes(field))return;
  if((product[field]??null)===value)return;
  const state=getState();state.sharedCatalogDraft ||= {version:1,changes:[]};
  if(state.sharedCatalogDraft.version!==1||!Array.isArray(state.sharedCatalogDraft.changes))throw Error('Invalid publishing draft.');
  const list=state.sharedCatalogDraft.changes;
  let entry=list.find(item=>item.identity.id===product.id);
  if(!entry){entry={identity:{id:product.id,name:product.name,code:product.code||'',templateId:product.templateId||''},fields:{}};list.push(entry)}
  const before=entry.fields[field]?entry.fields[field].before:structuredClone(product[field]??null);
  if(before===value)delete entry.fields[field];else entry.fields[field]={before,after:structuredClone(value)};
  if(!Object.keys(entry.fields).length)list.splice(list.indexOf(entry),1);
  // Carry the catalog change to existing overrides so repeated products agree.
  service.apply(state,product,field,value,true);
  refresh();
 }
 function summary(){
  const list=dialog.querySelector('[data-changes]');list.replaceChildren();
  for(const edit of changes()){
   const item=document.createElement('li'),title=document.createElement('strong');title.textContent=edit.fields.name?.after||edit.identity.name;
   item.append(title);
   for(const [field,change] of Object.entries(edit.fields)){
    const detail=document.createElement('div');
    detail.textContent=field==='image'?'Photo replaced':field==='price'?'Original price: ₱'+change.before+' → ₱'+change.after:'Name: '+change.before+' → '+change.after;
    item.append(detail);
   }
   list.append(item);
  }
  submit.disabled=!changes().length;
  if(!changes().length)status.textContent='Edit a product name, original price or photo in All Stores to prepare a publication.';
 }
 button.onclick=()=>{
  trigger=document.activeElement;input.value='';status.textContent='';dialog.querySelector('[data-result]').replaceChildren();summary();dialog.showModal();
 };
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();
 dialog.querySelector('[data-discard]').onclick=()=>{
  if(!confirm('Clear the pending publishing list? Your local product edits will remain.'))return;
  delete getState().sharedCatalogDraft;save();refresh();summary();
 };
 dialog.addEventListener('cancel',event=>{input.value='';if(busy)event.preventDefault()});
 dialog.addEventListener('close',()=>{input.value='';trigger?.focus()});
 form.onsubmit=async event=>{
  event.preventDefault();if(busy||getMode()!=='all'||!changes().length)return;
  let token=input.value;input.value='';if(!token.trim()){status.textContent='Enter a restricted GitHub token.';input.focus();return}
  busy=true;const app=document.querySelector('.app'),previous=app.inert;app.inert=true;
  dialog.setAttribute('aria-busy','true');for(const control of form.querySelectorAll('button,input'))control.disabled=true;
  try{
   const result=await service.publish(structuredClone(changes()),token,text=>status.textContent=text);
   delete getState().sharedCatalogDraft;save();render();
   status.textContent=result.unchanged?'These edits are already in the published catalog.':'Saved to GitHub. The website deployment is now pending; shared changes become live when it succeeds.';
   if(result.url){
    const commit=document.createElement('a');commit.href=result.url;commit.textContent='View saved changes';commit.target='_blank';commit.rel='noopener noreferrer';
    const deployment=document.createElement('a');deployment.href='https://github.com/luwi25/Store-Design-Template/actions/workflows/pages.yml';deployment.textContent='View deployment status';deployment.target='_blank';deployment.rel='noopener noreferrer';
    dialog.querySelector('[data-result]').append(commit,document.createTextNode(' · '),deployment);
   }
  }catch(error){status.textContent=error.message||'Publishing failed. Your pending edits are still saved here.'}
  finally{
   token='';input.value='';busy=false;app.inert=previous;dialog.removeAttribute('aria-busy');for(const control of form.querySelectorAll('button,input'))control.disabled=false;submit.disabled=!changes().length;refresh();
  }
 };
 // Readers can explicitly load the new owner-published data without interrupting editing.
 const update=document.createElement('button');update.id='sharedCatalogUpdate';update.type='button';update.className='btn';update.hidden=true;update.textContent='Published catalog updated';toolbar.append(update);
 update.onclick=()=>document.getElementById('restorePublishedDefaults')?.click();
 let checking=false;
 async function check(){
  if(checking||document.hidden||navigator.onLine===false||busy||typeof window.fetchPublishedRevision!=='function')return;
  const current=getState().publishedProjectRevision;if(typeof current!=='number')return;
  checking=true;try{const latest=await window.fetchPublishedRevision();update.hidden=!(latest>current)}catch{}finally{checking=false}
 }
 setInterval(check,60000);window.addEventListener('online',check);document.addEventListener('visibilitychange',check);
 refresh();return {record,refresh};
};
