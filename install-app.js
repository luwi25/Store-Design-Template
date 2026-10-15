(() => {
 const button=document.createElement('button');button.id='installApp';button.className='btn btn-dark';button.type='button';button.textContent='Install app';
 document.querySelector('.top-actions').append(button);
 let deferred;
 const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 button.hidden=standalone();
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferred=event;button.hidden=standalone()});
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
  navigator.serviceWorker.register('./sw.js').then(registration=>{
   const showReady=()=>{offline.textContent='App files are ready for offline use. To receive updates, open the app online and close all its tabs before reopening.'};
   if(registration.active)showReady();
   navigator.serviceWorker.ready.then(showReady);
  }).catch(()=>{offline.textContent='Offline download could not finish. You can still use the app online; reconnect and reload to retry.'});
 }
})();
