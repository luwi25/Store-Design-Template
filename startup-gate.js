/* Authenticate before loading catalog data or template artwork. Reuses the store dialog. */
window.StoreStartup={choice:null,ready:null};
window.StoreStartup.ready=(async()=>{
 if(!window.StoreActivity?.enabled)return null;
 const dialog=document.getElementById('storeChooserDialog'),form=document.getElementById('storePasswordGate'),choices=document.getElementById('storeChoiceButtons');
 const username=document.getElementById('storeUsername'),password=document.getElementById('storePassword'),error=document.getElementById('storePasswordError'),label=document.getElementById('storePasswordLabel');
 const close=dialog.querySelector('.icon-btn'),controller=new AbortController(),options={signal:controller.signal};
 const finish=choice=>{window.StoreStartup.choice=choice;controller.abort();close.hidden=false;password.value='';username.value='';form.hidden=false;choices.hidden=true;dialog.close();return choice};
 close.hidden=true;dialog.addEventListener('cancel',event=>event.preventDefault(),options);
 // Existing sessions are checked before showing a second sign-in prompt.
 let hasSession=false;try{hasSession=Boolean(JSON.parse(sessionStorage.getItem('store-service-session')||'null')?.token)}catch{}
 if(hasSession){const restored=await window.StoreActivity.restore();if(restored)return finish(restored)}
 choices.hidden=true;form.hidden=false;document.getElementById('storePasswordCancel').hidden=true;dialog.showModal();username.focus();
 return new Promise(resolve=>{
  let busy=false;
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(busy)return;
   const selected=window.StoreActivity.resolveUsername(username.value);
   if(!selected){error.textContent='Incorrect username or password.';return}
   busy=true;error.textContent='Signing in?';
   const controls=[...form.querySelectorAll('input,button')];controls.forEach(el=>el.disabled=true);
   try{const choice=await window.StoreActivity.login(selected,password.value);resolve(finish(choice))}
   catch(e){error.textContent=e.message==='Incorrect password.'?'Incorrect username or password.':e.message}
   finally{busy=false;controls.forEach(el=>el.disabled=false);password.value='';if(dialog.open)password.focus()}
  },options);
 });
})();
