// Original supplied artwork; editable overlays preserve the header, footer and QR.
const BESTCO_FRONT_ID='bestco-tuburan-front';
const BESTCO_FRONT_ART=__BESTCO_FRONT_ART__;
const bestcoFrontSeeds=__BESTCO_FRONT_SEEDS__;
const bestcoFrontGroups=[{name:'Featured products',y:579,h:273},{name:'Home essentials',y:872,h:256},{name:'Everyday essentials',y:1149,h:256}].map((g,i)=>({...g,items:bestcoFrontSeeds.slice(i*3,i*3+3).map(p=>[p.name,p.price])}));
let bestcoFrontArtwork=null;
function bestcoFrontState(){if(!state.bestcoFront)state.bestcoFront={slots:bestcoFrontSeeds.map((p,i)=>({productId:p.id,group:Math.floor(i/3),discountPercent:0}))};return state.bestcoFront}
function seedBestcoFront(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const p of bestcoFrontSeeds)if(!ids.has(p.id)&&!state.deletedProductIds?.includes(p.id))state.products.push({...p});
 bestcoFrontState();state.templateNames||={};state.templateSettings||={};
 state.templateNames[BESTCO_FRONT_ID]||='Template #1 - BESTCO TUBURAN - FRONT';
 state.templateSettings[BESTCO_FRONT_ID]||={poster:{...starter().poster,store:'BESTCO TUBURAN',paper:'letter',fit:'half'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
}
function bestcoFrontCard(index){const slots=bestcoFrontState().slots,slot=slots[index],g=bestcoFrontGroups[slot.group];return {x:[57,451,846][slots.filter(s=>s.group===slot.group).indexOf(slot)],y:g.y,w:[376,377,377][slots.filter(s=>s.group===slot.group).indexOf(slot)],h:g.h}}
async function bestcoFrontCanvas({width=1650,height=2550}={}){
 await document.fonts.load('800 24px Outfit');if(!bestcoFrontArtwork)bestcoFrontArtwork=await loadCanvasImage(BESTCO_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.scale(width/1280,height/1920);ctx.drawImage(bestcoFrontArtwork,0,0,1280,1920);
 const slots=bestcoFrontState().slots,photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 bestcoFrontGroups.forEach((g,group)=>{
  const indices=slots.map((s,i)=>s.group===group?i:-1).filter(i=>i>=0);
  for(let col=0;col<3;col++){
   const index=indices[col],slot=slots[index],p=slot&&productFor(slot),x=[57,451,846][col],y=g.y,w=[376,377,377][col],h=g.h,band=y+h-117;
   ctx.save();roundRect(ctx,x,y,w,h,30);ctx.clip();ctx.fillStyle='#fff';ctx.fillRect(x,y,w,h);ctx.fillStyle='#fff';ctx.fillRect(x,band,w,117);
   const im=photos[index];if(im){const r=Math.min((w-24)/im.width,(h-137)/im.height);ctx.drawImage(im,x+(w-im.width*r)/2,y+10+(h-137-im.height*r)/2,im.width*r,im.height*r)}
   ctx.fillStyle='#ae0000';roundRect(ctx,x+60,y+h-64,w-120,50,20);ctx.fill();
   if(slot){const layout=homeCollectionNameLayout(ctx,p?.name||'Choose a product',w-24,37*textScale('name',slot));ctx.fillStyle='#ff4e00';ctx.textAlign='center';ctx.font=`800 ${layout.size}px Outfit,Arial,sans-serif`;layout.lines.forEach((line,i)=>ctx.fillText(line,x+w/2,band+36-(layout.lines.length-1)*layout.lineHeight/2+i*layout.lineHeight,w-24));ctx.fillStyle='#ffffff';ctx.font=`800 ${38*textScale('sale',slot)}px Outfit,Arial,sans-serif`;ctx.fillText(p&&Number(p.price)>0?money(salePrice(p,slot)):'₱ —',x+w/2,y+h-25,w-140)}
   ctx.restore();
  }
 });return canvas;
}
