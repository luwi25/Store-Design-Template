// Editable product cards over the supplied Alkeia Carmen artwork.
const CARMEN_V2_FRONT_ID='alkeia-carmen-v2-front';
const CARMEN_V2_FRONT_ART=__CARMEN_V2_FRONT_ART__;
const carmenV2FrontSeeds=__CARMEN_V2_FRONT_SEEDS__;
const carmenV2FrontGroups=[{"name": "Storage Units", "headerX": 60, "headerY": 580, "headerW": 540, "boxes": [[65, 670, 200, 305], [290, 670, 200, 305], [505, 670, 200, 305], [720, 670, 200, 305], [930, 670, 200, 305]], "photoHeights": [165, 165, 165, 165, 165]}, {"name": "Houseware", "headerX": 60, "headerY": 1025, "headerW": 540, "boxes": [[65, 1110, 200, 290], [290, 1110, 200, 290], [505, 1110, 200, 290], [720, 1110, 200, 290], [930, 1110, 200, 290]], "photoHeights": [165, 165, 165, 165, 165]}, {"name": "Kitchenware & Tableware", "headerX": 60, "headerY": 1450, "headerW": 810, "boxes": [[65, 1530, 200, 245], [290, 1530, 200, 245], [505, 1530, 200, 245], [720, 1530, 200, 245], [930, 1530, 200, 245]], "photoHeights": [125, 125, 125, 125, 125]}, {"name": "Electric Fan", "headerX": 60, "headerY": 1820, "headerW": 540, "boxes": [[65, 1895, 200, 235], [290, 1895, 200, 235], [505, 1895, 200, 235], [720, 1895, 200, 235], [930, 1895, 200, 235]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Plasticware", "headerX": 60, "headerY": 2170, "headerW": 540, "boxes": [[65, 2240, 200, 210], [290, 2240, 200, 210], [505, 2240, 200, 210], [720, 2240, 200, 210], [930, 2240, 200, 210]], "photoHeights": [105, 105, 105, 105, 105]}, {"name": "Electric Fan", "headerX": 1380, "headerY": 195, "headerW": 730, "headerH": 100, "boxes": [[1220, 365, 310, 530], [1585, 365, 310, 530], [1955, 365, 310, 530], [1285, 940, 410, 450], [1765, 940, 430, 450]], "photoHeights": [345, 345, 345, 285, 285]}, {"name": "Cookware, Kitchenware & More", "headerX": 1220, "headerY": 1450, "headerW": 1030, "headerH": 140, "boxes": [[1210, 1635, 330, 315], [1580, 1635, 330, 315], [1955, 1635, 320, 315], [1300, 2000, 400, 365], [1770, 2000, 420, 365]], "photoHeights": [190, 190, 190, 220, 220]}].map((group,index)=>({...group,items:carmenV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let carmenV2FrontArtwork=null;
function carmenV2FrontState(){
 if(!state.carmenV2Front)state.carmenV2Front={slots:carmenV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.carmenV2Front.groupNames))state.carmenV2Front.groupNames=carmenV2FrontGroups.map(g=>g.name);
 return state.carmenV2Front;
}

function seedCarmenV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of carmenV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 carmenV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[CARMEN_V2_FRONT_ID] ||= 'Template #2 - ALKEIA CARMEN - FRONT';
 if(!state.templateSettings[CARMEN_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[CARMEN_V2_FRONT_ID]={poster:{...defaults.poster,store:'ALKEIA CARMEN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function carmenV2FrontCard(index){
 const slots=carmenV2FrontState().slots,slot=slots[index],group=carmenV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function carmenV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!carmenV2FrontArtwork)carmenV2FrontArtwork=await loadCanvasImage(CARMEN_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(carmenV2FrontArtwork,0,0,3508,2480);
 const slots=carmenV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 carmenV2FrontGroups.forEach((group,groupIndex)=>{
  drawCarmenV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=carmenV2FrontCard(index),large=groupIndex>=5;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===carmenV2FrontSeeds[index]?.name){
     const seed=carmenV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(carmenV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function carmenV2FrontLabel(index){return carmenV2FrontState().groupNames[index]?.trim()||carmenV2FrontGroups[index].name}
function drawCarmenV2FrontHeader(ctx,group,index){
 if(carmenV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#b00000';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(carmenV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncCarmenV2FrontControls(){
 let panel=$('carmenV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='carmenV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  carmenV2FrontGroups.slice(0,7).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='carmenV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{carmenV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{carmenV2FrontState().groupNames=carmenV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==CARMEN_V2_FRONT_ID;
 if(!panel.hidden)carmenV2FrontGroups.slice(0,7).forEach((group,index)=>{const input=$('carmenV2FrontLabel-'+index);if(document.activeElement!==input)input.value=carmenV2FrontState().groupNames[index]??group.name});
}
