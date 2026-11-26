// Editable product cards over the supplied Unico Pinamungajan artwork.
const PINAM_V2_FRONT_ID='unico-pinamungajan-v2-front';
const PINAM_V2_FRONT_ART=__PINAM_V2_FRONT_ART__;
const pinamV2FrontSeeds=__PINAM_V2_FRONT_SEEDS__;
const pinamV2FrontGroups=[{"name": "Storage Units", "headerX": 40, "headerY": 685, "headerW": 870, "boxes": [[40, 780, 210, 350], [275, 780, 210, 350], [500, 780, 210, 350], [725, 780, 210, 350], [940, 780, 210, 350]], "photoHeights": [190, 190, 190, 190, 190]}, {"name": "Houseware", "headerX": 40, "headerY": 1175, "headerW": 870, "boxes": [[40, 1270, 210, 330], [275, 1270, 210, 330], [500, 1270, 210, 330], [725, 1270, 210, 330], [940, 1270, 210, 330]], "photoHeights": [195, 195, 195, 195, 195]}, {"name": "Kitchenware & Tableware", "headerX": 40, "headerY": 1645, "headerW": 870, "boxes": [[40, 1730, 210, 285], [275, 1730, 210, 285], [500, 1730, 210, 285], [725, 1730, 210, 285], [940, 1730, 210, 285]], "photoHeights": [150, 150, 150, 150, 150]}, {"name": "Plasticware", "headerX": 40, "headerY": 2060, "headerW": 870, "boxes": [[40, 2150, 210, 275], [275, 2150, 210, 275], [500, 2150, 210, 275], [725, 2150, 210, 275], [940, 2150, 210, 275]], "photoHeights": [135, 135, 135, 135, 135]}, {"name": "Electric Fan", "headerX": 1230, "headerY": 500, "headerW": 820, "headerH": 75, "boxes": [[1225, 630, 330, 495], [1595, 630, 330, 495], [1965, 630, 330, 495], [1280, 1175, 450, 355], [1785, 1175, 450, 355]], "photoHeights": [335, 335, 335, 205, 205]}, {"name": "Cookware, Kitchenware & More", "headerX": 1230, "headerY": 1605, "headerW": 1060, "headerH": 70, "boxes": [[1225, 1715, 330, 315], [1595, 1715, 330, 315], [1965, 1715, 330, 315], [1275, 2070, 460, 350], [1785, 2070, 470, 350]], "photoHeights": [170, 170, 170, 200, 200]}].map((group,index)=>({...group,items:pinamV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let pinamV2FrontArtwork=null;
function pinamV2FrontState(){
 if(!state.pinamV2Front)state.pinamV2Front={slots:pinamV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.pinamV2Front.groupNames))state.pinamV2Front.groupNames=pinamV2FrontGroups.map(g=>g.name);
 return state.pinamV2Front;
}

function seedPinamV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of pinamV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 pinamV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[PINAM_V2_FRONT_ID] ||= 'Template #2 - UNICO PINAMUNGAJAN - FRONT';
 if(!state.templateSettings[PINAM_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[PINAM_V2_FRONT_ID]={poster:{...defaults.poster,store:'UNICO PINAMUNGAJAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function pinamV2FrontCard(index){
 const slots=pinamV2FrontState().slots,slot=slots[index],group=pinamV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function pinamV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!pinamV2FrontArtwork)pinamV2FrontArtwork=await loadCanvasImage(PINAM_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(pinamV2FrontArtwork,0,0,3508,2480);
 const slots=pinamV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 pinamV2FrontGroups.forEach((group,groupIndex)=>{
  drawPinamV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=pinamV2FrontCard(index),large=groupIndex>=4;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===pinamV2FrontSeeds[index]?.name){
     const seed=pinamV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(pinamV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
    }
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.fillStyle='#d00000';roundRect(ctx,b.x+12,priceBaseline-priceSize+2,b.w-24,priceSize+10,24);ctx.fill();ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#fff';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b10.00',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function pinamV2FrontLabel(index){return pinamV2FrontState().groupNames[index]?.trim()||pinamV2FrontGroups[index].name}
function drawPinamV2FrontHeader(ctx,group,index){
 if(pinamV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#b00000';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(pinamV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncPinamV2FrontControls(){
 let panel=$('pinamV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='pinamV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  pinamV2FrontGroups.slice(0,6).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='pinamV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{pinamV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{pinamV2FrontState().groupNames=pinamV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==PINAM_V2_FRONT_ID;
 if(!panel.hidden)pinamV2FrontGroups.slice(0,6).forEach((group,index)=>{const input=$('pinamV2FrontLabel-'+index);if(document.activeElement!==input)input.value=pinamV2FrontState().groupNames[index]??group.name});
}
