(() => {
 const stage=document.querySelector('.stage');
 if(!stage)return;
 const card=document.createElement('details');card.className='sales-sync-status';
 const summary=document.createElement('summary');
 const title=document.createElement('strong');title.textContent='Sales sync';
 const badge=document.createElement('span');badge.className='sales-sync-badge';badge.textContent='Checking…';badge.setAttribute('role','status');
 summary.append(title,badge);
 const body=document.createElement('div');body.className='sales-sync-body';
 const run=document.createElement('p'),published=document.createElement('p'),period=document.createElement('p'),schedule=document.createElement('p'),note=document.createElement('p');
 run.textContent='Checking the latest weekly automation run…';
 published.textContent='Published sync: checking…';
 period.textContent='Sales period: checking…';
 schedule.textContent='Scheduled Monday, 5:00 AM · Philippine time';
 note.textContent='Published data status only. Your edited poster may differ. Scheduled runs can start late.';
 note.className='sales-sync-note';
 const actions=document.createElement('div');actions.className='sales-sync-actions';
 const refresh=document.createElement('button');refresh.type='button';refresh.className='btn btn-sm';refresh.textContent='Refresh status';
 const link=document.createElement('a');link.href='https://github.com/luwi25/Store-Design-Template/actions/workflows/weekly-sales-sync.yml';link.target='_blank';link.rel='noopener noreferrer';link.textContent='View sync history';
 actions.append(refresh,link);body.append(run,published,period,schedule,note,actions);card.append(summary,body);
 const header=stage.querySelector('.stage-top');if(header)header.after(card);else stage.prepend(card);
 const date=value=>{const d=new Date(value);return Number.isNaN(d.getTime())?'Unknown':new Intl.DateTimeFormat('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}).format(d)+' PHT'};
 let busy=false,lastCheck=0;
 async function json(url){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);try{const response=await fetch(url,{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error('Unavailable');return await response.json()}finally{clearTimeout(timer)}}
 async function update(){
  if(busy)return;busy=true;lastCheck=Date.now();refresh.disabled=true;refresh.textContent='Checking…';
  try{await Promise.allSettled([
   (async()=>{try{
    const data=await json('https://api.github.com/repos/luwi25/Store-Design-Template/actions/workflows/weekly-sales-sync.yml/runs?per_page=1');
    const latest=data.workflow_runs?.[0];
    if(!latest){badge.textContent='No runs yet';badge.dataset.tone='neutral';run.textContent='No weekly sync runs have been recorded.';return}
    const active=latest.status!=='completed',success=latest.conclusion==='success';
    badge.textContent=active?(latest.status==='in_progress'?'Sync running':'Sync queued'):success?'Last run succeeded':latest.conclusion==='cancelled'?'Last run cancelled':'Last run needs attention';
    badge.dataset.tone=active?'pending':success?'success':'warning';
    run.textContent='Latest run: '+date(latest.updated_at)+'. '+(success?'Completed; website publication is a separate step.':active?'The published sales data remains available.':'Open sync history for details.');
   }catch{badge.textContent=navigator.onLine?'Status unavailable':'Offline';badge.dataset.tone='neutral';run.textContent='Cannot check the latest run. Try Refresh status when connected.'}})(),
   (async()=>{try{
    const data=await json('defaults/sales-sync.json');
    published.textContent=data.syncedAt?'Published sync: '+date(data.syncedAt):'Published sync: not recorded yet';
    const stores=Array.isArray(data.stores)?data.stores:[];
    period.textContent=stores.length?'Sales period: '+stores.map(s=>s.name+': '+s.weekStart+' to '+s.weekEnd).join(' · '):'Sales period: not recorded yet';
   }catch{published.textContent='Published sync details unavailable.';period.textContent='Sales period: unavailable'}})()
  ])}finally{busy=false;refresh.disabled=false;refresh.textContent='Refresh status'}
 }
 refresh.onclick=update;update();
 setInterval(()=>{if(!document.hidden&&navigator.onLine)update()},60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastCheck>=60000)update()});
 window.addEventListener('online',update);
})();
