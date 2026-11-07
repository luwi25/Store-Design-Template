(()=>{
 let products=null,loading=false,pending=0;
 const picker=$('catalogPicker'),message=$('catalogStatus'),results=$('catalogResults'),query=$('catalogSearch');
 function show(){
  results.replaceChildren();if(!products)return;
  const found=ImportCatalog.search(products,query.value);message.textContent=found.length?(found.length===30?'Showing up to 30 matches. Refine your search.':found.length+' products found.'):'No products match this search.';
  for(const p of found){const row=document.createElement('button');row.type='button';row.className='catalog-product';const url=ImportCatalog.imageURL(p.image);row.disabled=!url;const img=document.createElement('img');img.alt='';img.loading='lazy';if(url)img.src=url;img.onerror=()=>{img.hidden=true};const copy=document.createElement('span'),name=document.createElement('strong'),detail=document.createElement('small');name.textContent=p.name||'Unnamed product';detail.textContent=[p.code,new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP'}).format(Number(p.price)||0),!url?'No photo available':null].filter(Boolean).join(' · ');copy.append(name,detail);row.append(img,copy);row.onclick=()=>choose(p,url);results.append(row)}
 }
 async function fetchCatalog(){if(loading)return;loading=true;message.textContent='Loading catalog…';$('catalogRetry').hidden=true;try{const response=await fetch('../defaults/project.json',{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Could not load the repository catalog.');const data=await response.json();if(!Array.isArray(data.state?.products))throw Error('Catalog data is invalid.');products=data.state.products;show()}catch(e){message.textContent=e.message;$('catalogRetry').hidden=false}finally{loading=false}}
 async function choose(p,url){
  const target=project,layer=project?.layers.find(l=>l.id===selected);if(!layer||layer.type!=='image'||!url)return;const ticket=++pending;message.textContent='Loading '+p.name+' photo…';
  try{const response=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('The product photo could not load.');const blob=await response.blob();if(!/^image\//.test(blob.type)||blob.size>20*1024*1024)throw Error('The product photo is not supported.');const src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Could not read the product photo.'));r.readAsDataURL(blob)});const im=await load(src);
   if(ticket!==pending||project!==target||selected!==layer.id||!project.layers.includes(layer))return;
   images.set(src,im);layer.source||={x:layer.x,y:layer.y,w:layer.w,h:layer.h};layer.image=src;delete layer.imageBeforeRemoval;layer.changed=true;window.refreshImportBackground?.(layer);layer.catalogProduct={id:p.id,name:p.name,code:p.code||''};mark();$('catalogSelection').textContent='Selected: '+p.name;message.textContent='Photo added. Save draft to keep it.';
  }catch(e){if(ticket===pending)message.textContent=e.message+' The current image was kept.'}
 }
 window.refreshImportCatalog=l=>{pending++;picker.hidden=l?.type!=='image';$('catalogSelection').textContent=l?.catalogProduct?'Selected: '+l.catalogProduct.name:'';if(!picker.hidden){if(products)show();else fetchCatalog()}};
 query.oninput=show;$('catalogRetry').onclick=fetchCatalog;
})();
