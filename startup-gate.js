/* Authenticate before loading catalog data or template artwork. Reuses the store dialog. */
window.StoreStartup={choice:null,ready:null};
window.StoreStartup.ready=(async()=>{
 if(!window.StoreActivity?.enabled)return null;
 const dialog=document.getElementById('storeChooserDialog'),form=document.getElementById('storePasswordGate'),choices=document.getElementById('storeChoiceButtons');
 const password=document.getElementById('storePassword'),error=document.getElementById('storePasswordError'),label=document.getElementById('storePasswordLabel');
 const close=dialog.querySelector('.icon-btn'),controller=new AbortController(),options={signal:controller.signal};
 const finish=choice=>{window.StoreStartup.choice=choice;controller.abort();close.hidden=false;password.value='';form.hidden=true;choices.hidden=false;dialog.close();return choice};
 close.hidden=true;dialog.addEventListener('cancel',event=>event.preventDefault(),options);
 // Existing sessions are checked before showing a second sign-in prompt.
 let hasSession=false;try{hasSession=Boolean(JSON.parse(sessionStorage.getItem('store-service-session')||'null')?.token)}catch{}
 if(hasSession){const restored=await window.StoreActivity.restore();if(restored)return finish(restored)}
 dialog.showModal();
 return new Promise(resolve=>{
  let selected=null,busy=false;
  for(const button of choices.querySelectorAll('[data-store]'))button.addEventListener('click',()=>{selected=button.dataset.store;label.textContent='Password for '+button.querySelector('b').textContent;choices.hidden=true;form.hidden=false;error.textContent='';password.focus()},options);
  document.getElementById('storePasswordCancel').addEventListener('click',()=>{selected=null;password.value='';form.hidden=true;choices.hidden=false;error.textContent=''},options);
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(busy||!selected)return;busy=true;
   const controls=[...form.querySelectorAll('input,button')];controls.forEach(el=>el.disabled=true);
   try{const choice=await window.StoreActivity.login(selected,password.value);resolve(finish(choice))}
   catch(e){error.textContent=e.message}
   finally{busy=false;controls.forEach(el=>el.disabled=false);password.value='';if(dialog.open)password.focus()}
  },options);
 });
})();
