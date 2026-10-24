// Runs inside the editor closure; reuses its slot editor and save queue.
function addSlotTextControls(slot,container,onChange=()=>{renderPoster();save()}){
 const section=document.createElement('section');section.className='slot-text-controls';
 const heading=document.createElement('h3');heading.textContent='Text size · this product';
 const help=document.createElement('p');help.className='helper';help.textContent='Sizes apply only to this product in preview and print.';
 section.append(heading,help);
 for(const [key,label] of [['name','Product name'],['discount','Discount label'],['sale','Sale price'],['original','Original price']]){
  const field=document.createElement('div');field.className='field';
  const text=document.createElement('label');text.htmlFor='slotText-'+key;text.textContent=label;
  const output=document.createElement('output');output.htmlFor='slotText-'+key;
  const input=document.createElement('input');input.type='range';input.id='slotText-'+key;input.min=70;input.max=140;input.step=5;input.value=Math.round(textScale(key,slot)*100);
  output.textContent=input.value+'%';text.append(output);
  const controls=document.createElement('div');controls.className='text-size-stepper';
  const stepButton=(direction)=>{const button=document.createElement('button');button.type='button';button.className='btn btn-sm';button.textContent=direction<0?'−':'+';button.setAttribute('aria-label',(direction<0?'Decrease ':'Increase ')+label.toLowerCase()+' size');button.onclick=()=>{input.value=Math.max(70,Math.min(140,Number(input.value)+direction*5));input.dispatchEvent(new Event('input',{bubbles:true}))};return button};
  controls.append(stepButton(-1),input,stepButton(1));field.append(text,controls);section.append(field);
  input.setAttribute('aria-valuetext',input.value+' percent');
  input.addEventListener('input',()=>{slot.textSizes={...slot.textSizes,[key]:Number(input.value)};output.textContent=input.value+'%';input.setAttribute('aria-valuetext',input.value+' percent');onChange()});
 }
 const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Use template text defaults';
 reset.onclick=()=>{delete slot.textSizes;onChange();renderSlotEditor()};section.append(reset);container.append(section);
}
function syncStudioInspector(){
 updateProductSheetHeading();
 const summary=$('studioSelection');if(!summary)return;
 const slot=activeSlots()[state.selectedSlot],p=slot&&productFor(slot);
 summary.replaceChildren();
 if(!slot){summary.textContent='Select a product on the poster or in the list to edit it.';return}
 if(p){const img=document.createElement('img');img.src=slot.image||p.image;img.alt='';summary.append(img)}
 const copy=document.createElement('div'),title=document.createElement('strong'),subtitle=document.createElement('small');
 title.textContent=p?.name||'Choose a product';subtitle.textContent='Editing product '+(state.selectedSlot+1);copy.append(title,subtitle);summary.append(copy);
 if(p){
  const advanced=document.createElement('details');advanced.className='product-advanced';advanced.open=true;
  const heading=document.createElement('summary');heading.textContent='Product image';advanced.append(heading);
  for(const id of ['slotPhoto']){const field=$(id)?.closest('.field');if(field)advanced.append(field)}
  const tools=slotEditor.querySelector('.background-tools');if(tools)advanced.append(tools);
  const remove=slotEditor.querySelector('.remove-product');
  slotEditor.append(advanced);
  if(remove){const actions=document.createElement('div');actions.className='product-remove-action';actions.append(remove);slotEditor.append(actions)}
  const original=$('slotOriginalPrice')?.closest('.field'),discountField=$('slotDiscount')?.closest('.field');
  if(original&&discountField){const row=document.createElement('div');row.className='two-col studio-price-fields';original.before(row);row.append(original,discountField);
   const heading=document.createElement('h3');heading.className='product-pricing-heading';heading.textContent='Pricing & discount';row.before(heading);
   const scope=$('slotCatalogScope');if(scope){scope.textContent='Save product applies the name and original price to your catalog.';heading.before(scope)}
   for(const id of ['slotOriginalPrice','slotSalePrice','slotDiscount'])$(id)?.setAttribute('inputmode','decimal');
   const saleLabel=slotEditor.querySelector('label[for="slotSalePrice"]');if(saleLabel)saleLabel.textContent='Sale price on poster (₱)';
   const originalLabel=slotEditor.querySelector('label[for="slotOriginalPrice"]');if(originalLabel)originalLabel.textContent='Original price (₱)';
  }
 }
 const editActions=$('saveProductEdit')?.closest('.product-edit-actions');if(editActions)slotEditor.append(editActions);
 const discount=$('slotDiscount');if(discount){
  const presets=document.createElement('div');presets.className='discount-presets';presets.setAttribute('role','group');presets.setAttribute('aria-label','Discount for selected product');
  for(const value of [0,10,20,30,50]){const b=document.createElement('button');b.type='button';b.className='btn btn-sm';b.textContent=value+'%';b.setAttribute('aria-pressed',String(Number(discount.value)===value));b.onclick=()=>{discount.value=value;discount.dispatchEvent(new Event('input',{bubbles:true}));for(const other of presets.children)other.setAttribute('aria-pressed',String(other===b))};presets.append(b)}
  (discount.closest('.studio-price-fields')||discount.closest('.field')).after(presets);
  discount.addEventListener('input',()=>{for(const b of presets.children)b.setAttribute('aria-pressed',String(Number.parseFloat(b.textContent)===Number(discount.value)))})
 }
}
function renderStudioProducts(){
 updateProductSheetHeading();
 const list=$('studioProductList');if(!list)return;
 const search=($('studioProductSearch').value||'').trim().toLowerCase();
 list.replaceChildren();const slots=activeSlots(),placed=slots.filter(slot=>productFor(slot)).length;
 $('studioProductCount').textContent=placed+' / '+slots.length;$('studioProductCount').title='Products placed / available slots';
 $('studioClearSearch').hidden=!search;
 const canAdd=usesCanvasTemplate()&&slots.length<designLimit();$('studioAdd').disabled=!canAdd;$('studioAdd').title=canAdd?'Add a product slot':'All product slots are in use. Select a product to replace it.';
 $('studioCapacity').textContent=!usesCanvasTemplate()?'Select a product to edit it.':canAdd?(designLimit()-slots.length)+' more product slots available.':'All slots are in use. Select a product to replace it.';
 const canUndo=removedProduct&&removedProduct.templateId===state.templateId&&usesCanvasTemplate();$('studioUndoRemoval').hidden=!canUndo;$('studioUndoRemoval').disabled=!canAdd;

 let lastGroup=null,shown=0;
 slots.forEach((slot,index)=>{
  const p=productFor(slot);if(search&&!((p?.name||'Choose product')+' '+(p?.code||'')).toLowerCase().includes(search))return;
  if(slot.group!=null&&slot.group!==lastGroup){const group=categoryGroups()[slot.group];const label=document.createElement('h3');label.textContent=state.templateId===HOME_COLLECTION_ID?homeCollectionLabel(slot.group):group?.title||group?.name||'Category '+(slot.group+1);list.append(label);lastGroup=slot.group}
  const row=document.createElement('button');row.type='button';row.className='studio-product';row.setAttribute('aria-pressed',String(index===state.selectedSlot));row.setAttribute('aria-label','Edit '+(p?.name||'product slot '+(index+1)));
  const image=document.createElement('img');image.src=slot.image||p?.image||svgThumb('+','#f2f6f7');image.alt='';
  const copy=document.createElement('span'),name=document.createElement('strong'),code=document.createElement('small'),price=document.createElement('b');name.textContent=p?.name||'Choose product';code.textContent=p?.code||'Slot '+(index+1);price.textContent=p?money(salePrice(p,slot)):'Add';copy.append(name,code);row.append(image,copy,price);row.onclick=()=>openProductSlot(index);list.append(row);shown++;
 });
 if(!shown){const empty=document.createElement('p');empty.className='helper';empty.textContent=search?'No matching products on this poster.':'No products yet. Add a product to start.';list.append(empty)}
 const selector=$('studioTemplate');if(selector){
  const names=[...$('templateList').querySelectorAll('.template-card b')].map(b=>b.textContent);
  const cards=[...$('templateList').querySelectorAll('.template-card')];
  selector.replaceChildren();const groups=new Map();
  cards.forEach((card,index)=>{if(card.closest('.template-store-group.is-store-hidden'))return;const label=card.dataset.storeGroup||'Other templates';let group=groups.get(label);if(!group){group=document.createElement('optgroup');group.label=label;groups.set(label,group);selector.append(group)}const option=new Option(names[index],String(index));option.selected=card.getAttribute('aria-pressed')==='true';group.append(option)})
 }
 const selection=$('studioSelection strong');const selected=slots[state.selectedSlot];if(selection&&selected)selection.textContent=productFor(selected)?.name||'Choose product';
}
function setupStudioUI(){
 document.body.classList.add('studio-editor');setupProductSheet();window.addEventListener('beforeunload',event=>{if(hasUnsavedProductEdit()){event.preventDefault();event.returnValue=''}});
 setupDownloadMenu();
 const left=document.querySelector('.left-rail'),right=document.querySelector('.right-rail');
 // Keep the shared rename control accessible in desktop and mobile settings.
 const templateNameField=$('templateNameInput').closest('.field');
 $('templateNameInput').maxLength=80;
 $('storeInput').closest('.field').before(templateNameField);
 const oldPanels=[...left.children];oldPanels[0].dataset.studioPanel='templates';oldPanels[1].dataset.studioPanel='catalog';oldPanels[2].dataset.studioPanel='catalog';
 const panel=document.createElement('section');panel.className='panel studio-product-panel';panel.dataset.studioPanel='products';panel.dataset.mobilePanel='products';
 panel.innerHTML='<div class="panel-head"><h2>On this poster</h2><span id="studioProductCount" class="count"></span></div><div class="studio-search"><label class="sr-only" for="studioProductSearch">Search products on this poster</label><input id="studioProductSearch" type="search" placeholder="Search products"><button class="btn btn-primary" type="button" id="studioAdd" aria-label="Add product to poster">+</button></div><div class="studio-list-actions"><button type="button" class="btn btn-sm" id="studioClearSearch" hidden>Clear search</button><button type="button" class="btn btn-sm" id="studioUndoRemoval" hidden>Undo removal</button></div><p class="helper" id="studioCapacity"></p><div id="studioProductList"></div>';
 left.prepend(panel);$('studioProductSearch').oninput=renderStudioProducts;$('studioAdd').onclick=addProductSlot;$('studioClearSearch').onclick=()=>{$('studioProductSearch').value='';renderStudioProducts();$('studioProductSearch').focus()};$('studioUndoRemoval').onclick=undoProductRemoval;
 const tabs=document.createElement('nav');tabs.className='studio-tabs';tabs.setAttribute('aria-label','Editor sidebar');left.prepend(tabs);left.dataset.studioActive='templates';
 for(const [id,label] of [['templates','Templates'],['products','Products'],['catalog','Catalog']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-pressed',String(id==='templates'));b.onclick=()=>{left.dataset.studioActive=id;for(const other of tabs.children)other.setAttribute('aria-pressed',String(other===b))};tabs.append(b)}
 const inspector=document.createElement('section');inspector.className='panel studio-inspector';inspector.innerHTML='<h2>Selected product</h2><div id="studioSelection" class="studio-selection"></div><div id="studioInspectorBody"></div>';right.prepend(inspector);
 const dialog=$('slotDialog'),home=$('slotEditor').parentElement;
 const dock=()=>{if(window.matchMedia('(min-width:821px)').matches){if(dialog.open){dialog.dataset.docking='true';dialog.close();}$('studioInspectorBody').append(slotEditor)}else{home.insertBefore(slotEditor,home.querySelector('.modal-actions'))}};
 window.matchMedia('(min-width:821px)').addEventListener('change',dock);dock();
 const template=document.createElement('select');template.id='studioTemplate';template.setAttribute('aria-label','Selected design template');template.onchange=()=>{const cards=$('templateList').querySelectorAll('.template-card');cards[Number(template.value)]?.click()};document.querySelector('.brand').after(template);template.after($('saveStatus'));

 const zoom=document.createElement('div');zoom.className='studio-zoom';zoom.innerHTML='<button type="button" class="btn btn-sm" aria-label="Zoom out">−</button><output aria-live="polite">100%</output><button type="button" class="btn btn-sm" aria-label="Zoom in">+</button><button type="button" class="btn btn-sm">Fit</button>';
 document.querySelector('.stage-top').append(zoom);let scale=1;const buttons=zoom.querySelectorAll('button');const apply=()=>{const stage=document.querySelector('.stage'),width=Math.min(500,stage.clientWidth-48);document.querySelector('.poster-wrap').style.width=Math.max(200,width*scale)+'px';zoom.querySelector('output').textContent=Math.round(scale*100)+'%'};
 buttons[0].onclick=()=>{scale=Math.max(.5,scale-.1);apply()};buttons[1].onclick=()=>{scale=Math.min(2,scale+.1);apply()};buttons[2].onclick=()=>{scale=1;apply()};window.addEventListener('resize',apply);apply();
}

function setupDownloadMenu(){
 const pdf=$('pdfBtn'),png=$('pngBtn');if(!pdf||!png)return;
 const backup=$('downloadDatabaseBackup');
 const downloadButtons=[pdf,png,backup].filter(Boolean);
 const wrap=document.createElement('div');wrap.className='download-dropdown';
 const toggle=document.createElement('button');toggle.id='downloadMenuButton';toggle.type='button';toggle.className='btn';toggle.textContent='Download ▾';
 toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','downloadOptions');
 const options=document.createElement('div');options.id='downloadOptions';options.className='download-options';options.hidden=true;options.setAttribute('role','group');options.setAttribute('aria-label','Download format');
 pdf.before(wrap);wrap.append(toggle,options);options.append(...downloadButtons);
 const close=(focus=false)=>{options.hidden=true;toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus()};
 const open=()=>{options.hidden=false;toggle.setAttribute('aria-expanded','true');downloadButtons.find(b=>!b.disabled)?.focus()};
 toggle.onclick=()=>options.hidden?open():close();
 toggle.onkeydown=event=>{if(event.key==='ArrowDown'){event.preventDefault();open()}};
 options.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true)}
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();const enabled=downloadButtons.filter(b=>!b.disabled);if(enabled.length)enabled[(enabled.indexOf(document.activeElement)+(event.key==='ArrowDown'?1:-1)+enabled.length)%enabled.length].focus()}
 });
 options.addEventListener('click',event=>{if(event.target.closest('button')&&!event.target.closest('button').disabled)close(true);else if(event.target.closest('button')?.getAttribute('aria-busy')==='true')close(true)});
 document.addEventListener('pointerdown',event=>{if(!wrap.contains(event.target))close()});
 wrap.addEventListener('focusout',()=>setTimeout(()=>{if(!wrap.contains(document.activeElement))close()},0));
 const sync=()=>{const busy=[pdf,png].find(b=>b.getAttribute('aria-busy')==='true');toggle.textContent=busy?(busy===pdf?'Preparing PDF…':'Preparing PNG…'):'Download ▾';toggle.setAttribute('aria-busy',String(Boolean(busy)));toggle.disabled=Boolean(busy)||downloadButtons.every(b=>b.disabled)};
 const observer=new MutationObserver(sync);for(const button of downloadButtons)observer.observe(button,{attributes:true,attributeFilter:['disabled','aria-busy']});sync();
}

function updateProductSheetHeading(){
 const heading=$('productSheetHeading');if(!heading)return;
 const slot=activeSlots()[state.selectedSlot],p=slot&&productFor(slot);heading.replaceChildren();
 if(p){const img=document.createElement('img');img.src=slot.image||p.image;img.alt='';heading.append(img)}
 const copy=document.createElement('div'),name=document.createElement('strong'),code=document.createElement('small');
 name.textContent=p?.name||'Choose a product';code.textContent=p?.code||'Product settings';copy.append(name,code);
 const price=document.createElement('b');price.textContent=p?money(salePrice(p,slot)):'';
 const close=document.createElement('button');close.type='button';close.className='sheet-close';close.textContent='\u00d7';close.setAttribute('aria-label','Close product settings');close.onclick=closeProductSettings;heading.append(copy,price,close);
}
function prepareProductSheet(){
 const dialog=$('slotDialog');dialog.dataset.sheetSize='compact';dialog.style.removeProperty('--sheet-drag-height');
 slotEditor.scrollTop=0;updateProductSheetHeading();$('productSheetHandle')?.focus({preventScroll:true});
}
function setupProductSheet(){
 const dialog=$('slotDialog'),inner=dialog.querySelector('.modal-inner');
 const handle=document.createElement('button');handle.type='button';handle.id='productSheetHandle';handle.className='sheet-handle';handle.setAttribute('aria-label','Expand product settings. Drag up to expand or down to close.');handle.setAttribute('aria-expanded','false');
 const bar=document.createElement('span');bar.setAttribute('aria-hidden','true');handle.append(bar);
 const heading=document.createElement('div');heading.id='productSheetHeading';heading.className='sheet-heading';inner.prepend(handle,heading);
 let drag=null,skipClick=false;
 const viewport=()=>window.visualViewport?.height||window.innerHeight;
 const snap=size=>{dialog.dataset.sheetSize=size;dialog.style.removeProperty('--sheet-drag-height');handle.setAttribute('aria-expanded',String(size==='expanded'));handle.setAttribute('aria-label',size==='expanded'?'Collapse product settings. Drag down to collapse.':'Expand product settings. Drag up to expand or down to close.')};
 const resize=()=>{dialog.style.setProperty('--sheet-viewport',viewport()+'px')};resize();window.visualViewport?.addEventListener('resize',resize);window.addEventListener('resize',resize);
 handle.onclick=()=>{if(skipClick){skipClick=false;return}snap(dialog.dataset.sheetSize==='expanded'?'compact':'expanded')};
 handle.onkeydown=event=>{if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();snap(event.key==='ArrowUp'?'expanded':'compact')}};
 handle.onpointerdown=event=>{if(event.button!==0||!event.isPrimary)return;drag={id:event.pointerId,y:event.clientY,height:dialog.getBoundingClientRect().height,size:dialog.dataset.sheetSize||'compact',moved:false};handle.setPointerCapture(event.pointerId)};
 handle.onpointermove=event=>{if(!drag||event.pointerId!==drag.id)return;const dy=event.clientY-drag.y;if(Math.abs(dy)>5)drag.moved=true;if(drag.moved){event.preventDefault();dialog.style.setProperty('--sheet-drag-height',Math.max(130,Math.min(viewport()*.92,drag.height-dy))+'px')}};
 const finish=(event,cancelled=false)=>{if(!drag||event.pointerId!==drag.id)return;const current=drag;drag=null;const dy=event.clientY-current.y;skipClick=current.moved;
  if(cancelled){snap(current.size);return}
  if(current.moved&&dy>90&&current.size==='compact'){closeProductSettings();snap('compact')}
  else if(dy < -35)snap('expanded');else if(dy>35)snap('compact');else snap(current.size);
 };
 handle.onpointerup=event=>finish(event);handle.onpointercancel=event=>finish(event,true);
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeProductSettings()});
 dialog.addEventListener('close',()=>{drag=null;skipClick=false;snap('compact')});
 slotEditor.addEventListener('focusin',event=>{if(!window.matchMedia('(min-width:821px)').matches&&event.target.matches('input:not([type=range]):not([type=file]),select'))snap('expanded')});
}

function bindProductNameSearch(input,slot){
 input.autocomplete='off';input.placeholder='Search catalog or type a name';input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-expanded','false');input.setAttribute('aria-controls','slotNameResults');
 const list=document.createElement('div');list.id='slotNameResults';list.className='product-name-results';list.setAttribute('role','listbox');list.hidden=true;input.after(list);
 const hint=document.createElement('p');hint.className='helper';hint.textContent='Search to replace this product. A custom name also updates its catalog entry.';list.after(hint);
 let matches=[],active=-1,dirty=false;
 const close=()=>{list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1};
 const choose=product=>{dirty=false;close();slot.productId=product.id;slot.details=null;slot.image=null;slot.imageOriginal=null;renderSlotEditor();renderPoster();save();$('slotOriginalPrice')?.focus({preventScroll:true})};
 const highlight=()=>{[...list.querySelectorAll('[role=option]')].forEach((option,i)=>option.setAttribute('aria-selected',String(i===active)));if(active>=0){input.setAttribute('aria-activedescendant','slotNameOption-'+active);list.children[active]?.scrollIntoView?.({block:'nearest'})}else input.removeAttribute('aria-activedescendant')};
 const show=()=>{
  const query=input.value.trim().toLowerCase();matches=state.products.filter(p=>(p.name+' '+(p.code||'')).toLowerCase().includes(query)).slice(0,6);active=-1;list.replaceChildren();
  matches.forEach((product,i)=>{const option=document.createElement('button');option.type='button';option.id='slotNameOption-'+i;option.setAttribute('role','option');option.setAttribute('aria-selected','false');option.tabIndex=-1;
   const name=document.createElement('span');name.textContent=product.name;const price=document.createElement('small');price.textContent=money(product.price);option.append(name,price);option.onpointerdown=event=>event.preventDefault();option.onclick=()=>choose(product);list.append(option)});
  if(!matches.length){const message=document.createElement('p');message.textContent='No catalog match. Press Enter to use this name.';list.append(message)}
  list.hidden=false;input.setAttribute('aria-expanded','true');input.removeAttribute('aria-activedescendant');
 };
 const commit=()=>{if(!dirty)return;const value=input.value.trim();if(!value){input.setAttribute('aria-invalid','true');return}input.removeAttribute('aria-invalid');dirty=false;
  let product=state.products.find(p=>p.id===slot.productId);
  if(!product){product={id:'catalog-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:value,price:0,code:'',image:null};state.products.push(product);slot.productId=product.id;slot.discountPercent=0}
  window.catalogPublisher?.record(product,'name',value);product.name=value;slot.details={...slot.details,name:value};renderCatalog();renderPoster();save();
  if(!$('slotOriginalPrice')){renderSlotEditor();$('slotOriginalPrice')?.focus({preventScroll:true})}
 };
 input.addEventListener('input',()=>{dirty=true;input.removeAttribute('aria-invalid');show()});input.addEventListener('focus',()=>{if(!input.value.trim())show()});
 input.addEventListener('blur',()=>{close();commit()});
 input.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(list.hidden)show();if(matches.length){active=active<0?(event.key==='ArrowDown'?0:matches.length-1):(active+(event.key==='ArrowDown'?1:-1)+matches.length)%matches.length;highlight()}}
  else if(event.key==='Enter'){event.preventDefault();if(!list.hidden&&active>=0)choose(matches[active]);else{commit();close()}}
  else if(event.key==='Escape'&&!list.hidden){event.preventDefault();event.stopPropagation();dirty=false;input.value=productFor(slot)?.name||'';close()}
 });
}
