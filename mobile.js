(() => {
 const app=document.querySelector('.app'),left=document.querySelector('.left-rail'),stage=document.querySelector('.stage'),settings=document.querySelector('.right-rail');
 stage.dataset.mobilePanel='preview';settings.dataset.mobilePanel='settings';
 [...left.children].forEach((panel,i)=>panel.dataset.mobilePanel=i===0?'templates':'products');
 app.classList.add('mobile-ui');app.dataset.mobileActive='preview';
 const nav=document.createElement('nav');nav.className='mobile-nav';nav.setAttribute('aria-label','Editor sections');
 for(const [id,label] of [['preview','Preview'],['templates','Templates'],['products','Products'],['settings','Settings']]){
  const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('aria-pressed',String(id==='preview'));
  button.onclick=()=>{app.dataset.mobileActive=id;for(const other of nav.children)other.setAttribute('aria-pressed',String(other===button));window.scrollTo({top:0,behavior:'instant'});if(id==='preview')updatePicker()};nav.append(button);
 }
 app.append(nav);
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
 new MutationObserver(updatePicker).observe(poster,{childList:true,subtree:true});updatePicker();
 // Phone keyboard resizing is handled by dynamic viewport units in mobile.css.
})();
