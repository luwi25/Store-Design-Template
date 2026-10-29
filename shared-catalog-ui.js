/* Loaded with the editor; all credentials stay inside one submit call. */
window.setupSharedCatalogPublishing=function({getState,getMode,save,render,canApplyVisibility=()=>true}){
 const service=window.SharedCatalog;if(!service)return null;
 const toolbar=document.querySelector('.top-actions');
 const button=document.createElement('button');button.id='publishCatalog';button.type='button';button.className='btn btn-dark';toolbar.append(button);
 const dialog=document.createElement('dialog');dialog.id='publishCatalogDialog';dialog.className='catalog-publish-dialog';dialog.setAttribute('aria-labelledby','publishCatalogTitle');
 dialog.innerHTML='<form class="catalog-publish-form"><h2 id="publishCatalogTitle">Publish changes</h2><p>Share these product edits and template visibility choices with everyone after the website finishes deploying. The next sales sync will still get prices from UBEST.</p><ul data-changes></ul><p class="helper">Saved Admin catalog edits, product replacements and template visibility choices are included. Discounts, text settings and layouts stay separate.</p><label for="catalogPublishToken">Restricted GitHub token</label><input id="catalogPublishToken" type="password" autocomplete="off" spellcheck="false" required placeholder="Enter token for this publication"><p class="helper">Use a fine-grained token for luwi25/Store-Design-Template with Contents: Read and write. It is cleared after use and never saved in your project.</p><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">Create a restricted token on GitHub</a><p data-status role="status" aria-live="polite"></p><div data-result></div><div class="catalog-publish-actions"><button type="button" class="btn" data-discard>Clear pending list</button><button type="button" class="btn" data-close>Cancel</button><button type="submit" class="btn btn-dark" data-submit>Publish changes</button></div></form>';
 document.body.append(dialog);
 const form=dialog.querySelector('form'),input=dialog.querySelector('input'),status=dialog.querySelector('[data-status]'),submit=dialog.querySelector('[data-submit]');
 let busy=false,trigger=null;
 function changes(){const draft=getState().sharedCatalogDraft;return draft?.version===1&&Array.isArray(draft.changes)?draft.changes:[]}
 function refresh(){button.hidden=getMode()!=='all';button.textContent='Publish changes'+(changes().length?' ('+changes().length+')':'');button.disabled=busy;visibilityButton.hidden=getMode()!=='all';visibilityButton.disabled=busy}
 function record(product,field,value){
  if(getMode()!=='all'||!product||!service.fields.includes(field))return;
  if((product[field]??null)===value)return;
  const state=getState();state.sharedCatalogDraft ||= {version:1,changes:[]};
  if(state.sharedCatalogDraft.version!==1||!Array.isArray(state.sharedCatalogDraft.changes))throw Error('Invalid publishing draft.');
  const list=state.sharedCatalogDraft.changes;
  let entry=list.find(item=>!['replacement','visibility'].includes(item.kind)&&item.identity?.id===product.id);
  if(!entry){entry={identity:{id:product.id,name:product.name,code:product.code||'',templateId:product.templateId||''},fields:{}};list.push(entry)}
  const before=entry.fields[field]?entry.fields[field].before:structuredClone(product[field]??null);
  if(before===value)delete entry.fields[field];else entry.fields[field]={before,after:structuredClone(value)};
  if(!Object.keys(entry.fields).length)list.splice(list.indexOf(entry),1);
  // Carry the catalog change to existing overrides so repeated products agree.
  service.apply(state,product,field,value,true);
  refresh();
 }
 function recordReplacement(templateId,slotIndex,beforeSlot,product){
  if(getMode()!=='all'||beforeSlot.productId===product.id)return;
  const state=getState(),slots=service.templateSlots(state,templateId);
  if(!Array.isArray(slots)||slots[slotIndex]!==beforeSlot)throw Error('This template position cannot be published. Select the product again.');
  state.sharedCatalogDraft ||= {version:1,changes:[]};
  const draft=state.sharedCatalogDraft;if(draft.version!==1||!Array.isArray(draft.changes))throw Error('Invalid publishing draft.');
  const list=draft.changes;
  let entry=list.find(item=>item.kind==='replacement'&&item.templateId===templateId&&item.slotIndex===slotIndex);
  const identity=p=>({id:p.id,name:p.name,code:p.code||'',templateId:p.templateId||''});
  if(!entry){
   const previous=state.products.find(p=>p.id===beforeSlot.productId);
   entry={kind:'replacement',templateId,templateName:state.templateNames?.[templateId]||templateId,slotIndex,slotCount:slots.length,group:beforeSlot.group??null,before:previous?identity(previous):{id:beforeSlot.productId??null,name:'Empty position'}};
   list.push(entry);
  }
  entry.after=identity(product);
  if(entry.before.id===entry.after.id)list.splice(list.indexOf(entry),1);
  refresh();
 }
 function summary(){
  const list=dialog.querySelector('[data-changes]');list.replaceChildren();
  for(const edit of changes()){
   if(edit.kind==='visibility'){
    const item=document.createElement('li');item.textContent=(edit.templateName||edit.templateId)+': '+(edit.after?'Visible to store':'Hidden from store');list.append(item);continue;
   }
   if(edit.kind==='replacement'){
    const item=document.createElement('li'),title=document.createElement('strong'),detail=document.createElement('div');
    title.textContent=(edit.templateName||edit.templateId)+' · Product '+(edit.slotIndex+1);
    detail.textContent='Replace '+edit.before.name+' → '+edit.after.name;
    item.append(title,detail);list.append(item);continue;
   }
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
  if(!changes().length)status.textContent='In Admin, edit a product or choose a replacement from the catalog, then click Save product. Saved changes will appear here.';
 }
 button.onclick=()=>{
  trigger=document.activeElement;input.value='';status.textContent='';dialog.querySelector('[data-result]').replaceChildren();summary();dialog.showModal();
 };
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();
 dialog.querySelector('[data-discard]').onclick=()=>{
  if(!confirm('Clear the pending publishing list? Local product edits remain; unpublished visibility choices will be discarded.'))return;
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
 // Visibility is published separately from catalog fields, using the same atomic commit.
 const visibilityButton=document.createElement('button');visibilityButton.id='templateVisibilityButton';visibilityButton.type='button';visibilityButton.className='btn';visibilityButton.textContent='Template visibility';visibilityButton.hidden=true;toolbar.append(visibilityButton);
 const visibilityDialog=document.createElement('dialog');visibilityDialog.id='templateVisibilityDialog';visibilityDialog.className='catalog-publish-dialog';visibilityDialog.setAttribute('aria-labelledby','templateVisibilityTitle');
 visibilityDialog.innerHTML='<form class="catalog-publish-form"><div class="visibility-dialog-heading"><h2 id="templateVisibilityTitle">Template visibility</h2><button type="button" class="btn" data-close aria-label="Close template visibility">X</button></div><p>Choose which designs stores can see. Admin can always access every template.</p><p class="helper">Save your choices, then use Publish changes to share them after deployment. Sales sync continues updating hidden templates.</p><div data-template-list></div><div class="catalog-publish-actions"><button type="button" class="btn" data-cancel>Cancel</button><button type="submit" class="btn btn-dark">Save visibility</button></div></form>';
 document.body.append(visibilityDialog);
 let visibilityTrigger=null;
 visibilityButton.onclick=()=>{
  if(getMode()!=='all')return;
  visibilityTrigger=document.activeElement;const list=visibilityDialog.querySelector('[data-template-list]');list.replaceChildren();
  for(const store of document.querySelectorAll('#templateList .template-store-group')){
   const group=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=store.querySelector('h3')?.textContent||'Templates';group.append(legend);
   for(const card of store.querySelectorAll('.template-card')){
    const label=document.createElement('label');label.className='template-visibility-option';const input=document.createElement('input');input.type='checkbox';input.dataset.templateId=card.dataset.templateId;
    const pending=changes().find(c=>c.kind==='visibility'&&c.templateId===card.dataset.templateId);
    input.checked=pending?pending.after:getState().templateVisibility?.[card.dataset.templateId]!==false;
    const text=document.createElement('span');text.textContent=card.querySelector('b')?.textContent||card.dataset.templateId;input.dataset.templateName=text.textContent;label.append(input,text);group.append(label);
   }
   list.append(group);
  }
  visibilityDialog.showModal();
 };
 visibilityDialog.querySelector('[data-close]').onclick=visibilityDialog.querySelector('[data-cancel]').onclick=()=>visibilityDialog.close();
 visibilityDialog.addEventListener('close',()=>visibilityTrigger?.focus());
 visibilityDialog.querySelector('form').onsubmit=event=>{
  event.preventDefault();if(getMode()!=='all')return;
  const state=getState();state.sharedCatalogDraft ||= {version:1,changes:[]};const list=state.sharedCatalogDraft.changes;
  for(const input of visibilityDialog.querySelectorAll('input[data-template-id]')){
   const id=input.dataset.templateId,existing=list.find(c=>c.kind==='visibility'&&c.templateId===id),before=existing?existing.before:state.templateVisibility?.[id]!==false;
   if(existing)list.splice(list.indexOf(existing),1);
   if(input.checked!==before)list.push({kind:'visibility',templateId:id,templateName:input.dataset.templateName,before,after:input.checked});
  }
  save();refresh();visibilityDialog.close();button.focus();
 };
 function receiveVisibility(){
  const value=window.publishedTemplateVisibility;if(!value||!canApplyVisibility())return;
  const state=getState();if(JSON.stringify(state.templateVisibility||{})===JSON.stringify(value))return;
  state.templateVisibility=structuredClone(value);render();
 }
 window.addEventListener('published-template-visibility',receiveVisibility);receiveVisibility();
 // Readers can explicitly load the new owner-published data without interrupting editing.
 const update=document.createElement('button');update.id='sharedCatalogUpdate';update.type='button';update.className='btn';update.hidden=true;update.textContent='Published catalog updated';toolbar.append(update);
 update.onclick=()=>document.getElementById('restorePublishedDefaults')?.click();
 let checking=false;
 async function check(){
  if(checking||document.hidden||navigator.onLine===false||busy||typeof window.fetchPublishedRevision!=='function')return;
  const current=getState().publishedProjectRevision;
  checking=true;try{const latest=await window.fetchPublishedRevision();update.hidden=!(latest>current)}catch{}finally{checking=false}
 }
 setInterval(check,60000);window.addEventListener('online',check);document.addEventListener('visibilitychange',check);
 refresh();check();return {record,recordReplacement,refresh};
};
