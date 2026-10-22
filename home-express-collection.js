// Embedded in the editor closure. Artwork and seed products are supplied by the build.
const HOME_COLLECTION_ID = 'home-collection';
const HOME_COLLECTION_ART = __HOME_COLLECTION_ART__;
const homeCollectionSeeds = __HOME_COLLECTION_SEEDS__;
const homeCollectionGroups = [
 {name:'Christmas Bundles',headerY:178,y:218,h:241},
 {name:'Kitchenware',headerY:464,y:502,h:205},
 {name:'School Supplies',headerY:711,y:750,h:210},
 {name:'Hardware',headerY:966,y:1006,h:195},
 {name:'Groceries',headerY:1205,y:1245,h:208}
].map((group,index)=>({...group,items:homeCollectionSeeds.slice(index*5,index*5+5).map(p=>[p.name,0])}));
let homeCollectionArtwork = null;
function homeCollectionState(){
 if(!state.homeCollection)state.homeCollection={slots:homeCollectionSeeds.map((p,index)=>({productId:p.id,group:Math.floor(index/5),discountPercent:0}))};
 if(!Array.isArray(state.homeCollection.groupNames))state.homeCollection.groupNames=homeCollectionGroups.map(group=>group.name);
 return state.homeCollection;
}
function homeCollectionLabel(index){return homeCollectionState().groupNames[index]?.trim()||homeCollectionGroups[index].name}
function syncHomeCollectionControls(){
 let panel=$('homeCollectionCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='homeCollectionCategoryControls';panel.className='panel';panel.hidden=true;
  const heading=document.createElement('h2');heading.textContent='Section headings';
  const help=document.createElement('p');help.className='helper';help.textContent='Rename the five sections. Changes appear in the preview, print and downloads.';
  panel.append(heading,help);
  homeCollectionGroups.forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';
   const label=document.createElement('label');label.htmlFor='homeCollectionLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{homeCollectionState().groupNames[index]=input.value;renderPoster();save()});
   field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';
  reset.addEventListener('click',()=>{homeCollectionState().groupNames=homeCollectionGroups.map(group=>group.name);renderPoster();save()});
  panel.append(reset);$('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==HOME_COLLECTION_ID;
 if(panel.hidden)return;
 homeCollectionGroups.forEach((group,index)=>{const input=$('homeCollectionLabel-'+index);if(document.activeElement!==input)input.value=homeCollectionState().groupNames[index]??group.name});
}
function drawHomeCollectionHeader(ctx,group,index){
 const x=18,y=group.headerY,w=987,h=group.y-y;
 ctx.save();
 const fill=ctx.createLinearGradient(0,y,0,y+h);
 fill.addColorStop(0,index%2?'#0965fa':'#ff9a08');fill.addColorStop(1,index%2?'#0033b5':'#ff6500');
 ctx.fillStyle=fill;
 ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x,y+17);ctx.quadraticCurveTo(x,y,x+17,y);
 ctx.lineTo(x+w-17,y);ctx.quadraticCurveTo(x+w,y,x+w,y+17);ctx.lineTo(x+w,y+h);ctx.closePath();ctx.fill();
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';
 let size=30;const text=homeCollectionLabel(index).toUpperCase();
 ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
 while(ctx.measureText(text).width>805&&size>18){size--;ctx.font=`800 ${size}px Outfit, Arial, sans-serif`}
 ctx.fillText(text,x+w/2,y+h/2+1,805);
 // Preserve the reference's small outlined bursts without baking text into images.
 ctx.strokeStyle='#fff';ctx.lineWidth=1.5;
 for(const side of [-1,1]){
  const cx=x+w/2+side*447,cy=y+h/2;
  ctx.beginPath();ctx.moveTo(cx-side*12,cy+8);ctx.lineTo(cx+side*12,cy+12);ctx.lineTo(cx+side*3,cy-2);ctx.closePath();ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx-side*10,cy+2);ctx.lineTo(cx+side*3,cy-12);ctx.lineTo(cx+side*10,cy-5);ctx.closePath();ctx.stroke();
 }
 ctx.restore();
}
function homeCollectionNameLayout(ctx,text,width,requestedSize){
 let size=requestedSize,lines;
 do{
  ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;lines=[];let line='';
  for(const word of text.split(/\s+/)){
   const next=line?line+' '+word:word;
   if(line&&ctx.measureText(next).width>width){lines.push(line);line=word}else line=next;
  }
  if(line)lines.push(line);
  if(lines.length<=2&&lines.every(value=>ctx.measureText(value).width<=width)||size<=12)break;
  size-=.5;
 }while(true);
 if(lines.length>2)lines=[lines[0],lines.slice(1).join(' ')];
 return {size,lines,lineHeight:size*1.13};
}
function seedHomeCollection(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of homeCollectionSeeds){
  if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 }
 homeCollectionState();
 state.templateNames ||= {};
 state.templateNames[HOME_COLLECTION_ID] ||= 'Home Express - Back (Blue & Orange)';
 state.templateSettings ||= {};
 if(!state.templateSettings[HOME_COLLECTION_ID]){
  const defaults=starter();
  state.templateSettings[HOME_COLLECTION_ID]={poster:{...defaults.poster,store:'HOME EXPRESS',paper:'letter',fit:'half'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function homeCollectionCard(index){
 const slot=homeCollectionState().slots[index],group=homeCollectionGroups[slot.group];
 const siblings=homeCollectionState().slots.filter(s=>s.group===slot.group);
 const column=siblings.indexOf(slot),edges=[19,220,418,615,812,1005];
 return {x:edges[column],y:group.y,w:edges[column+1]-edges[column],h:group.h};
}
async function homeCollectionCanvas({width=1650,height=2550}={}){
 await document.fonts.load('800 20px Outfit');
 if(!homeCollectionArtwork)homeCollectionArtwork=await loadCanvasImage(HOME_COLLECTION_ART);
 const c=document.createElement('canvas');c.width=width;c.height=height;
 const ctx=c.getContext('2d');ctx.imageSmoothingQuality='high';ctx.scale(width/1021,height/1540);
 ctx.drawImage(homeCollectionArtwork,0,0,1021,1540);
 const slots=homeCollectionState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 const edges=[19,220,418,615,812,1005];
 homeCollectionGroups.forEach((group,groupIndex)=>{
  drawHomeCollectionHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<5;column++){
   const index=indices[column],slot=slots[index],p=slot&&productFor(slot);
   const b={x:edges[column],y:group.y,w:edges[column+1]-edges[column],h:group.h};
   ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);
   ctx.fillStyle='#fff';ctx.strokeStyle='#b9d7ff';ctx.lineWidth=2;
   roundRect(ctx,b.x+1,b.y+1,b.w-3,b.h-3,15);ctx.fill();ctx.stroke();
   ctx.fillStyle='#ff7900';ctx.beginPath();ctx.moveTo(b.x+2,b.y+2);ctx.lineTo(b.x+34,b.y+2);ctx.lineTo(b.x+2,b.y+34);ctx.closePath();ctx.fill();
   if(slot){
    const im=photos[index],{size,lines,lineHeight}=homeCollectionNameLayout(ctx,p?.name||'Choose a product',b.w-20,22*textScale('name',slot));
    ctx.textAlign='center';
    const priceSize=30*textScale('sale',slot),priceBaseline=b.y+b.h-12;
    const lastNameBaseline=priceBaseline-priceSize-8;
    const firstNameBaseline=lastNameBaseline-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,firstNameBaseline-size-b.y-8);
    if(im){const scale=Math.min((b.w-18)/im.width,Math.max(1,photoH-6)/im.height);ctx.save();ctx.beginPath();ctx.rect(b.x+9,b.y+5,b.w-18,photoH);ctx.clip();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+5+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore()}
    ctx.fillStyle='#0033b5';
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,firstNameBaseline+i*lineHeight,b.w-14));
    if(p){
     ctx.fillStyle='#d94b00';ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;
     ctx.fillText(money(salePrice(p,slot)),b.x+b.w/2,priceBaseline,b.w-16);
    }
   }
   ctx.restore();
  }
 });
 return c;
}
