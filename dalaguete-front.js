// Original supplied artwork; editable overlays preserve the header, footer and QR.
const DALAGUETE_FRONT_ID='mandarin-dalaguete-front';
const DALAGUETE_FRONT_ART=__DALAGUETE_FRONT_ART__;
const dalagueteFrontSeeds=__DALAGUETE_FRONT_SEEDS__;
const dalagueteFrontGroups=[{name:'Featured products',y:661,h:244},{name:'Home essentials',y:919,h:229},{name:'Everyday essentials',y:1163,h:223}].map((g,i)=>({...g,items:dalagueteFrontSeeds.slice(i*3,i*3+3).map(p=>[p.name,p.price])}));
const DALAGUETE_FRONT_QR='defaults/images/027a11dd0206a8ac51ecc6bd0b914f5187938ee62ceef000bd944d98d4c6933f.png';
let dalagueteFrontArtwork=null,dalagueteFrontQr=null;
function dalagueteFrontState(){if(!state.dalagueteFront)state.dalagueteFront={slots:dalagueteFrontSeeds.map((p,i)=>({productId:p.id,group:Math.floor(i/3),discountPercent:0}))};return state.dalagueteFront}
function seedDalagueteFront(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const p of dalagueteFrontSeeds)if(!ids.has(p.id)&&!state.deletedProductIds?.includes(p.id))state.products.push({...p});
 dalagueteFrontState();state.templateNames||={};state.templateSettings||={};
 state.templateNames[DALAGUETE_FRONT_ID]||='Template #1 - MANDARIN DALAGUETE - FRONT';
 state.templateSettings[DALAGUETE_FRONT_ID]||={poster:{...starter().poster,store:'MANDARIN DALAGUETE',paper:'letter',fit:'half'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
}
function dalagueteFrontCard(index){const slots=dalagueteFrontState().slots,slot=slots[index],g=dalagueteFrontGroups[slot.group];return {x:[32,444,854][slots.filter(s=>s.group===slot.group).indexOf(slot)],y:g.y,w:[394,392,394][slots.filter(s=>s.group===slot.group).indexOf(slot)],h:g.h}}
async function dalagueteFrontCanvas({width=1650,height=2550}={}){
 await document.fonts.load('800 24px Outfit');if(!dalagueteFrontArtwork)dalagueteFrontArtwork=await loadCanvasImage(DALAGUETE_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.scale(width/1280,height/1920);ctx.drawImage(dalagueteFrontArtwork,0,0,1280,1920);
 // Keep the supplied QR pixels intact, with a white quiet zone around them.
 if(!dalagueteFrontQr)dalagueteFrontQr=await loadCanvasImage(DALAGUETE_FRONT_QR);
 ctx.save();ctx.fillStyle='#fff';ctx.fillRect(1060,1680,145,145);ctx.imageSmoothingEnabled=false;ctx.drawImage(dalagueteFrontQr,1073,1693,119,119);ctx.restore();
 const slots=dalagueteFrontState().slots,photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 dalagueteFrontGroups.forEach((g,group)=>{
  const indices=slots.map((s,i)=>s.group===group?i:-1).filter(i=>i>=0);
  for(let col=0;col<3;col++){
   const index=indices[col],slot=slots[index],p=slot&&productFor(slot),x=[32,444,854][col],y=g.y,w=[394,392,394][col],h=g.h,band=y+h-117;
   ctx.save();roundRect(ctx,x,y,w,h,30);ctx.clip();ctx.fillStyle='#fff';ctx.fillRect(x,y,w,h);ctx.fillStyle='#fff';ctx.fillRect(x,band,w,117);
   const im=photos[index];if(im){const r=Math.min((w-24)/im.width,(h-137)/im.height);ctx.drawImage(im,x+(w-im.width*r)/2,y+10+(h-137-im.height*r)/2,im.width*r,im.height*r)}
   ctx.fillStyle='#ffcf00';roundRect(ctx,x+60,y+h-64,w-120,50,20);ctx.fill();
   if(slot){const layout=homeCollectionNameLayout(ctx,p?.name||'Choose a product',w-24,37*textScale('name',slot));ctx.fillStyle='#07155b';ctx.textAlign='center';ctx.font=`800 ${layout.size}px Outfit,Arial,sans-serif`;layout.lines.forEach((line,i)=>ctx.fillText(line,x+w/2,band+36-(layout.lines.length-1)*layout.lineHeight/2+i*layout.lineHeight,w-24));ctx.fillStyle='#07155b';ctx.font=`800 ${38*textScale('sale',slot)}px Outfit,Arial,sans-serif`;ctx.fillText(p&&Number(p.price)>0?money(salePrice(p,slot)):'₱ —',x+w/2,y+h-25,w-140)}
   ctx.restore();
  }
 });return canvas;
}
