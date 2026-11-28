// Editable product cards over the supplied Weldon Bogo artwork.
const BOGO_V2_FRONT_ID='weldon-bogo-v2-front';
const BOGO_V2_FRONT_ART=__BOGO_V2_FRONT_ART__;
const bogoV2FrontSeeds=__BOGO_V2_FRONT_SEEDS__;
const bogoV2FrontGroups=[{"name": "Storage Units", "headerX": 60, "headerY": 620, "headerW": 720, "boxes": [[50, 730, 195, 310], [280, 730, 195, 310], [505, 730, 195, 310], [735, 730, 195, 310], [955, 730, 195, 310]], "photoHeights": [170, 170, 170, 170, 170]}, {"name": "Houseware", "headerX": 60, "headerY": 1100, "headerW": 720, "boxes": [[50, 1200, 195, 310], [280, 1200, 195, 310], [505, 1200, 195, 310], [735, 1200, 195, 310], [955, 1200, 195, 310]], "photoHeights": [180, 180, 180, 180, 180]}, {"name": "Kitchenware & Tableware", "headerX": 60, "headerY": 1570, "headerW": 1000, "boxes": [[50, 1670, 195, 280], [280, 1670, 195, 280], [505, 1670, 195, 280], [735, 1670, 195, 280], [955, 1670, 195, 280]], "photoHeights": [155, 155, 155, 155, 155]}, {"name": "Plasticware", "headerX": 60, "headerY": 2005, "headerW": 720, "boxes": [[50, 2105, 195, 260], [280, 2105, 195, 260], [505, 2105, 195, 260], [735, 2105, 195, 260], [955, 2105, 195, 260]], "photoHeights": [135, 135, 135, 135, 135]}, {"name": "Electric Fan", "headerX": 1280, "headerY": 455, "headerW": 940, "headerH": 75, "boxes": [[1240, 575, 310, 445], [1600, 575, 310, 445], [1950, 575, 310, 445], [1340, 1070, 390, 370], [1780, 1070, 390, 370]], "photoHeights": [310, 310, 310, 245, 245]}, {"name": "Cookware, Kitchenware & More", "headerX": 1240, "headerY": 1520, "headerW": 1020, "headerH": 75, "boxes": [[1225, 1635, 330, 300], [1600, 1635, 310, 300], [1950, 1635, 330, 300], [1330, 1975, 395, 335], [1780, 1975, 395, 335]], "photoHeights": [190, 190, 190, 195, 195]}].map((group,index)=>({...group,items:bogoV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let bogoV2FrontArtwork=null;
function bogoV2FrontState(){
 if(!state.bogoV2Front)state.bogoV2Front={slots:bogoV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.bogoV2Front.groupNames))state.bogoV2Front.groupNames=bogoV2FrontGroups.map(g=>g.name);
 return state.bogoV2Front;
}

function seedBogoV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of bogoV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 bogoV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[BOGO_V2_FRONT_ID] ||= 'Template #2 - WELDON BOGO - FRONT';
 if(!state.templateSettings[BOGO_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[BOGO_V2_FRONT_ID]={poster:{...defaults.poster,store:'WELDON BOGO',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function bogoV2FrontCard(index){
 const slots=bogoV2FrontState().slots,slot=slots[index],group=bogoV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function bogoV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!bogoV2FrontArtwork)bogoV2FrontArtwork=await loadCanvasImage(BOGO_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(bogoV2FrontArtwork,0,0,3508,2480);
 const slots=bogoV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 bogoV2FrontGroups.forEach((group,groupIndex)=>{
  drawBogoV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=bogoV2FrontCard(index),large=groupIndex>=4;
   const seed=bogoV2FrontSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===bogoV2FrontSeeds[index]?.name){
     const seed=bogoV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(bogoV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function bogoV2FrontLabel(index){return bogoV2FrontState().groupNames[index]?.trim()||bogoV2FrontGroups[index].name}
function drawBogoV2FrontHeader(ctx,group,index){
 if(bogoV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#b00013';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(bogoV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncBogoV2FrontControls(){
 let panel=$('bogoV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='bogoV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  bogoV2FrontGroups.slice(0,6).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='bogoV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{bogoV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{bogoV2FrontState().groupNames=bogoV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==BOGO_V2_FRONT_ID;
 if(!panel.hidden)bogoV2FrontGroups.slice(0,6).forEach((group,index)=>{const input=$('bogoV2FrontLabel-'+index);if(document.activeElement!==input)input.value=bogoV2FrontState().groupNames[index]??group.name});
}
