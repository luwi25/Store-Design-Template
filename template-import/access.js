(async()=>{
 const status=document.getElementById('accessStatus');
 try{
  const config=window.STORE_ACTIVITY_CONFIG;
  const session=JSON.parse(sessionStorage.getItem('store-service-session')||'null');
  if(!config?.enabled||!session?.token)throw Error('Sign in as Admin in the poster editor to open Template Import.');
  const response=await fetch(config.apiBase.replace(/\/$/,'')+'/session',{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000),headers:{Authorization:'Bearer '+session.token}});
  if(!response.ok||(await response.json()).store!=='all')throw Error('Template Import is available to Admin. Return to the poster editor and sign in.');
  for(const file of ['app.js','catalog.js','image-background.js'])await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=file;s.onload=resolve;s.onerror=()=>reject(Error('The import workspace could not load. Please reload.'));document.body.append(s)});
  document.querySelector('header').hidden=false;document.querySelector('main').hidden=false;status.hidden=true;
 }catch(e){status.textContent=e.message+' ';const link=document.createElement('a');link.href='../';link.textContent='Back to poster editor';status.append(link)}
})();
