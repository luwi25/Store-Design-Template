(() => {
 const app=document.querySelector('.app'),left=document.querySelector('.left-rail'),stage=document.querySelector('.stage'),settings=document.querySelector('.right-rail');
 stage.dataset.mobilePanel='preview';settings.dataset.mobilePanel='settings';
 [...left.children].filter(panel=>panel.classList.contains('panel')).forEach(panel=>panel.dataset.mobilePanel=panel.dataset.studioPanel==='products'?'products':panel.querySelector('#templateList')?'templates':'catalog');
 app.classList.add('mobile-ui');app.dataset.mobileActive='templates';
 const nav=document.createElement('nav');nav.className='mobile-nav';nav.setAttribute('aria-label','Editor sections');
 function showPanel(id){
  app.dataset.mobileActive=id;
  for(const button of nav.children)button.setAttribute('aria-pressed',String(button.dataset.panel===id));
  if(window.matchMedia('(max-width:820px)').matches)window.scrollTo({top:0,behavior:'instant'});
  if(id==='preview')updatePicker();
 }
 for(const [id,label] of [['templates','Templates'],['products','Products'],['preview','Preview'],['catalog','Catalog'],['settings','Settings']]){
  const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.panel=id;button.setAttribute('aria-pressed',String(id==='templates'));
  button.onclick=()=>showPanel(id);nav.append(button);
 }
 app.append(nav);
 document.getElementById('templateList')?.addEventListener('click',event=>{
  if(event.target.closest('.template-card')&&window.matchMedia('(max-width:820px)').matches)showPanel('preview');
 });
 const field=document.createElement('div');field.className='field mobile-product-picker';
 const label=document.createElement('label');label.htmlFor='mobileProductPicker';label.textContent='Edit a product';
 const select=document.createElement('select');select.id='mobileProductPicker';field.append(label,select);stage.insertBefore(field,stage.querySelector('.poster-wrap'));
 const poster=document.getElementById('poster');
 function updatePicker(){
  const targets=[...poster.querySelectorAll('.duplex-hit,.product-grid>.product-card')].filter(el=>el.getClientRects().length || el.classList.contains('duplex-hit'));
  select.replaceChildren(new Option('Choose a product…',''));
  targets.forEach((target,i)=>select.add(new Option(target.getAttribute('aria-label')||'Product '+(i+1),String(i))));
  select.disabled=!targets.length;
 }
 select.onchange=()=>{if(select.value!==''){window.flashSaleActions?.openSlot(Number(select.value));select.value=''}};
 let pickerFrame=null;
 new MutationObserver(()=>{if(pickerFrame===null)pickerFrame=(window.requestAnimationFrame||((callback)=>window.setTimeout(callback,16)))(()=>{pickerFrame=null;updatePicker()})}).observe(poster,{childList:true,subtree:true});updatePicker();
 // Phone keyboard resizing is handled by dynamic viewport units in mobile.css.
})();
