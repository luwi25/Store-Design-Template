(() => {
 // Move the original toolbar buttons; their listeners and state stay intact.
 const toolbar=document.querySelector('.top-actions');
 const mobileWidth=window.matchMedia('(max-width:820px)');
 const more=document.createElement('div');more.className='mobile-more';more.hidden=true;
 const moreButton=document.createElement('button');moreButton.type='button';moreButton.className='btn';moreButton.textContent='More ⋯';moreButton.setAttribute('aria-expanded','false');moreButton.setAttribute('aria-controls','mobileMoreOptions');
 const options=document.createElement('div');options.id='mobileMoreOptions';options.className='mobile-more-options';options.hidden=true;options.setAttribute('role','group');options.setAttribute('aria-label','More actions');
 more.append(moreButton,options);toolbar.append(more);
 const homes=new Map();
 const closeMore=()=>{options.hidden=true;moreButton.setAttribute('aria-expanded','false')};
 function arrangeToolbar(){
  for(const id of ['bgRemoverBtn','restorePublishedDefaults','publishCatalog','sharedCatalogUpdate','installApp']){
   const button=document.getElementById(id);if(!button)continue;
   if(!homes.has(button)){
    const home=document.createComment('Toolbar position: '+id);
    if(button.parentElement===options){
     const backgroundHome=homes.get(document.getElementById('bgRemoverBtn'));
     if(backgroundHome)backgroundHome.after(home);else toolbar.insertBefore(home,more);
    }else button.before(home);
    homes.set(button,home);
   }
   if(mobileWidth.matches){if(button.parentElement!==options)options.append(button)}
   else if(button.parentElement===options)homes.get(button).after(button);
  }
  more.hidden=!mobileWidth.matches;
  if(!mobileWidth.matches)closeMore();
 }
 moreButton.onclick=()=>{const opening=options.hidden;options.hidden=!opening;moreButton.setAttribute('aria-expanded',String(opening))};
 more.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeMore();moreButton.focus()}});
 options.addEventListener('click',event=>{if(event.target.closest('button'))closeMore()});
 document.addEventListener('pointerdown',event=>{if(!more.contains(event.target))closeMore()});
 document.addEventListener('focusin',event=>{if(!more.contains(event.target))closeMore()});
 if(mobileWidth.addEventListener)mobileWidth.addEventListener('change',arrangeToolbar);
 else mobileWidth.addListener?.(arrangeToolbar);
 new MutationObserver(arrangeToolbar).observe(toolbar,{childList:true,subtree:true});
 arrangeToolbar();
 const app=document.querySelector('.app'),left=document.querySelector('.left-rail'),stage=document.querySelector('.stage'),settings=document.querySelector('.right-rail');
 stage.dataset.mobilePanel='preview';settings.dataset.mobilePanel='settings';
 [...left.children].filter(panel=>panel.classList.contains('panel')).forEach(panel=>panel.dataset.mobilePanel=panel.dataset.studioPanel==='products'?'products':panel.querySelector('#templateList')?'templates':'catalog');
 app.classList.add('mobile-ui');app.dataset.mobileActive='preview';
 const nav=document.createElement('nav');nav.className='mobile-nav';nav.setAttribute('aria-label','Editor sections');
 function showPanel(id){
  if(id==='templates')id='preview';
  app.dataset.mobileActive=id;
  for(const button of nav.children)button.setAttribute('aria-pressed',String(button.dataset.panel===id));
  if(window.matchMedia('(max-width:820px)').matches)window.scrollTo({top:0,behavior:'instant'});
  if(id==='preview')updatePicker();
 }
 for(const [id,label] of [['templates','Templates'],['products','Products'],['preview','Preview'],['catalog','Catalog'],['settings','Settings']]){
  const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.panel=id;button.setAttribute('aria-pressed',String(id==='preview'));
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
