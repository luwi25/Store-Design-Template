(() => {
 const button=document.createElement('button');button.id='installApp';button.className='btn';button.type='button';button.textContent='Install app';
 document.querySelector('.top-actions').append(button);
 let deferred;
 const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 // Installation stays available through the browser menu; hide the in-page control.
 button.hidden=true;
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferred=event;button.hidden=true});
 window.addEventListener('appinstalled',()=>{deferred=null;button.hidden=true});
 const dialog=document.createElement('dialog');dialog.className='install-dialog';dialog.setAttribute('aria-labelledby','installHeading');
 const heading=document.createElement('h2');heading.id='installHeading';heading.textContent='Install Store Design';
 const help=document.createElement('p');help.textContent=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)
  ? 'On iPhone or iPad, open this site in Safari. Tap Share, choose Add to Home Screen, then tap Add.'
  : 'Open your browser menu and choose Install app or Add to Home screen. On desktop, look for the install icon in the address bar.';
 const data=document.createElement('p');data.textContent='Your edits stay on this device. Download a backup before installing if you already have edits, then import it if the installed app opens with a separate storage area.';
 const offline=document.createElement('p');offline.id='offlineStatus';offline.textContent='Keep this page open online while the app files download for offline use.';
 const close=document.createElement('button');close.className='btn btn-primary';close.type='button';close.textContent='Got it';close.onclick=()=>dialog.close();
 dialog.append(heading,help,data,offline,close);document.body.append(dialog);
 button.onclick=async()=>{
  if(deferred){const prompt=deferred;deferred=null;await prompt.prompt();await prompt.userChoice}
  else dialog.showModal();
  if(navigator.storage?.persist)navigator.storage.persist().catch(()=>{});
 };
 if('serviceWorker' in navigator){
  let controlled=Boolean(navigator.serviceWorker.controller),updatePending=false,reloading=false,retryTimer=null;
  const refreshWhenReady=()=>{
   if(!updatePending||reloading||document.hidden||navigator.onLine===false)return;
   if(typeof window.flashSaleActions?.canReloadForUpdate!=='function'||!window.flashSaleActions.canReloadForUpdate())return;
   if(document.querySelector('dialog[open], [aria-busy="true"]')||document.querySelector('.app')?.inert||document.body.classList.contains('printing-top'))return;
   if(document.getElementById('printBtn')?.disabled||document.activeElement?.matches('input,textarea,select,[contenteditable="true"]'))return;
   reloading=true;clearInterval(retryTimer);location.reload();
  };
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
   // The first installation only prepares offline use; later controllers are updates.
   if(!controlled){controlled=true;return}
   updatePending=true;
   if(!retryTimer)retryTimer=setInterval(refreshWhenReady,1000);
   refreshWhenReady();
  });
  window.addEventListener('online',refreshWhenReady);
  window.addEventListener('afterprint',refreshWhenReady);
  document.addEventListener('visibilitychange',refreshWhenReady);
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(registration=>{
   const showReady=()=>{offline.textContent='App files are ready for offline use. New versions refresh automatically when your work is saved and the editor is idle. Your saved products stay on this device.'};
   let checking=false,lastCheck=0;
   const checkUpdate=async()=>{
    if(checking||navigator.onLine===false||Date.now()-lastCheck<15000)return;
    checking=true;lastCheck=Date.now();
    try{await registration.update()}catch{}finally{checking=false}
   };
   checkUpdate();
   window.addEventListener('online',checkUpdate);
   document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkUpdate()});
   setInterval(()=>{if(!document.hidden)checkUpdate()},60000);
   if(registration.active)showReady();
   navigator.serviceWorker.ready.then(showReady);
  }).catch(()=>{offline.textContent='Offline download could not finish. You can still use the app online; reconnect and reload to retry.'});
 }
})();
