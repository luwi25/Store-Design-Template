// Supplied Felcon artwork with editable product cards; source pixels are preserved.
const FELCON_FRONT_ID='felcon-bato-front';
const FELCON_FRONT_ART=__FELCON_FRONT_ART__;
const felconFrontSeeds=__FELCON_FRONT_SEEDS__;
const felconFrontGroups=[{name:'Featured departments',y:1175,h:260},{name:'More departments',y:1450,h:258}].map((g,i)=>({...g,items:felconFrontSeeds.slice(i*4,i*4+4).map(p=>[p.name,p.price])}));
let felconFrontArtwork=null;
function felconFrontState(){
 if(!state.felconFront)state.felconFront={slots:felconFrontSeeds.map((p,i)=>({productId:state.catalogAliases?.[p.id]||p.id,group:Math.floor(i/4),discountPercent:0}))};
 return state.felconFront;
}
function seedFelconFront(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const p of felconFrontSeeds)if(!ids.has(p.id)&&!state.catalogAliases?.[p.id]&&!state.deletedProductIds?.includes(p.id))state.products.push({...p});
 felconFrontState();state.templateNames||={};state.templateSettings||={};
 state.templateNames[FELCON_FRONT_ID]||='Template #1 - FELCON BATO - FRONT';
 if(!state.templateSettings[FELCON_FRONT_ID])state.templateSettings[FELCON_FRONT_ID]={poster:{...starter().poster,store:'FELCON BATO',paper:'letter',fit:'half'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
}
function felconFrontCard(index){
 const slots=felconFrontState().slots,slot=slots[index],g=felconFrontGroups[slot.group];
 const column=slots.filter(s=>s.group===slot.group).indexOf(slot);
 return {x:[38,343,648,953][column],y:g.y,w:288,h:g.h};
}
async function felconFrontCanvas({width=1650,height=2550}={}){
 await document.fonts.load('800 24px Outfit');
 if(!felconFrontArtwork)felconFrontArtwork=await loadCanvasImage(FELCON_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/1280,height/1920);
 ctx.drawImage(felconFrontArtwork,0,0,1280,1920);
 const slots=felconFrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 felconFrontGroups.forEach((g,group)=>{
  const indices=slots.map((s,i)=>s.group===group?i:-1).filter(i=>i>=0);
  for(let column=0;column<4;column++){
   const index=indices[column],slot=slots[index],p=slot&&productFor(slot),b={x:[38,343,648,953][column],y:g.y,w:288,h:g.h};
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,23);ctx.clip();ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);
   ctx.fillStyle='#fff132';ctx.fillRect(b.x,b.y+b.h-57,b.w,57);
   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,p?.name||'Choose a product',b.w-28,25*textScale('name',slot));
    const hasPrice=Number(p?.price)>0,priceSize=29*textScale('sale',slot),priceY=b.y+b.h-12,nameY=hasPrice?priceY-priceSize-7-(lines.length-1)*lineHeight:b.y+b.h-19-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameY-size-b.y-16),im=photos[index];
    if(im){const scale=Math.min((b.w-24)/im.width,photoH/im.height);ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+8+(photoH-im.height*scale)/2,im.width*scale,im.height*scale)}
    ctx.textAlign='center';ctx.fillStyle='#001b80';ctx.font=`800 ${size}px Outfit,Arial,sans-serif`;lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameY+i*lineHeight,b.w-24));
    if(p&&hasPrice){ctx.fillStyle='#d90000';ctx.font=`800 ${priceSize}px Outfit,Arial,sans-serif`;ctx.fillText(money(salePrice(p,slot)),b.x+b.w/2,priceY,b.w-24)}
   }
   ctx.restore();
  }
 });
 return canvas;
}
