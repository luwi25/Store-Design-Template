/* Shared monitoring and simple print approval. Does not control PDF/PNG exports. */
(function(){
 'use strict';
 const base=String(window.STORE_ACTIVITY_CONFIG?.apiBase||'').replace(/\/$/,'');
 const enabled=window.STORE_ACTIVITY_CONFIG?.enabled===true&&Boolean(base),sessionKey='store-service-session';let session=null,expired=()=>{};
 const names={'home-express':'Home Express',pesoplus:'PesoPlus',all:'All Stores'};
 const templates={'home-everyday':'everyday','home-back':'homeBack','home-collection':'homeCollection','home-collection-front':'homeCollectionFront','peso-plus':'peso','peso-back':'pesoBack'};
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
  expired=()=>{for(const dialog of [printDialog,adminDialog,detail])if(dialog.open)dialog.close();items.replaceChildren();detail.querySelector('[data-preview]').removeAttribute('src');detailRow=null;viewKey='';baseline=null;onExpired()};
  const toolbar=document.querySelector('.top-actions'),printButton=document.getElementById('printBtn');
  const dashboard=node('button','Store activity','btn');dashboard.id='storeActivityDashboard';dashboard.type='button';dashboard.hidden=true;toolbar.append(dashboard);
  const sync=node('button','Activity sync pending — retry','btn btn-sm');sync.id='storeActivitySync';sync.type='button';sync.hidden=true;toolbar.append(sync);
  const notification=node('button','','btn btn-sm');notification.id='storeApprovalNotice';notification.type='button';notification.hidden=true;toolbar.append(notification);
  const printDialog=node('dialog',undefined,'store-service-dialog');printDialog.id='storePrintRequest';printDialog.setAttribute('aria-labelledby','storePrintTitle');
  printDialog.innerHTML='<div class="store-service-body"><h2 id="storePrintTitle">Print poster</h2><p data-template></p><img data-preview alt="Poster preview for admin review"><p data-status role="status" aria-live="polite"></p><label data-note-label>Note to admin (optional)<textarea data-note maxlength="1000" rows="3"></textarea></label><div class="store-service-actions"><button type="button" class="btn" data-close>Close</button><button type="button" class="btn btn-dark" data-send>Send request to admin</button><button type="button" class="btn btn-dark" data-print hidden>Approved — Print poster</button><button type="button" class="btn" data-retry hidden>Retry</button></div></div>';
  document.body.append(printDialog);
  const ps=printDialog.querySelector('[data-status]'),note=printDialog.querySelector('[data-note]'),send=printDialog.querySelector('[data-send]'),approved=printDialog.querySelector('[data-print]'),retry=printDialog.querySelector('[data-retry]');
  const adminDialog=node('dialog',undefined,'store-service-dialog store-service-admin');adminDialog.id='storeAdminDashboard';adminDialog.setAttribute('aria-labelledby','storeAdminTitle');
  adminDialog.innerHTML='<div class="store-service-body"><h2 id="storeAdminTitle">Store activity and print approvals</h2><div class="store-service-tabs"><button type="button" class="btn" data-tab="requests">Print approvals</button><button type="button" class="btn" data-tab="activity">Activity logs</button></div><form data-filters class="store-service-filters"><label>Store<select name="store"><option value="">All stores</option><option value="home-express">Home Express</option><option value="pesoplus">PesoPlus</option><option value="all">Admin</option></select></label><label data-request-filter>Status<select name="status"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="">All statuses</option></select></label><label data-log-filter hidden>Action<select name="action"><option value="">All actions</option><option value="sign_in">Sign-in</option><option value="template_opened">Template opened</option><option value="product_edited">Product edits saved</option><option value="print_requested">Print requested</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="print_initiated">Print initiated</option></select></label><label data-log-filter hidden>From<input type="date" name="from"></label><label data-log-filter hidden>To<input type="date" name="to"></label><label data-log-filter hidden>Template<select name="template"><option value="">All templates</option></select></label><button type="submit" class="btn">Refresh</button></form><p data-admin-status role="status" aria-live="polite"></p><div data-last-active></div><div data-items></div><button type="button" class="btn" data-older hidden>Older activity</button><button type="button" class="btn" data-close>Close</button></div>';
  document.body.append(adminDialog);
  const detail=node('dialog',undefined,'store-service-dialog');detail.setAttribute('aria-label','Review print request');
  detail.innerHTML='<div class="store-service-body"><h2>Review print request</h2><p data-summary></p><img data-preview alt="Submitted poster preview"><p data-note></p><label>Comment (optional)<textarea data-comment rows="3" maxlength="1000"></textarea></label><p data-status role="status" aria-live="polite"></p><div class="store-service-actions"><button type="button" class="btn" data-close>Close</button><button type="button" class="btn" data-decision="rejected">Reject</button><button type="button" class="btn btn-dark" data-decision="approved">Approve</button></div></div>';
  document.body.append(detail);
  for(const dialog of [printDialog,adminDialog,detail]){
   let trigger;dialog.querySelector('[data-close]').onclick=()=>dialog.close();
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
  const ownsTemplate=id=>getMode()==='all'||(id.startsWith('peso-')?'pesoplus':'home-express')===getMode();
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
   dashboard.hidden=!authenticated()||getMode()!=='all';
   if(!authenticated()){notification.hidden=true;sync.hidden=true;printButton.textContent='Print poster';viewKey='';baseline=null;return}
   const info=getTemplate(),key=session.store+':'+info.id;
   if(!baseline||!viewKey.startsWith(session.store+':'))baseline=capture(getState());
   if(!templates[info.id]){notification.hidden=true;return}
   if(viewKey!==key){viewKey=key;queue({action:'template_opened',templateId:info.id,templateName:info.name.slice(0,160)});notification.hidden=true;poll()}
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
   const pending=request?.status==='pending',accepted=request?.status==='approved';
   send.hidden=pending||accepted;approved.hidden=!accepted;note.parentElement.hidden=pending||accepted;
   ps.textContent=pending?'Waiting for admin approval. Submitted '+timestamp(request.created_at):accepted?'Approved by admin on '+timestamp(request.decided_at):request?.status==='rejected'?'Request rejected. '+(request.comment||'You can send another request.'):'Send this poster preview to the All Stores admin for approval.';
   if(accepted&&request.comment)ps.textContent+=' '+request.comment;
  }
  async function loadRequest(){const data=await api('/requests?template='+encodeURIComponent(activeTemplate.id));request=data.requests[0]||null;showRequest()}
  async function requestPrint(){
   if(!authenticated()){onExpired();return}
   if(!templates[getTemplate().id]){alert('Print approval is available for the six Home Express and PesoPlus templates.');return}
   if(printDialog.open||printBusy)return;
   if(getMode()==='all'){
    const info=getTemplate();printBusy=true;try{await api('/events','POST',{id:crypto.randomUUID(),action:'print_initiated',templateId:info.id,templateName:info.name});await directPrint()}catch(error){alert(error.message)}finally{printBusy=false}return;
   }
   activeTemplate=getTemplate();requestKey=crypto.randomUUID();request=null;preview='';note.value='';
   printDialog.querySelector('[data-template]').textContent=names[getMode()]+' · '+activeTemplate.name;
   printDialog.querySelector('[data-preview]').removeAttribute('src');ps.textContent='Loading poster and approval status…';send.hidden=true;approved.hidden=true;retry.hidden=true;
   printDialog.openFor();await prepare();
  }
  async function prepare(){
   printBusy=true;setBusy(printDialog,true);retry.hidden=true;
   try{await loadRequest();preview=await renderPreview();printDialog.querySelector('[data-preview]').src=preview}
   catch(error){ps.textContent=error.message;send.hidden=true;approved.hidden=true;retry.hidden=false}
   finally{printBusy=false;setBusy(printDialog,false)}
  }
  retry.onclick=prepare;
  send.onclick=async()=>{
   if(printBusy)return;printBusy=true;setBusy(printDialog,true);ps.textContent='Sending request to admin…';
   try{if(getTemplate().id!==activeTemplate.id)throw Error('The selected template changed. Close this request and open Print poster again.');await api('/requests','POST',{id:requestKey,templateId:activeTemplate.id,templateName:activeTemplate.name,note:note.value,preview});await loadRequest();printButton.textContent=request?.status==='pending'?'Approval pending':'Print poster'}
   catch(error){ps.textContent=error.message+' Your note is still here; try sending again.'}
   finally{printBusy=false;setBusy(printDialog,false)}
  };
  approved.onclick=async()=>{
   if(printBusy)return;printBusy=true;setBusy(printDialog,true);
   try{if(getTemplate().id!==activeTemplate.id)throw Error('The selected template changed. Close this request and open Print poster again.');await api('/requests/'+request.id+'/print','POST',{id:crypto.randomUUID()});printDialog.close();await directPrint()}
   catch(error){ps.textContent=error.message}
   finally{printBusy=false;setBusy(printDialog,false)}
  };
  notification.onclick=requestPrint;
  const filters=adminDialog.querySelector('[data-filters]'),items=adminDialog.querySelector('[data-items]'),adminStatus=adminDialog.querySelector('[data-admin-status]');
  const templateLabels={'home-everyday':'Home Express — Front','home-back':'Home Express — Back','home-collection':'Home Express — Back (Blue & Orange)','home-collection-front':'Home Express — Front (Blue & Orange)','peso-plus':'PesoPlus — Front','peso-back':'PesoPlus — Back'};
  for(const id of Object.keys(templates)){const option=node('option',templateLabels[id]);option.value=id;filters.elements.template.append(option)}
  adminDialog.querySelector('[data-tab="requests"]').setAttribute('aria-pressed','true');
  function params(){const query=new URLSearchParams();for(const key of tab==='activity'?['store','action','from','to','template']:['store','status'])if(filters.elements[key].value)query.set(key,filters.elements[key].value);if(cursor&&tab==='activity')query.set('before',cursor);return query.toString()}
  async function loadDashboard(){
   if(!authenticated()||getMode()!=='all')return;
   setBusy(adminDialog,true);adminStatus.textContent='Loading…';
   try{
    const data=await api('/'+tab+'?'+params());items.replaceChildren();
    if(tab==='activity'){
     const last=adminDialog.querySelector('[data-last-active]');last.replaceChildren();for(const role of ['home-express','pesoplus'])last.append(node('p',names[role]+' · Last activity: '+timestamp(data.lastActive.find(item=>item.store===role)?.last_active)));
     for(const event of data.events){const card=node('article',undefined,'store-service-card');card.append(node('strong',(names[event.store]||event.store)+' · '+event.action.replaceAll('_',' ')),node('small',timestamp(event.created_at)),node('p',event.template_name||''));if(event.details.product)card.append(node('p',event.details.product));for(const change of event.details.changes||[])card.append(node('p',change.field+': '+change.before+' → '+change.after));if(event.details.comment)card.append(node('p',event.details.comment));items.append(card)}
     cursor=data.next;adminDialog.querySelector('[data-older]').hidden=!cursor;
    }else{
     adminDialog.querySelector('[data-last-active]').replaceChildren();adminDialog.querySelector('[data-older]').hidden=true;
     for(const request of data.requests){const card=node('article',undefined,'store-service-card');card.append(node('strong',names[request.store]+' · '+request.template_name),node('small',timestamp(request.created_at)+' · '+request.status));const open=node('button','Review request','btn');open.type='button';open.onclick=()=>openDetail(request.id);card.append(open);items.append(card)}
    }
    adminStatus.textContent=items.children.length?'Showing '+items.children.length+' records.':'No records match these filters.';
   }catch(error){adminStatus.textContent=error.message}
   finally{setBusy(adminDialog,false)}
  }
  dashboard.onclick=()=>{adminDialog.openFor();cursor=null;loadDashboard()};
  filters.onsubmit=event=>{event.preventDefault();cursor=null;loadDashboard()};
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
    if(identity==='all'){const data=await api('/requests?status=pending');if(session?.store===identity)dashboard.textContent='Store activity'+(data.requests.length?' · '+data.requests.length+' pending':'')}
    else if(templates[tid]){
     const data=await api('/requests?template='+encodeURIComponent(tid));if(session?.store!==identity||getTemplate().id!==tid)return;
     const latest=data.requests[0];printButton.textContent=latest?.status==='pending'?'Approval pending':'Print poster';
     notification.hidden=!latest||latest.status==='pending';notification.textContent=latest?.status==='approved'?'Print request approved':'Print request rejected';
     if(printDialog.open&&!printBusy&&activeTemplate?.id===tid&&latest?.id===request?.id){request=latest;showRequest()}
    }
   }catch{}finally{polling=false}
  }
  setInterval(()=>{poll();flush()},30000);window.addEventListener('online',()=>{poll();flush()});document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll()});
  return {view,saved,requestPrint};
 }
})();
