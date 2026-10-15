// Shared catalog and template product photo controls.
function createBackgroundTools({container,getImage,getOriginal,setOriginal,applyImage,isCurrent,setBusy=()=>{}}){
 const wrap=document.createElement('div');wrap.className='background-tools';
 const preview=document.createElement('img');preview.className='cutout-preview';preview.alt='Product image; checkerboard shows transparent areas';
 const actions=document.createElement('div');actions.className='cutout-actions';
 const remove=document.createElement('button');remove.type='button';remove.className='btn btn-sm';remove.textContent='Remove background';remove.dataset.action='remove-background';
 const restore=document.createElement('button');restore.type='button';restore.className='btn btn-sm';restore.textContent='Restore original';restore.dataset.action='restore-background';
 const download=document.createElement('button');download.type='button';download.className='btn btn-sm';download.textContent='Download PNG';
 const status=document.createElement('p');status.className='helper';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 let busy=false;
 const refresh=()=>{const source=getImage();preview.hidden=!source;if(source)preview.src=source;remove.disabled=busy||!source;restore.hidden=!getOriginal();restore.disabled=busy;download.disabled=busy||!source;remove.textContent=busy?'Removing background...':'Remove background';wrap.setAttribute('aria-busy',String(busy))};
 async function png(source){const im=await loadCanvasImage(source),canvas=document.createElement('canvas');canvas.width=im.naturalWidth||im.width;canvas.height=im.naturalHeight||im.height;canvas.getContext('2d').drawImage(im,0,0);return canvas.toDataURL('image/png')}
 remove.addEventListener('click',async()=>{const source=getImage();if(!source||busy)return;busy=true;setBusy(true);status.textContent='Removing the background on this computer. Please wait...';refresh();try{const result=await StoreDatabase.removeBackground(await png(source));if(!wrap.isConnected||!isCurrent()||getImage()!==source)return;await loadCanvasImage(result.image);if(!getOriginal())setOriginal(source);applyImage(result.image);status.textContent='Background removed. Transparent PNG is ready. Restore original if you prefer the previous photo.'}catch(error){if(wrap.isConnected&&isCurrent())status.textContent=error.message||'Could not remove the background. Your original image is unchanged.'}finally{busy=false;if(wrap.isConnected&&isCurrent()){setBusy(false);refresh()}}});
 restore.addEventListener('click',()=>{if(busy||!getOriginal())return;const original=getOriginal();setOriginal(null);applyImage(original);status.textContent='Original photo restored.';refresh()});
 download.addEventListener('click',async()=>{try{const source=getImage();if(!source)return;const a=document.createElement('a');a.href=await png(source);a.download='product-transparent.png';a.click()}catch{status.textContent='Could not download this photo.'}});
 actions.append(remove,restore,download);wrap.append(preview,actions,status);container.append(wrap);refresh();return {refresh};
}
let catalogPhotoTools=null,catalogOriginalImage=null;
function mountCatalogPhotoTools(){const holder=$('catalogPhotoTools');holder.replaceChildren();form.querySelector('button[type="submit"]').disabled=false;catalogPhotoTools=createBackgroundTools({container:holder,getImage:()=>editingImage,getOriginal:()=>catalogOriginalImage,setOriginal:value=>catalogOriginalImage=value,applyImage:value=>{editingImage=value},isCurrent:()=>dlg.open,setBusy:value=>{form.querySelector('button[type="submit"]').disabled=value}})}
