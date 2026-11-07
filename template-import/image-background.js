(()=>{
 let processing=false;
 const info=$('imageBackgroundStatus');
 window.refreshImportBackground=layer=>{$('imageBackgroundTools').hidden=layer?.type!=='image';$('restoreImageBackground').hidden=!layer?.imageBeforeRemoval;$('coverImageArea').checked=layer?.coverImage!==false;if(!processing)info.textContent=''};
 $('coverImageArea').onchange=()=>{const l=project?.layers.find(x=>x.id===selected);if(!l||l.type!=='image')return;l.coverImage=$('coverImageArea').checked;mark()};
 $('removeImageBackground').onclick=async()=>{
  if(processing||busy)return;const target=project,layer=project?.layers.find(l=>l.id===selected);if(!layer||layer.type!=='image')return;
  processing=true;busy=true;controls();$('cancel').hidden=true;info.textContent='Removing background… Your original photo will be kept.';let w,timer;
  try{
   let src=layer.image;if(!src){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(layer.w));c.height=Math.max(1,Math.round(layer.h));c.getContext('2d').drawImage(original,layer.x,layer.y,layer.w,layer.h,0,0,c.width,c.height);src=c.toDataURL('image/png')}
   const result=await new Promise((resolve,reject)=>{w=new Worker('../background-worker.js');timer=setTimeout(()=>reject(Error('Processing took too long. Try a smaller photo.')),180000);w.onerror=()=>reject(Error('Could not load the background remover. Please retry.'));w.onmessage=e=>e.data.error?reject(Error(e.data.error)):resolve(e.data.result.image);w.postMessage({id:1,source:src})});
   const im=await load(result);if(project!==target||!project.layers.includes(layer))return;
   layer.imageBeforeRemoval ||= src;layer.source||={x:layer.x,y:layer.y,w:layer.w,h:layer.h};layer.image=result;layer.changed=true;images.set(result,im);mark();if(selected===layer.id){$('restoreImageBackground').hidden=false;info.textContent='Background removed. Check the product edges, then Save draft.'}
  }catch(e){info.textContent=e.message+' The current photo was kept.'}
  finally{clearTimeout(timer);w?.terminate();processing=false;busy=false;controls()}
 };
 $('restoreImageBackground').onclick=async()=>{const target=project,l=project?.layers.find(x=>x.id===selected);if(!l?.imageBeforeRemoval||processing)return;try{const src=l.imageBeforeRemoval,im=await load(src);if(project!==target||!project.layers.includes(l))return;images.set(src,im);l.image=src;delete l.imageBeforeRemoval;mark();window.refreshImportBackground(l);info.textContent='Original photo restored.'}catch(e){info.textContent=e.message}};
})();
