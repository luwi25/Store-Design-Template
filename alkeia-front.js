// Supplied Alkeia artwork with editable product cards; source pixels are preserved.
const ALKEIA_FRONT_ID='alkeia-talamban-front';
const ALKEIA_FRONT_ART=__ALKEIA_FRONT_ART__;
const alkeiaFrontSeeds=__ALKEIA_FRONT_SEEDS__;
const alkeiaFrontGroups=[{name:'Home essentials',y:984,h:282},{name:'Everyday essentials',y:1278,h:315}].map((g,i)=>({...g,items:alkeiaFrontSeeds.slice(i*3,i*3+3).map(p=>[p.name,p.price])}));
let alkeiaFrontArtwork=null;
function alkeiaFrontState(){
 if(!state.alkeiaFront)state.alkeiaFront={slots:alkeiaFrontSeeds.map((p,i)=>({productId:p.id,group:Math.floor(i/3),discountPercent:0}))};
 return state.alkeiaFront;
}
function seedAlkeiaFront(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const p of alkeiaFrontSeeds)if(!ids.has(p.id)&&!state.deletedProductIds?.includes(p.id))state.products.push({...p});
 alkeiaFrontState();state.templateNames||={};state.templateSettings||={};
 state.templateNames[ALKEIA_FRONT_ID]||='Template #1 - ALKEIA TALAMBAN - FRONT';
 if(!state.templateSettings[ALKEIA_FRONT_ID])state.templateSettings[ALKEIA_FRONT_ID]={poster:{...starter().poster,store:'ALKEIA TALAMBAN',paper:'letter',fit:'half'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
}
function alkeiaFrontCard(index){
 const slots=alkeiaFrontState().slots,slot=slots[index],g=alkeiaFrontGroups[slot.group];
 const column=slots.filter(s=>s.group===slot.group).indexOf(slot);
 return {x:[38,462,834][column],y:g.y,w:[410,358,410][column],h:g.h};
}
async function alkeiaFrontCanvas({width=1650,height=2550}={}){
 await document.fonts.load('800 24px Outfit');
 if(!alkeiaFrontArtwork)alkeiaFrontArtwork=await loadCanvasImage(ALKEIA_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/1280,height/1920);
 ctx.drawImage(alkeiaFrontArtwork,0,0,1280,1920);
 const slots=alkeiaFrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 alkeiaFrontGroups.forEach((g,group)=>{
  const indices=slots.map((s,i)=>s.group===group?i:-1).filter(i=>i>=0);
  for(let column=0;column<3;column++){
   const index=indices[column],slot=slots[index],p=slot&&productFor(slot),b={x:[38,462,834][column],y:g.y,w:[410,358,410][column],h:g.h};
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,23);ctx.clip();ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);
   ctx.fillStyle='#ffdc00';ctx.fillRect(b.x+34,b.y+b.h-14,b.w-68,5);
   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,p?.name||'Choose a product',b.w-28,25*textScale('name',slot));
    const priceSize=29*textScale('sale',slot),priceY=b.y+b.h-24,nameY=priceY-priceSize-7-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameY-size-b.y-16),im=photos[index];
    if(im){const scale=Math.min((b.w-24)/im.width,photoH/im.height);ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+8+(photoH-im.height*scale)/2,im.width*scale,im.height*scale)}
    ctx.textAlign='center';ctx.fillStyle='#111';ctx.font=`800 ${size}px Outfit,Arial,sans-serif`;lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameY+i*lineHeight,b.w-24));
    if(p){ctx.fillStyle='#d90000';ctx.font=`800 ${priceSize}px Outfit,Arial,sans-serif`;ctx.fillText(money(salePrice(p,slot)),b.x+b.w/2,priceY,b.w-24)}
   }
   ctx.restore();
  }
 });
 return canvas;
}
