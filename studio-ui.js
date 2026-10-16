// Runs inside the editor closure; reuses its slot editor and save queue.
function addSlotTextControls(slot,container){
 const section=document.createElement('section');section.className='slot-text-controls';
 const heading=document.createElement('h3');heading.textContent='Text size · this product';
 const help=document.createElement('p');help.className='helper';help.textContent='Only this card changes in preview, print and PDF. Controls affect text shown by this template.';
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
 const summary=$('studioSelection');if(!summary)return;
 const slot=activeSlots()[state.selectedSlot],p=slot&&productFor(slot);
 summary.replaceChildren();
 if(!slot){summary.textContent='Select a product on the poster or in the list to edit it.';return}
 if(p){const img=document.createElement('img');img.src=slot.image||p.image;img.alt='';summary.append(img)}
 const copy=document.createElement('div'),title=document.createElement('strong'),subtitle=document.createElement('small');
 title.textContent=p?.name||'Choose a product';subtitle.textContent='Slot '+(state.selectedSlot+1)+' · changes apply only here';copy.append(title,subtitle);summary.append(copy);
 if(p){
  const advanced=document.createElement('details');advanced.className='product-advanced';
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
 document.body.classList.add('studio-editor');
 const left=document.querySelector('.left-rail'),right=document.querySelector('.right-rail');
 const oldPanels=[...left.children];oldPanels[0].dataset.studioPanel='templates';oldPanels[1].dataset.studioPanel='catalog';oldPanels[2].dataset.studioPanel='catalog';
 const panel=document.createElement('section');panel.className='panel studio-product-panel';panel.dataset.studioPanel='products';panel.dataset.mobilePanel='products';
 panel.innerHTML='<div class="panel-head"><h2>On this poster</h2><span id="studioProductCount" class="count"></span></div><div class="studio-search"><label class="sr-only" for="studioProductSearch">Search products on this poster</label><input id="studioProductSearch" type="search" placeholder="Search name or code"><button class="btn btn-primary" type="button" id="studioAdd" aria-label="Add product to poster">+</button></div><div id="studioProductList"></div>';
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
