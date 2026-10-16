// Runs inside the editor closure; reuses its slot editor and save queue.
function addSlotTextControls(slot,container){
 const section=document.createElement('section');section.className='slot-text-controls';
 const heading=document.createElement('h3');heading.textContent='Text size · this product';
 const help=document.createElement('p');help.className='helper';help.textContent='Sizes apply only to this product in preview and print.';
 section.append(heading,help);
 for(const [key,label] of [['name','Product name'],['discount','Discount label'],['sale','Sale price'],['original','Original price']]){
  const field=document.createElement('div');field.className='field';
  const text=document.createElement('label');text.htmlFor='slotText-'+key;text.textContent=label;
  const output=document.createElement('output');output.htmlFor='slotText-'+key;
  const input=document.createElement('input');input.type='range';input.id='slotText-'+key;input.min=70;input.max=140;input.step=5;input.value=Math.round(textScale(key,slot)*100);
  output.textContent=input.value+'%';text.append(output);field.append(text,input);section.append(field);
  input.addEventListener('input',()=>{slot.textSizes={...slot.textSizes,[key]:Number(input.value)};output.textContent=input.value+'%';input.setAttribute('aria-valuetext',input.value+' percent');renderPoster();save()});
 }
 const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Use template text defaults';
 reset.onclick=()=>{delete slot.textSizes;renderSlotEditor();renderPoster();save()};section.append(reset);container.append(section);
}
function syncStudioInspector(){
 updateProductSheetHeading();
 const summary=$('studioSelection');if(!summary)return;
 const slot=activeSlots()[state.selectedSlot],p=slot&&productFor(slot);
 summary.replaceChildren();
 if(!slot){summary.textContent='Select a product on the poster or in the list to edit it.';return}
 if(p){const img=document.createElement('img');img.src=slot.image||p.image;img.alt='';summary.append(img)}
 const copy=document.createElement('div'),title=document.createElement('strong'),subtitle=document.createElement('small');
 title.textContent=p?.name||'Choose a product';subtitle.textContent='Slot '+(state.selectedSlot+1)+' · changes apply only here';copy.append(title,subtitle);summary.append(copy);
 if(p){
  const advanced=document.createElement('details');advanced.className='product-advanced';advanced.open=true;
  const heading=document.createElement('summary');heading.textContent='Product image & catalog';advanced.append(heading);
  for(const id of ['slotProduct','slotCategory','slotPhoto']){const field=$(id)?.closest('.field');if(field)advanced.append(field)}
  const tools=slotEditor.querySelector('.background-tools');if(tools)advanced.append(tools);
  const remove=slotEditor.querySelector('.remove-product');if(remove)advanced.append(remove);
  slotEditor.append(advanced);
  const original=$('slotOriginalPrice')?.closest('.field'),discountField=$('slotDiscount')?.closest('.field');
  if(original&&discountField){const row=document.createElement('div');row.className='two-col studio-price-fields';original.before(row);row.append(original,discountField)}
 }
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
 list.replaceChildren();const slots=activeSlots();$('studioProductCount').textContent=slots.length+' slots';
 let lastGroup=null,shown=0;
 slots.forEach((slot,index)=>{
  const p=productFor(slot);if(search&&!((p?.name||'Choose product')+' '+(p?.code||'')).toLowerCase().includes(search))return;
  if(slot.group!=null&&slot.group!==lastGroup){const group=categoryGroups()[slot.group];const label=document.createElement('h3');label.textContent=group?.title||group?.name||'Category '+(slot.group+1);list.append(label);lastGroup=slot.group}
  const row=document.createElement('button');row.type='button';row.className='studio-product';row.setAttribute('aria-pressed',String(index===state.selectedSlot));row.setAttribute('aria-label','Edit '+(p?.name||'product slot '+(index+1)));
  const image=document.createElement('img');image.src=slot.image||p?.image||svgThumb('+','#f2f6f7');image.alt='';
  const copy=document.createElement('span'),name=document.createElement('strong'),code=document.createElement('small'),price=document.createElement('b');name.textContent=p?.name||'Choose product';code.textContent=p?.code||'Slot '+(index+1);price.textContent=p?money(salePrice(p,slot)):'Add';copy.append(name,code);row.append(image,copy,price);row.onclick=()=>openProductSlot(index);list.append(row);shown++;
 });
 if(!shown){const empty=document.createElement('p');empty.className='helper';empty.textContent=search?'No matching products on this poster.':'No products yet. Add a product to start.';list.append(empty)}
 const selector=$('studioTemplate');if(selector){
  const names=[...$('templateList').querySelectorAll('.template-card b')].map(b=>b.textContent);
  const cards=[...$('templateList').querySelectorAll('.template-card')];
  selector.replaceChildren();cards.forEach((card,index)=>{const option=new Option(names[index],String(index));option.selected=card.getAttribute('aria-pressed')==='true';selector.add(option)})
 }
 const selection=$('studioSelection strong');const selected=slots[state.selectedSlot];if(selection&&selected)selection.textContent=productFor(selected)?.name||'Choose product';
}
function setupStudioUI(){
 document.body.classList.add('studio-editor');setupProductSheet();
 const left=document.querySelector('.left-rail'),right=document.querySelector('.right-rail');
 const oldPanels=[...left.children];oldPanels[0].dataset.studioPanel='templates';oldPanels[1].dataset.studioPanel='catalog';oldPanels[2].dataset.studioPanel='catalog';
 const panel=document.createElement('section');panel.className='panel studio-product-panel';panel.dataset.studioPanel='products';panel.dataset.mobilePanel='products';
 panel.innerHTML='<div class="panel-head"><h2>On this poster</h2><span id="studioProductCount" class="count"></span></div><div class="studio-search"><label class="sr-only" for="studioProductSearch">Search products on this poster</label><input id="studioProductSearch" type="search" placeholder="Search products"><button class="btn btn-primary" type="button" id="studioAdd" aria-label="Add product to poster">+</button></div><div id="studioProductList"></div>';
 left.prepend(panel);$('studioProductSearch').oninput=renderStudioProducts;$('studioAdd').onclick=addProductSlot;
 const tabs=document.createElement('nav');tabs.className='studio-tabs';tabs.setAttribute('aria-label','Editor sidebar');left.prepend(tabs);left.dataset.studioActive='products';
 for(const [id,label] of [['products','Products'],['templates','Templates'],['catalog','Catalog']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-pressed',String(id==='products'));b.onclick=()=>{left.dataset.studioActive=id;for(const other of tabs.children)other.setAttribute('aria-pressed',String(other===b))};tabs.append(b)}
 const inspector=document.createElement('section');inspector.className='panel studio-inspector';inspector.innerHTML='<h2>Selected product</h2><div id="studioSelection" class="studio-selection"></div><div id="studioInspectorBody"></div>';right.prepend(inspector);
 const dialog=$('slotDialog'),home=$('slotEditor').parentElement;
 const dock=()=>{if(window.matchMedia('(min-width:821px)').matches){if(dialog.open)dialog.close();$('studioInspectorBody').append(slotEditor)}else{home.insertBefore(slotEditor,home.querySelector('.modal-actions'))}};
 window.matchMedia('(min-width:821px)').addEventListener('change',dock);dock();
 const template=document.createElement('select');template.id='studioTemplate';template.setAttribute('aria-label','Selected design template');template.onchange=()=>{const cards=$('templateList').querySelectorAll('.template-card');cards[Number(template.value)]?.click()};document.querySelector('.brand').after(template);template.after($('saveStatus'));
 const backup=document.createElement('button');backup.type='button';backup.className='btn';backup.textContent='Backup';backup.onclick=()=>downloadStateBackup(state);document.querySelector('.top-actions').prepend(backup);
 const zoom=document.createElement('div');zoom.className='studio-zoom';zoom.innerHTML='<button type="button" class="btn btn-sm" aria-label="Zoom out">−</button><output aria-live="polite">100%</output><button type="button" class="btn btn-sm" aria-label="Zoom in">+</button><button type="button" class="btn btn-sm">Fit</button>';
 document.querySelector('.stage-top').append(zoom);let scale=1;const buttons=zoom.querySelectorAll('button');const apply=()=>{const stage=document.querySelector('.stage'),width=Math.min(500,stage.clientWidth-48);document.querySelector('.poster-wrap').style.width=Math.max(200,width*scale)+'px';zoom.querySelector('output').textContent=Math.round(scale*100)+'%'};
 buttons[0].onclick=()=>{scale=Math.max(.5,scale-.1);apply()};buttons[1].onclick=()=>{scale=Math.min(2,scale+.1);apply()};buttons[2].onclick=()=>{scale=1;apply()};window.addEventListener('resize',apply);apply();
}

function updateProductSheetHeading(){
 const heading=$('productSheetHeading');if(!heading)return;
 const slot=activeSlots()[state.selectedSlot],p=slot&&productFor(slot);heading.replaceChildren();
 if(p){const img=document.createElement('img');img.src=slot.image||p.image;img.alt='';heading.append(img)}
 const copy=document.createElement('div'),name=document.createElement('strong'),code=document.createElement('small');
 name.textContent=p?.name||'Choose a product';code.textContent=p?.code||'Product settings';copy.append(name,code);
 const price=document.createElement('b');price.textContent=p?money(salePrice(p,slot)):'';
 const close=document.createElement('button');close.type='button';close.className='sheet-close';close.textContent='?';close.setAttribute('aria-label','Close product settings');close.onclick=()=>$('slotDialog').close();heading.append(copy,price,close);
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
  if(current.moved&&dy>90&&current.size==='compact'){dialog.close();snap('compact')}
  else if(dy < -35)snap('expanded');else if(dy>35)snap('compact');else snap(current.size);
 };
 handle.onpointerup=event=>finish(event);handle.onpointercancel=event=>finish(event,true);
 dialog.addEventListener('close',()=>{drag=null;skipClick=false;snap('compact')});
 slotEditor.addEventListener('focusin',event=>{if(!window.matchMedia('(min-width:821px)').matches&&event.target.matches('input:not([type=range]):not([type=file]),select'))snap('expanded')});
}
