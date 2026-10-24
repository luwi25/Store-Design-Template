// Product settings edit a detached draft. Only Save product commits it.
let productEditDraft=null;
function hasUnsavedProductEdit(){return Boolean(productEditDraft?.dirty||productEditDraft?.busy||productEditDraft?.saving)}
function leaveProductEdit(){
 if(productEditDraft?.saving){showNotice('Please wait for this product to finish saving.');return false}
 if(hasUnsavedProductEdit()&&!confirm('Discard unsaved product changes?'))return false;
 productEditDraft=null;return true;
}
function closeProductSettings(){if(!leaveProductEdit())return;$('slotDialog').close();renderSlotEditor()}
function getProductEditDraft(){
 const target=activeSlots()[state.selectedSlot];
 if(!target){productEditDraft=null;return null}
 if(productEditDraft?.target!==target||productEditDraft.templateId!==state.templateId){
  productEditDraft={target,templateId:state.templateId,slot:structuredClone(target),product:structuredClone(productFor(target)),baseline:structuredClone(productFor(target)),baselineImage:target.image||productFor(target)?.image,dirty:false,busy:false,saving:false};
 }
 return productEditDraft;
}
function markProductEdit(draft){if(productEditDraft!==draft)return;draft.dirty=true;refreshProductEditActions()}
function refreshProductEditActions(){
 const draft=productEditDraft,button=$('saveProductEdit'),cancel=$('cancelProductEdit'),status=$('productEditStatus');
 if(button)button.disabled=!draft?.dirty||draft.busy||draft.saving;
 if(cancel)cancel.disabled=Boolean(draft?.saving);
 if(status)status.textContent=draft?.saving?'Saving product…':draft?.busy?'Processing photo…':draft?.dirty?'Unsaved changes':'Changes apply when you save.';
}
function addProductEditActions(draft){
 const bar=document.createElement('div');bar.className='product-edit-actions';
 const status=document.createElement('p');status.id='productEditStatus';status.setAttribute('role','status');
 const cancel=document.createElement('button');cancel.id='cancelProductEdit';cancel.type='button';cancel.className='btn';cancel.textContent='Cancel';
 cancel.onclick=()=>{if(!leaveProductEdit())return;renderSlotEditor()};
 const saveButton=document.createElement('button');saveButton.id='saveProductEdit';saveButton.type='button';saveButton.className='btn btn-dark';saveButton.textContent='Save product';
 saveButton.onclick=()=>commitProductEdit(draft);
 bar.append(status,cancel,saveButton);slotEditor.append(bar);refreshProductEditActions();
}
async function commitProductEdit(draft){
 if(productEditDraft!==draft||draft.busy||draft.saving||!draft.dirty)return;
 for(const input of slotEditor.querySelectorAll('input:not([type=file]),select')){
  if(input.getAttribute('aria-invalid')==='true'||!input.checkValidity()){const label=slotEditor.querySelector('label[for="'+input.id+'"]')?.textContent||'this field';showNotice('Product not saved. Check '+label+' and click Save product again.');input.reportValidity();input.focus();return}
 }
 if(!draft.product?.name?.trim()){ $('slotName')?.focus();return }
 if(activeSlots()[state.selectedSlot]!==draft.target||state.templateId!==draft.templateId){showNotice('Select this product again before saving.');return}
 draft.saving=true;refreshProductEditActions();const wasInert=slotEditor.inert;slotEditor.inert=true;
 try{
  let product=state.products.find(item=>item.id===draft.slot.productId);
  if(!product){product=structuredClone(draft.product);state.products.push(product)}
  for(const field of ['name','price','image']){
   const next=field==='image'?(draft.slot.image||draft.product.image):draft.product[field];
   const before=field==='image'?draft.baselineImage:draft.baseline?.[field];
   if(next!==before){window.catalogPublisher?.record(product,field,next);product[field]=next}
  }
  Object.assign(draft.target,structuredClone(draft.slot));
  if(!Object.hasOwn(draft.slot,'textSizes'))delete draft.target.textSizes;
  save();const ok=await flushDatabaseSave();
  if(!ok){showNotice('Product could not be saved. Your edits are still here; click Save product to retry.');return}
  productEditDraft=null;renderCatalog();renderPoster();renderSlotEditor();showNotice('Product saved.');
 }catch(error){showNotice(error.message||'Could not save this product. Please retry.')}
 finally{draft.saving=false;slotEditor.inert=wasInert;refreshProductEditActions()}
}
function bindDraftProductName(input,draft){
 input.required=true;input.autocomplete='off';input.placeholder='Search catalog or type a name';input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-expanded','false');input.setAttribute('aria-controls','slotNameResults');
 const list=document.createElement('div');list.id='slotNameResults';list.className='product-name-results';list.setAttribute('role','listbox');list.hidden=true;input.after(list);
 const hint=document.createElement('p');hint.className='helper';hint.textContent='Choose a catalog product or type a name, then click Save product.';list.after(hint);
 let matches=[],active=-1;
 const close=()=>{list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1};
 const choose=product=>{
  draft.product=structuredClone(product);draft.baseline=structuredClone(product);draft.baselineImage=product.image;
  draft.slot.productId=product.id;draft.slot.details=null;draft.slot.image=null;draft.slot.imageOriginal=null;
  markProductEdit(draft);close();renderSlotEditor();$('slotOriginalPrice')?.focus({preventScroll:true});
 };
 const show=()=>{
  const query=input.value.trim().toLowerCase();matches=state.products.filter(p=>(p.name+' '+(p.code||'')).toLowerCase().includes(query)).slice(0,6);active=-1;list.replaceChildren();
  matches.forEach((product,i)=>{const option=document.createElement('button');option.type='button';option.id='slotNameOption-'+i;option.setAttribute('role','option');option.setAttribute('aria-selected','false');option.tabIndex=-1;
   const name=document.createElement('span');name.textContent=product.name;const price=document.createElement('small');price.textContent=money(product.price);option.append(name,price);option.onpointerdown=event=>event.preventDefault();option.onclick=()=>choose(product);list.append(option)});
  list.hidden=matches.length===0;input.setAttribute('aria-expanded',String(!list.hidden));
 };
 input.addEventListener('input',()=>{
  const value=input.value.trim();input.setAttribute('aria-invalid',String(!value));
  if(!draft.product){draft.product={id:'catalog-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:value,price:0,code:'',image:null};draft.slot.productId=draft.product.id;draft.slot.discountPercent=0}
  draft.product.name=value;draft.slot.details={...draft.slot.details,name:value};markProductEdit(draft);show();
 });
 input.addEventListener('blur',()=>{close();if(productEditDraft===draft&&draft.product&&!$('slotOriginalPrice'))renderSlotEditor()});
 input.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(list.hidden)show();if(matches.length){active=(active+(event.key==='ArrowDown'?1:matches.length-1)+matches.length)%matches.length;[...list.children].forEach((option,i)=>option.setAttribute('aria-selected',String(i===active)));input.setAttribute('aria-activedescendant','slotNameOption-'+active)}}
  else if(event.key==='Enter'){event.preventDefault();if(!list.hidden&&active>=0)choose(matches[active]);else{close();if(!$('slotOriginalPrice'))renderSlotEditor()}}
  else if(event.key==='Escape'&&!list.hidden){event.preventDefault();event.stopPropagation();close()}
 });
}
