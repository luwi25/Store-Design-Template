/* Shared monitoring and simple print approval. Does not control PDF/PNG exports. */
(function(){
 'use strict';
 const base=String(window.STORE_ACTIVITY_CONFIG?.apiBase||'').replace(/\/$/,'');
 const enabled=window.STORE_ACTIVITY_CONFIG?.enabled===true&&Boolean(base),sessionKey='store-service-session';let session=null,expired=()=>{};
 const names={'home-express':'Home Express Basak',pesoplus:'Pesoplus Mambaling','alkeia-talamban':'Alkeia Talamban',all:'Admin'};
 const templates={'home-everyday':'everyday','home-back':'homeBack','home-collection':'homeCollection','home-collection-front':'homeCollectionFront','peso-plus':'peso','peso-back':'pesoBack','peso-collection-front':'pesoCollectionFront','peso-collection-back':'pesoCollectionBack','alkeia-talamban-front':'alkeiaFront','alkeia-talamban-back':'alkeiaBack'};
 try{session=JSON.parse(sessionStorage.getItem(sessionKey)||'null')}catch{}
 function clear(){session=null;try{sessionStorage.removeItem(sessionKey)}catch{}}
 async function api(path,method='GET',data,authenticated=true){
  let response;
  try{response=await fetch(base+path,{method,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/json',...(authenticated&&session?.token?{Authorization:'Bearer '+session.token}:{})},...(data?{body:JSON.stringify(data)}:{})})}
  catch{throw Error('Cannot connect to the store service. Check your connection and retry.')}
  let result;try{result=await response.json()}catch{throw Error('The store service returned an invalid response.')}
  if(!response.ok){if(response.status===401&&authenticated){clear();expired()}throw Error(result.error||'The request failed. Please retry.')}
  return result;
 }
 async function login(store,password){
  const old=session;
  const result=await api('/login','POST',{store,password},false);
  if(result.store!==store||!/^[a-f0-9]{64}$/.test(result.token))throw Error('Invalid sign-in response.');
  // Stop the previous account's notifications when a shared device changes account.
  if(old?.store!==store&&navigator.serviceWorker){
   try{const registrations=new Set(await Promise.all([navigator.serviceWorker.getRegistration(),navigator.serviceWorker.getRegistration(new URL('notifications/',document.baseURI).href)]));
    for(const reg of registrations){const sub=await reg?.pushManager?.getSubscription();
     if(sub){await sub.unsubscribe();if(old?.token)fetch(base+'/push/unsubscribe',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+old.token},body:JSON.stringify({endpoint:sub.endpoint}),signal:AbortSignal.timeout(10000)}).catch(()=>{})}
    }
   }catch{}
  }
  session={store:result.store,token:result.token};
  try{sessionStorage.setItem(sessionKey,JSON.stringify(session))}catch{}
  if(old?.token)fetch(base+'/logout',{method:'POST',headers:{Authorization:'Bearer '+old.token},signal:AbortSignal.timeout(10000)}).catch(()=>{});
  return session.store;
 }
 async function restore(){if(!session?.token)return null;try{const result=await api('/session');session.store=result.store;return result.store}catch{clear();return null}}
 const node=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el};
 const timestamp=value=>value?new Date(value).toLocaleString('en-PH',{timeZone:'Asia/Manila'}):'No activity yet';
 window.StoreActivity={enabled,login,restore,setup};
 function setup({getState,getMode,getTemplate,renderPreview,directPrint,onExpired}){
  if(!enabled)return null;
  expired=()=>{for(const dialog of [printDialog,adminDialog,detail,notificationDialog,approvalDialog])if(dialog.open)dialog.close();items.replaceChildren();detail.querySelector('[data-preview]').removeAttribute('src');detailRow=null;viewKey='';baseline=null;onExpired()};
  const toolbar=document.querySelector('.top-actions'),printButton=document.getElementById('printBtn');
  const dashboard=node('button','Store activity','btn');dashboard.id='storeActivityDashboard';dashboard.type='button';dashboard.hidden=true;toolbar.append(dashboard);
  const sync=node('button','Activity sync pending — retry','btn btn-sm');sync.id='storeActivitySync';sync.type='button';sync.hidden=true;toolbar.append(sync);
  const printDialog=node('dialog',undefined,'store-service-dialog');printDialog.id='storePrintRequest';printDialog.setAttribute('aria-labelledby','storePrintTitle');
  printDialog.innerHTML='<div class="store-service-body"><h2 id="storePrintTitle">Print poster</h2><p data-template></p><img data-preview alt="Poster preview for admin review"><p data-status role="status" aria-live="polite"></p><label data-note-label>Note to admin (optional)<textarea data-note maxlength="1000" rows="3"></textarea></label><div class="store-service-actions"><button type="button" class="btn" data-close>Close</button><button type="button" class="btn btn-dark" data-send>Send request to admin</button><button type="button" class="btn" data-retry hidden>Retry</button></div></div>';
  document.body.append(printDialog);
  const ps=printDialog.querySelector('[data-status]'),note=printDialog.querySelector('[data-note]'),send=printDialog.querySelector('[data-send]'),retry=printDialog.querySelector('[data-retry]');
  const adminDialog=node('dialog',undefined,'store-service-dialog store-service-admin');adminDialog.id='storeAdminDashboard';adminDialog.setAttribute('aria-labelledby','storeAdminTitle');
  adminDialog.innerHTML='<div class="store-service-body"><div class="store-service-heading"><h2 id="storeAdminTitle">Store activity and print approvals</h2><button type="button" class="store-service-close" data-close aria-label="Close activity logs and print approvals" title="Close">&times;</button></div><div class="store-service-tabs"><button type="button" class="btn" data-tab="requests">Print approvals</button><button type="button" class="btn" data-tab="activity">Activity logs</button></div><form data-filters class="store-service-filters"><label>Store<select name="store"><option value="">All stores</option><option value="home-express">Home Express Basak</option><option value="pesoplus">Pesoplus Mambaling</option><option value="alkeia-talamban">Alkeia Talamban</option><option value="all">Admin</option></select></label><label data-request-filter>Status<select name="status"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="">All statuses</option></select></label><label data-log-filter hidden>Action<select name="action"><option value="">All actions</option><option value="sign_in">Sign-in</option><option value="template_opened">Template opened</option><option value="product_edited">Product edits saved</option><option value="print_requested">Print requested</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="print_initiated">Print initiated</option></select></label><label data-log-filter hidden>From<input type="date" name="from"></label><label data-log-filter hidden>To<input type="date" name="to"></label><label data-log-filter hidden>Template<select name="template"><option value="">All templates</option></select></label></form><p data-admin-status role="status" aria-live="polite"></p><div data-last-active></div><div data-items></div><button type="button" class="btn" data-older hidden>Older activity</button><button type="button" class="btn" data-close>Close</button></div>';
  document.body.append(adminDialog);
  const storeNotifications=node('button',undefined,'btn notification-bell');storeNotifications.id='storeNotifications';storeNotifications.type='button';storeNotifications.hidden=true;storeNotifications.title='Notifications';storeNotifications.setAttribute('aria-label','Notifications');storeNotifications.setAttribute('aria-haspopup','dialog');
  storeNotifications.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg><span class="notification-count" hidden aria-hidden="true"></span>';toolbar.append(storeNotifications);
  const notificationDialog=node('dialog',undefined,'store-service-dialog');notificationDialog.setAttribute('aria-label','Notifications');
  notificationDialog.innerHTML='<div class="store-service-body"><div class="store-service-heading"><h2>Notifications</h2><button type="button" class="store-service-close" data-close aria-label="Close notifications">&times;</button></div><button type="button" class="btn" data-read-all>Mark all as read</button><p data-inbox-status role="status" aria-live="polite"></p><div data-inbox-list></div><button type="button" class="btn" data-inbox-older hidden>Older notifications</button><details><summary>Push notification settings</summary><div data-settings></div></details></div>';document.body.append(notificationDialog);
  const approvalDialog=node('dialog',undefined,'store-service-dialog');approvalDialog.setAttribute('aria-label','Print request status');
  approvalDialog.innerHTML='<div class="store-service-body"><h2>Print request status</h2><p data-summary></p><img data-preview alt="Submitted poster"><p data-status role="status" aria-live="polite"></p><button type="button" class="btn" data-close>Close</button></div>';document.body.append(approvalDialog);
  const notifications=node('div',undefined,'store-push-settings');
  const notificationButton=node('button','Enable notifications','btn');notificationButton.type='button';notificationButton.id='adminPushNotifications';
  const notificationStatus=node('p','Get an alert on this device when a store requests approval or starts printing.');notificationStatus.setAttribute('role','status');notificationStatus.setAttribute('aria-live','polite');
  notifications.append(notificationButton,notificationStatus);adminDialog.querySelector('.store-service-tabs').before(notifications);
  let pushEnabled=false,pushBusy=false,pushRole=null;
  const pushHelp=()=>getMode()==='all'?'Get an alert on this device when a store requests approval or starts printing.':'Get an alert on this device when Admin approves your print request.';
  const pushOn=()=>getMode()==='all'?'Print-request and printing alerts are enabled on this device.':'Approval alerts are enabled on this device for '+(names[getMode()]||'your store')+'.';
  let inboxCursor=null,inboxLoad=0;
  const inboxList=notificationDialog.querySelector('[data-inbox-list]'),inboxStatus=notificationDialog.querySelector('[data-inbox-status]'),readAll=notificationDialog.querySelector('[data-read-all]');
  function showUnread(count){const badge=storeNotifications.querySelector('.notification-count');badge.hidden=!count;badge.textContent=count>99?'99+':String(count);storeNotifications.setAttribute('aria-label',count?'Notifications, '+count+' unread':'Notifications, no unread items');readAll.disabled=!count}
  async function loadInbox(older=false){
   if(!authenticated())return;const actor=session.token,version=++inboxLoad;
   inboxStatus.textContent='Loading notifications…';if(!older){inboxCursor=null;inboxList.replaceChildren()}
   try{const data=await api('/notifications'+(older&&inboxCursor?'?before='+encodeURIComponent(inboxCursor):''));
    if(session?.token!==actor||version!==inboxLoad)return;
    showUnread(data.unread);for(const item of data.notifications){
     const button=node('button',undefined,'notification-item'+(item.read_at?'':' is-unread'));button.type='button';
     button.append(node('strong',(item.read_at?'':'Unread · ')+(item.kind==='print_initiated'?(names[item.source_store]||'Store')+' started printing':item.kind==='approved'?'Print request approved':'Print approval requested')),node('span',item.template_name),node('small',timestamp(item.created_at)));
     if(item.ip_address)button.append(node('small','IP address: '+item.ip_address));
     button.onclick=async()=>{button.disabled=true;try{const result=await api('/notifications/read','POST',{id:item.id});if(session?.token!==actor)return;showUnread(result.unread);notificationDialog.close();openNotificationRequest(item.request_id)}catch(error){inboxStatus.textContent=error.message}finally{button.disabled=false}};
     inboxList.append(button);
    }
    inboxCursor=data.notifications.at(-1)?.id||null;notificationDialog.querySelector('[data-inbox-older]').hidden=data.notifications.length<50;
    inboxStatus.textContent=inboxList.children.length?'Opening a notification marks it as read.':'No notifications yet.';
   }catch(error){if(session?.token===actor&&version===inboxLoad)inboxStatus.textContent=error.message}
  }
  readAll.onclick=async()=>{readAll.disabled=true;const actor=session?.token;try{const result=await api('/notifications/read-all','POST',{});if(session?.token!==actor)return;showUnread(result.unread);await loadInbox()}catch(error){inboxStatus.textContent=error.message;readAll.disabled=false}};
  notificationDialog.querySelector('[data-inbox-older]').onclick=()=>loadInbox(true);
  storeNotifications.onclick=()=>{notificationDialog.openFor();loadInbox();checkNotifications()};
  const pushSupported=()=>window.isSecureContext&&'Notification' in window&&'serviceWorker' in navigator&&'PushManager' in window;
  async function pushRegistration(){
   // Preserve existing enrolled devices. New enrollment uses a worker with no offline cache install.
   const legacy=await navigator.serviceWorker.getRegistration();
   if(legacy?.active&&await legacy.pushManager?.getSubscription())return legacy;
   const scope=new URL('notifications/',document.baseURI).href;
   let reg=await navigator.serviceWorker.getRegistration(scope);
   if(reg?.scope!==scope){
    try{reg=await navigator.serviceWorker.register(new URL('notification-worker.js',document.baseURI).href,{scope,updateViaCache:'none'})}
    catch(error){
     let diagnosis='';
     try{const response=await fetch(new URL('notification-worker.js',document.baseURI),{cache:'no-store',signal:AbortSignal.timeout(5000)});
      if(!response.ok)diagnosis='The notification file is unavailable (HTTP '+response.status+'). Restart the local app or deploy the latest website files, then retry.';
     }catch{}
     throw Error(diagnosis||'The browser could not start notifications: '+(error.message||error.name||'Unknown error')+'. Check this site’s browser permissions and retry.');
    }
   }
   if(reg.active&&reg.active.state==='activated')return reg;
   notificationStatus.textContent='Starting notifications…';
   await new Promise((resolve,reject)=>{
    const worker=reg.installing||reg.waiting||reg.active;
    if(!worker){reject(Error('Notifications could not start. Please retry.'));return}
    const finish=error=>{clearTimeout(timer);worker.removeEventListener('statechange',check);error?reject(error):resolve()};
    const check=()=>{if(worker.state==='activated')finish();else if(worker.state==='redundant')finish(Error('Notification setup failed. Check your connection and retry.'))};
    const timer=setTimeout(()=>finish(Error('Notification setup is taking longer than expected. Check your connection and try again.')),15000);
    worker.addEventListener('statechange',check);check();
   });
   return reg;
  }
  async function checkNotifications(){
   if(pushBusy)return;
   if(!pushSupported()){notificationButton.disabled=true;notificationStatus.textContent='Notifications are unavailable here. On iPhone or iPad, add this site to the Home Screen and open the installed app.';return}
   notificationButton.disabled=true;
   try{const reg=await pushRegistration(),sub=await reg.pushManager.getSubscription();
    pushEnabled=Boolean(sub&&(await api('/push/status','POST',{endpoint:sub.endpoint})).enabled);
    notificationButton.textContent=pushEnabled?'Disable notifications':'Enable notifications';
    notificationStatus.textContent=pushEnabled?pushOn():Notification.permission==='denied'?'Notifications are blocked. Allow them in your browser settings, then try again.':pushHelp();
   }catch(error){notificationStatus.textContent=error.message}
   finally{notificationButton.disabled=false}
  }
  notificationButton.onclick=async()=>{
   if(pushBusy||!authenticated())return;
   pushBusy=true;notificationButton.disabled=true;
   const actor=session.token;
   // Ask directly within the click gesture (required by Safari).
   const permission=!pushEnabled?Notification.requestPermission():Promise.resolve(Notification.permission);
   notificationStatus.textContent=pushEnabled?'Turning notifications off…':'Enabling notifications…';
   let created=null;
   try{
    if(await permission!=='granted'&&!pushEnabled)throw Error('Notifications were not allowed. You can enable them in browser settings.');
    const reg=await pushRegistration();let sub=await reg.pushManager.getSubscription();
    if(pushEnabled){
     await api('/push/unsubscribe','POST',{endpoint:sub?.endpoint||''});await sub?.unsubscribe();pushEnabled=false;
    }else{
     const config=await api('/push/config');if(!config.configured)throw Error('Notifications are not ready yet. Complete the Admin notification setup, then try again.');
     const key=Uint8Array.from(atob(config.publicKey.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
     if(sub&&sub.options.applicationServerKey&&Array.from(new Uint8Array(sub.options.applicationServerKey)).join()!==Array.from(key).join()){await sub.unsubscribe();sub=null}
     if(!sub){sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});created=sub}
     if(session?.token!==actor||!authenticated())throw Error('Sign in again to enable notifications.');
     await api('/push/subscribe','POST',sub.toJSON());pushEnabled=true;
    }
    notificationButton.textContent=pushEnabled?'Disable notifications':'Enable notifications';
    notificationStatus.textContent=pushEnabled?pushOn():'Notifications are off on this device.';
   }catch(error){if(created)await created.unsubscribe().catch(()=>{});notificationStatus.textContent=error.message}
   finally{pushBusy=false;notificationButton.disabled=false}
  };
  const detail=node('dialog',undefined,'store-service-dialog');detail.setAttribute('aria-label','Review print request');
  detail.innerHTML='<div class="store-service-body"><h2>Review print request</h2><p data-summary></p><img data-preview alt="Submitted poster preview"><p data-note></p><label>Comment (optional)<textarea data-comment rows="3" maxlength="1000"></textarea></label><p data-status role="status" aria-live="polite"></p><div class="store-service-actions"><button type="button" class="btn" data-close>Close</button><button type="button" class="btn" data-decision="rejected">Reject</button><button type="button" class="btn btn-dark" data-decision="approved">Approve</button></div></div>';
  document.body.append(detail);
  for(const dialog of [printDialog,adminDialog,detail,notificationDialog,approvalDialog]){
   let trigger;for(const close of dialog.querySelectorAll('[data-close]'))close.onclick=()=>dialog.close();
   dialog.addEventListener('close',()=>trigger?.focus());dialog.addEventListener('cancel',event=>{if(dialog.getAttribute('aria-busy')==='true')event.preventDefault()});
   dialog.openFor=()=>{trigger=document.activeElement;dialog.showModal()};
  }
  let activeTemplate=null,request=null,requestKey=null,printBusy=false,preview='',viewKey='',baseline=null,flushing=false,polling=false,tab='requests',cursor=null,detailRow=null;
  function setBusy(dialog,value){dialog.setAttribute('aria-busy',String(value));for(const b of dialog.querySelectorAll('button,textarea,input,select'))b.disabled=value}
  const authenticated=()=>session&&session.store===getMode();
  function snapshot(state,templateId=state.templateId){
   const rows=state[templates[templateId]]?.slots||[];
   return rows.map(slot=>{const p=state.products.find(item=>item.id===slot.productId),effective={...p,...slot.details};return {id:slot.productId,name:effective.name||'',price:effective.price??'',image:slot.image||effective.image||null,discount:slot.discountPercent??'',textSizes:JSON.stringify(slot.textSizes||{})}});
  }
  const ownsTemplate=id=>getMode()==='all'||(id.startsWith('alkeia-')?'alkeia-talamban':id.startsWith('peso-')?'pesoplus':'home-express')===getMode();
  const capture=state=>Object.fromEntries(Object.keys(templates).filter(ownsTemplate).map(id=>[id,snapshot(state,id)]));
  function readQueue(){try{return JSON.parse(sessionStorage.getItem('store-activity-outbox:'+session.store)||'[]')}catch{return []}}
  function writeQueue(queue){try{sessionStorage.setItem('store-activity-outbox:'+session.store,JSON.stringify(queue));return true}catch{sync.hidden=false;sync.textContent='Activity could not be queued — retry';return false}}
  function queue(data){if(!authenticated())return;const list=readQueue();list.push({id:crypto.randomUUID(),...data});if(writeQueue(list))flush()}
  async function flush(){
   if(flushing||!authenticated()||navigator.onLine===false)return;
   flushing=true;const actor=session.store;
   try{
    while(session?.store===actor){const list=readQueue();if(!list.length)break;await api('/events','POST',list[0]);if(session?.store!==actor)break;const next=readQueue().filter(item=>item.id!==list[0].id);if(!writeQueue(next))throw Error('Browser storage is full. Activity could not be marked as sent.')}
    sync.hidden=true;
   }catch(error){sync.hidden=false;sync.textContent='Activity sync pending — retry';sync.title=error.message}
   finally{flushing=false}
  }
  sync.onclick=flush;
  function view(){
   if(pushRole!==getMode()){
    pushRole=getMode();pushEnabled=false;notificationButton.textContent='Enable notifications';notificationStatus.textContent=pushHelp();
    inboxLoad++;inboxList.replaceChildren();inboxCursor=null;showUnread(0);
    if(notificationDialog.open)notificationDialog.close();if(approvalDialog.open)approvalDialog.close();
   }
   dashboard.hidden=!authenticated()||getMode()!=='all';
   storeNotifications.hidden=!authenticated();
   const parent=notificationDialog.querySelector('[data-settings]');
   if(notifications.parentElement!==parent){parent.append(notifications);pushEnabled=false;notificationButton.textContent='Enable notifications';notificationStatus.textContent=pushHelp()}
   if(authenticated()&&pendingPushRequest){const id=pendingPushRequest;pendingPushRequest='';const url=new URL(location.href);url.searchParams.delete('printRequest');history.replaceState(null,'',url);openNotificationRequest(id)}
   if(!authenticated()){sync.hidden=true;printButton.textContent='Print poster';viewKey='';baseline=null;return}
   const info=getTemplate(),key=session.store+':'+info.id;
   if(!baseline||!viewKey.startsWith(session.store+':'))baseline=capture(getState());
   if(!templates[info.id]){return}
   if(viewKey!==key){viewKey=key;queue({action:'template_opened',templateId:info.id,templateName:info.name.slice(0,160)});poll()}
  }
  function saved(state){
   if(!authenticated())return;
   if(!baseline){baseline=capture(state);return}
   for(const templateId of Object.keys(templates).filter(ownsTemplate)){
    const rows=snapshot(state,templateId),previous=baseline[templateId]||[];
    for(let i=0;i<Math.max(rows.length,previous.length);i++){
    const row=rows[i]||{name:'Empty slot'},old=previous[i]||{name:'Empty slot'};
    const changes=[];
    if(row.id!==old.id)changes.push({field:'product',before:String(old.name).slice(0,500),after:String(row.name).slice(0,500)});
    else for(const field of ['name','price','image','discount','textSizes'])if(old[field]!==row[field])changes.push({field,before:field==='image'?(old.image?'Previous photo':'No photo'):String(old[field]).slice(0,500),after:field==='image'?(row.image?'Updated photo':'No photo'):String(row[field]).slice(0,500)});
    if(changes.length)queue({action:'product_edited',templateId,templateName:String(state.templateNames?.[templateId]||templateLabels[templateId]).slice(0,160),productName:String(row.name).slice(0,160),changes});
    }baseline[templateId]=rows;
   }
  }
  function showRequest(){
   const pending=request?.status==='pending',accepted=request?.status==='approved'&&request.can_print===true;
   const expiredApproval=request?.status==='approved'&&request.can_print===false;
   const needsUpdate=request?.status==='approved'&&typeof request.can_print!=='boolean';
   send.hidden=pending||accepted||needsUpdate;note.parentElement.hidden=pending||accepted||needsUpdate;
   ps.textContent=pending?'Waiting for admin approval. Submitted '+timestamp(request.created_at)
    :accepted?'Approved until '+timestamp(request.expires_at)+'. Close this window and use Print poster.'
    :expiredApproval?'Approval expired. Send a new request to admin.'
    :needsUpdate?'Approval settings need updating in Supabase. Contact admin.'
    :request?.status==='rejected'?'Request rejected. '+(request.comment||'You can send another request.')
    :'Send this poster preview to the admin for approval.';
   if(accepted&&request.comment)ps.textContent+=' '+request.comment;
  }
  async function loadRequest(){const data=await api('/requests?template='+encodeURIComponent(activeTemplate.id));request=data.requests[0]||null;showRequest()}
  async function requestPrint(){
   if(!authenticated()){onExpired();return}
   if(!templates[getTemplate().id]){alert('Print approval is available for supported Home Express Basak and Pesoplus Mambaling templates.');return}
   if(printDialog.open||printBusy)return;
   if(getMode()==='all'){
    const info=getTemplate();printBusy=true;try{await api('/events','POST',{id:crypto.randomUUID(),action:'print_initiated',templateId:info.id,templateName:info.name});await directPrint()}catch(error){alert(error.message)}finally{printBusy=false}return;
   }
   activeTemplate=getTemplate();const actor=session.store;
   requestKey=crypto.randomUUID();request=null;preview='';note.value='';
   printBusy=true;printButton.textContent='Checking approval?';
   try{
    await loadRequest();
    if(!authenticated()||session.store!==actor||getTemplate().id!==activeTemplate.id)return;
    if(request?.status==='approved'&&request.can_print===true){
     try{await api('/requests/'+request.id+'/print','POST',{id:crypto.randomUUID()})}
     catch(error){
      // Approval may expire between loading status and authorizing printing.
      await loadRequest();
      if(request?.can_print===true)throw error;
     }
     if(request?.can_print===true){
      if(authenticated()&&session.store===actor&&getTemplate().id===activeTemplate.id)await directPrint();
      return;
     }
    }
   }catch(error){if(authenticated())alert(error.message);return}
   finally{printBusy=false;printButton.textContent='Print poster'}
   if(!authenticated()||session.store!==actor||getTemplate().id!==activeTemplate.id)return;
   printDialog.querySelector('[data-template]').textContent=names[getMode()]+' ? '+activeTemplate.name;
   printDialog.querySelector('[data-preview]').removeAttribute('src');ps.textContent='Loading poster and approval status?';send.hidden=true;retry.hidden=true;
   printDialog.openFor();await prepare();
  }
  async function prepare(){
   printBusy=true;setBusy(printDialog,true);retry.hidden=true;
   try{await loadRequest();preview=await renderPreview();printDialog.querySelector('[data-preview]').src=preview}
   catch(error){ps.textContent=error.message;send.hidden=true;retry.hidden=false}
   finally{printBusy=false;setBusy(printDialog,false)}
  }
  retry.onclick=prepare;
  send.onclick=async()=>{
   if(printBusy)return;printBusy=true;setBusy(printDialog,true);ps.textContent='Sending request to admin…';
   try{if(getTemplate().id!==activeTemplate.id)throw Error('The selected template changed. Close this request and open Print poster again.');await api('/requests','POST',{id:requestKey,templateId:activeTemplate.id,templateName:activeTemplate.name,note:note.value,preview});await loadRequest();requestKey=crypto.randomUUID();printButton.textContent='Print poster'}
   catch(error){ps.textContent=error.message+' Your note is still here; try sending again.'}
   finally{printBusy=false;setBusy(printDialog,false)}
  };
  const filters=adminDialog.querySelector('[data-filters]'),items=adminDialog.querySelector('[data-items]'),adminStatus=adminDialog.querySelector('[data-admin-status]');
  const templateLabels={'alkeia-talamban-back':'Alkeia Talamban - Template #1 Back','alkeia-talamban-front':'Alkeia Talamban - Template #1 Front','peso-collection-back':'Pesoplus Mambaling - Template #2 Back','peso-collection-front':'Pesoplus Mambaling - Template #2 Front','home-everyday':'Home Express Basak — Front','home-back':'Home Express Basak — Back','home-collection':'Home Express Basak — Back (Blue & Orange)','home-collection-front':'Home Express Basak — Front (Blue & Orange)','peso-plus':'Pesoplus Mambaling — Front','peso-back':'Pesoplus Mambaling — Back'};
  for(const id of Object.keys(templates)){const option=node('option',templateLabels[id]);option.value=id;filters.elements.template.append(option)}
  adminDialog.querySelector('[data-tab="requests"]').setAttribute('aria-pressed','true');
  function params(){const query=new URLSearchParams();for(const key of tab==='activity'?['store','action','from','to','template']:['store','status'])if(filters.elements[key].value)query.set(key,filters.elements[key].value);if(cursor&&tab==='activity')query.set('before',cursor);return query.toString()}
  let dashboardLoad=0;
  adminDialog.addEventListener('close',()=>{dashboardLoad++;adminDialog.removeAttribute('aria-busy')});
  async function loadDashboard(){
   if(!authenticated()||getMode()!=='all'||!adminDialog.open)return;
   const load=++dashboardLoad,requestTab=tab,query=params(),token=session.token;
   const current=()=>load===dashboardLoad&&adminDialog.open&&authenticated()&&getMode()==='all'&&session.token===token;
   adminDialog.setAttribute('aria-busy','true');items.replaceChildren();adminDialog.querySelector('[data-last-active]').replaceChildren();adminDialog.querySelector('[data-older]').hidden=true;adminStatus.textContent='Loading…';
   try{
    const data=await api('/'+requestTab+'?'+query);if(!current())return;
    if(requestTab==='activity'){
     const last=adminDialog.querySelector('[data-last-active]');last.replaceChildren();for(const role of ['home-express','pesoplus','alkeia-talamban'])last.append(node('p',names[role]+' · Last activity: '+timestamp(data.lastActive.find(item=>item.store===role)?.last_active)));
     for(const event of data.events.filter(event=>filters.elements.store.value||['home-express','pesoplus','alkeia-talamban'].includes(event.store))){const card=node('article',undefined,'store-service-card');card.append(node('strong',(names[event.store]||event.store)+' · '+event.action.replaceAll('_',' ')),node('small',timestamp(event.created_at)),node('p',event.template_name||''));card.append(node('p','IP address: '+(event.details?.ipAddress||'Not recorded')));if(event.details.product)card.append(node('p',event.details.product));for(const change of event.details.changes||[])card.append(node('p',change.field+': '+change.before+' → '+change.after));if(event.details.comment)card.append(node('p',event.details.comment));items.append(card)}
     cursor=data.next;adminDialog.querySelector('[data-older]').hidden=!cursor;
    }else{
     adminDialog.querySelector('[data-last-active]').replaceChildren();adminDialog.querySelector('[data-older]').hidden=true;
     for(const request of data.requests){const card=node('article',undefined,'store-service-card');card.append(node('strong',names[request.store]+' · '+request.template_name),node('small',timestamp(request.created_at)+' · '+request.status));const open=node('button','Review request','btn');open.type='button';open.onclick=()=>openDetail(request.id);card.append(open);items.append(card)}
    }
    adminStatus.textContent=items.children.length?'Showing '+items.children.length+' records.':'No records match these filters.';
   }catch(error){if(current())adminStatus.textContent=error.message+' Reopen this window or change a filter to retry.'}
   finally{if(current())adminDialog.removeAttribute('aria-busy')}
  }
  dashboard.onclick=()=>{adminDialog.openFor();cursor=null;loadDashboard();checkNotifications()};
  filters.onsubmit=event=>{event.preventDefault();cursor=null;loadDashboard()};
  filters.addEventListener('change',event=>{if(event.target.matches('select,input[type="date"]')){cursor=null;loadDashboard()}});
  adminDialog.querySelector('[data-older]').onclick=loadDashboard;
  for(const button of adminDialog.querySelectorAll('[data-tab]'))button.onclick=()=>{
   tab=button.dataset.tab;cursor=null;
   for(const child of adminDialog.querySelectorAll('[data-tab]'))child.setAttribute('aria-pressed',String(child===button));
   for(const field of adminDialog.querySelectorAll('[data-log-filter]'))field.hidden=tab!=='activity';adminDialog.querySelector('[data-request-filter]').hidden=tab!=='requests';loadDashboard();
  };
  async function openDetail(id){
   detail.openFor();detail.querySelector('[data-status]').textContent='Loading request…';detail.querySelector('[data-preview]').removeAttribute('src');setBusy(detail,true);
   try{detailRow=await api('/requests/'+id);detail.querySelector('[data-summary]').textContent=names[detailRow.store]+' · '+detailRow.template_name+' · '+timestamp(detailRow.created_at);detail.querySelector('[data-preview]').src=detailRow.preview;detail.querySelector('[data-note]').textContent=detailRow.note||'No note from store.';detail.querySelector('[data-comment]').value=detailRow.comment;detail.querySelector('[data-status]').textContent=detailRow.status}
   catch(error){detailRow=null;detail.querySelector('[data-status]').textContent=error.message}
   finally{setBusy(detail,false);for(const b of detail.querySelectorAll('[data-decision]'))b.disabled=!detailRow||detailRow.status!=='pending'}
  }
  for(const button of detail.querySelectorAll('[data-decision]'))button.onclick=async()=>{
   setBusy(detail,true);const status=detail.querySelector('[data-status]');status.textContent='Saving decision…';
   try{await api('/requests/'+detailRow.id+'/decision','POST',{status:button.dataset.decision,comment:detail.querySelector('[data-comment]').value});detailRow.status=button.dataset.decision;status.textContent='Request '+detailRow.status+'. The store will see the decision.';loadDashboard()}
   catch(error){status.textContent=error.message}
   finally{setBusy(detail,false);for(const b of detail.querySelectorAll('[data-decision]'))b.disabled=!detailRow||detailRow.status!=='pending'}
  };
  async function poll(){
   if(polling||document.hidden||!authenticated()||navigator.onLine===false)return;polling=true;
   const identity=session.store,tid=getTemplate().id;
   try{
    const token=session.token;const counts=await api('/notifications/count').catch(()=>null);if(counts&&session?.token===token)showUnread(counts.unread);
    if(!authenticated())return;
    if(notificationDialog.open&&inboxList.children.length<=50)loadInbox();
    if(identity==='all'){const data=await api('/requests?status=pending');if(session?.store===identity)dashboard.textContent='Store activity'+(data.requests.length?' · '+data.requests.length+' pending':'')}
    else if(templates[tid]){
     const data=await api('/requests?template='+encodeURIComponent(tid));if(session?.store!==identity||getTemplate().id!==tid)return;
     const latest=data.requests[0];if(!printBusy)printButton.textContent='Print poster';
     if(printDialog.open&&!printBusy&&activeTemplate?.id===tid&&latest?.id===request?.id){request=latest;showRequest()}
    }
   }catch{}finally{polling=false}
  }
  setInterval(()=>{poll();flush()},30000);window.addEventListener('online',()=>{poll();flush()});document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll()});
  async function openNotificationRequest(id){
   const viewer=session?.token;
   try{const counts=await api('/notifications/read','POST',{requestId:id});if(session?.token===viewer)showUnread(counts.unread)}catch{}
   if(session?.token!==viewer||!authenticated())return;
   if(getMode()==='all'){openDetail(id);return}
   const actor=session?.token;approvalDialog.openFor();approvalDialog.querySelector('[data-summary]').textContent='';approvalDialog.querySelector('[data-preview]').removeAttribute('src');
   const status=approvalDialog.querySelector('[data-status]');status.textContent='Checking approval…';
   try{const row=await api('/requests/'+id);if(session?.token!==actor||!authenticated()){approvalDialog.close();return}
    approvalDialog.querySelector('[data-summary]').textContent=row.template_name;approvalDialog.querySelector('[data-preview]').src=row.preview;
    status.textContent=row.status==='approved'?(row.can_print?'Approved until '+timestamp(row.expires_at)+'. Close this notice, select this template and use Print poster.':'This approval has expired. Send a new print request.') :row.status==='rejected'?'This print request was rejected.':'This print request is waiting for Admin approval.';
   }catch(error){status.textContent=error.message}
  }
  let pendingPushRequest=new URL(location.href).searchParams.get('printRequest')||'';
  if(!/^[a-zA-Z0-9_-]{8,80}$/.test(pendingPushRequest))pendingPushRequest='';
  navigator.serviceWorker?.addEventListener('message',event=>{
   if(event.data?.type!=='open-print-request'||!/^[a-zA-Z0-9_-]{8,80}$/.test(event.data.requestId||''))return;
   pendingPushRequest=event.data.requestId;
   if(authenticated()){const id=pendingPushRequest;pendingPushRequest='';openNotificationRequest(id)}
  });
  return {view,saved,requestPrint};
 }
})();
