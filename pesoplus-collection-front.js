// Editable product cards over the supplied Pesoplus artwork.
const PESO_COLLECTION_FRONT_ID='peso-collection-front';
const PESO_COLLECTION_FRONT_ART=__PESO_COLLECTION_FRONT_ART__;
const pesoCollectionFrontSeeds=__PESO_COLLECTION_FRONT_SEEDS__.map((product,index)=>({...product,image:pesoCollectionFrontSeedImage(index)}));
function pesoCollectionFrontSeedImage(index){
 const x=[27,276,524,774][index%4],y=index<4?926:1151,w=227,h=index<4?177:180;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}"><image width="1023" height="1537" href="${PESO_COLLECTION_FRONT_ART}"/></svg>`;
 return 'data:image/svg+xml;base64,'+btoa(svg);
}
const pesoCollectionFrontGroups=[{name:'Home essentials',y:920,h:216},{name:'Everyday essentials',y:1145,h:217}].map((group,index)=>({...group,items:pesoCollectionFrontSeeds.slice(index*4,index*4+4).map(p=>[p.name,0])}));
let pesoCollectionFrontArtwork=null;
function pesoCollectionFrontState(){
 if(!state.pesoCollectionFront)state.pesoCollectionFront={slots:pesoCollectionFrontSeeds.map((p,index)=>({productId:p.id,group:Math.floor(index/4),discountPercent:0}))};
 return state.pesoCollectionFront;
}
function seedPesoCollectionFront(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of pesoCollectionFrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 pesoCollectionFrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[PESO_COLLECTION_FRONT_ID] ||= 'Template #2 - PESOPLUS - FRONT';
 if(!state.templateSettings[PESO_COLLECTION_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[PESO_COLLECTION_FRONT_ID]={poster:{...defaults.poster,store:'PESOPLUS',paper:'letter',fit:'half'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function pesoCollectionFrontCard(index){
 const slots=pesoCollectionFrontState().slots,slot=slots[index],group=pesoCollectionFrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 return {x:21+column*248.5,y:group.y,w:237,h:group.h};
}
async function pesoCollectionFrontCanvas({width=1650,height=2550}={}){
 await document.fonts.load('800 20px Outfit');
 if(!pesoCollectionFrontArtwork)pesoCollectionFrontArtwork=await loadCanvasImage(PESO_COLLECTION_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/1023,height/1537);
 ctx.drawImage(pesoCollectionFrontArtwork,0,0,1023,1537);
 const slots=pesoCollectionFrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 pesoCollectionFrontGroups.forEach((group,groupIndex)=>{
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<4;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b={x:21+column*248.5,y:group.y,w:237,h:group.h};
   ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();
   ctx.fillStyle='#fff7e7';ctx.fillRect(b.x,b.y,b.w,b.h);
   ctx.strokeStyle='#f6cb39';ctx.lineWidth=1.5;roundRect(ctx,b.x+1,b.y+1,b.w-2,b.h-2,16);ctx.fill();ctx.stroke();
   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,21*textScale('name',slot));
    const priceSize=27*textScale('sale',slot),priceBaseline=b.y+b.h-10;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#00358b';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#00358b';ctx.fillText(money(salePrice(product,slot)),b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}
