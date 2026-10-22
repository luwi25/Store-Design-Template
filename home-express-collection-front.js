// Companion front design. Embedded alongside the shared blue/orange text helpers.
const HOME_COLLECTION_FRONT_ID='home-collection-front';
const HOME_COLLECTION_FRONT_ART=__HOME_COLLECTION_FRONT_ART__;
const homeCollectionFrontSeeds=__HOME_COLLECTION_FRONT_SEEDS__;
const homeCollectionFrontGroups=[
 {name:'Home essentials',y:1063,h:310},
 {name:'Everyday essentials',y:1380,h:329}
].map((group,index)=>({...group,items:homeCollectionFrontSeeds.slice(index*4,index*4+4).map(p=>[p.name,0])}));
let homeCollectionFrontArtwork=null;
function homeCollectionFrontState(){
 if(!state.homeCollectionFront)state.homeCollectionFront={slots:homeCollectionFrontSeeds.map((p,index)=>({productId:p.id,group:Math.floor(index/4),discountPercent:0}))};
 return state.homeCollectionFront;
}
function seedHomeCollectionFront(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of homeCollectionFrontSeeds){if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed})}
 homeCollectionFrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[HOME_COLLECTION_FRONT_ID] ||= 'Home Express - Front (Blue & Orange)';
 if(!state.templateSettings[HOME_COLLECTION_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[HOME_COLLECTION_FRONT_ID]={poster:{...defaults.poster,store:'HOME EXPRESS',paper:'letter',fit:'half'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function homeCollectionFrontCard(index){
 const slots=homeCollectionFrontState().slots,slot=slots[index],group=homeCollectionFrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot),edges=[23,341,648,954,1258];
 return {x:edges[column],y:group.y,w:edges[column+1]-edges[column],h:group.h};
}
async function homeCollectionFrontCanvas({width=1650,height=2550}={}){
 await document.fonts.load('800 20px Outfit');
 if(!homeCollectionFrontArtwork)homeCollectionFrontArtwork=await loadCanvasImage(HOME_COLLECTION_FRONT_ART);
 const c=document.createElement('canvas');c.width=width;c.height=height;
 const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/1280,height/1931);
 ctx.drawImage(homeCollectionFrontArtwork,0,0,1280,1931);
 const slots=homeCollectionFrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 const edges=[23,341,648,954,1258];
 homeCollectionFrontGroups.forEach((group,groupIndex)=>{
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<4;column++){
   const index=indices[column],slot=slots[index],p=slot&&productFor(slot);
   const b={x:edges[column],y:group.y,w:edges[column+1]-edges[column],h:group.h};
   ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);
   ctx.strokeStyle='#b9d7ff';ctx.lineWidth=2;
   roundRect(ctx,b.x+2,b.y+2,b.w-5,b.h-5,24);ctx.fill();ctx.stroke();
   ctx.fillStyle='#ff7900';ctx.beginPath();ctx.moveTo(b.x+4,b.y+4);ctx.lineTo(b.x+56,b.y+4);ctx.lineTo(b.x+4,b.y+43);ctx.closePath();ctx.fill();
   if(slot){
    const im=photos[index],{size,lines,lineHeight}=homeCollectionNameLayout(ctx,p?.name||'Choose a product',b.w-28,30*textScale('name',slot));
    const priceSize=39*textScale('sale',slot),priceBaseline=b.y+b.h-16;
    const firstNameBaseline=priceBaseline-priceSize-10-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,firstNameBaseline-size-b.y-12);
    if(im){
     const scale=Math.min((b.w-24)/im.width,Math.max(1,photoH-10)/im.height);
     ctx.save();ctx.beginPath();ctx.rect(b.x+12,b.y+8,b.w-24,photoH);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+8+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#0033b5';
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,firstNameBaseline+i*lineHeight,b.w-24));
    if(p){ctx.fillStyle='#d94b00';ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillText(money(salePrice(p,slot)),b.x+b.w/2,priceBaseline,b.w-24)}
   }
   ctx.restore();
  }
 });
 return c;
}
