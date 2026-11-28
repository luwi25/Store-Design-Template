// Editable product cards over the supplied Sheldon Pinamungajan artwork.
const SHELDON_V2_FRONT_ID='sheldon-pinamungajan-v2-front';
const SHELDON_V2_FRONT_ART=__SHELDON_V2_FRONT_ART__;
const sheldonV2FrontSeeds=__SHELDON_V2_FRONT_SEEDS__;
const sheldonV2FrontGroups=[{"name": "Storage Units", "headerX": 40, "headerY": 655, "headerW": 590, "headerH": 75, "boxes": [[40, 750, 195, 375], [280, 750, 195, 375], [505, 750, 195, 375], [735, 750, 195, 375], [955, 750, 195, 375]], "photoHeights": [205, 205, 205, 205, 205]}, {"name": "Houseware", "headerX": 40, "headerY": 1170, "headerW": 590, "headerH": 75, "boxes": [[40, 1265, 195, 330], [280, 1265, 195, 330], [505, 1265, 195, 330], [735, 1265, 195, 330], [955, 1265, 195, 330]], "photoHeights": [175, 175, 175, 175, 175]}, {"name": "Kitchenware & Tableware", "headerX": 40, "headerY": 1640, "headerW": 980, "headerH": 75, "boxes": [[40, 1730, 195, 270], [280, 1730, 195, 270], [505, 1730, 195, 270], [735, 1730, 195, 270], [955, 1730, 195, 270]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Plasticware", "headerX": 40, "headerY": 2055, "headerW": 590, "headerH": 75, "boxes": [[40, 2140, 195, 265], [280, 2140, 195, 265], [505, 2140, 195, 265], [735, 2140, 195, 265], [955, 2140, 195, 265]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Electric Fan", "headerX": 1380, "headerY": 95, "headerW": 820, "headerH": 110, "boxes": [[1220, 260, 325, 530], [1585, 260, 335, 530], [1960, 260, 325, 530], [1240, 835, 475, 505], [1755, 835, 520, 505]], "photoHeights": [335, 335, 335, 320, 320]}, {"name": "Cookware, Kitchenware & More", "headerX": 1230, "headerY": 1415, "headerW": 1080, "headerH": 135, "boxes": [[1220, 1600, 350, 380], [1605, 1600, 310, 380], [1950, 1600, 335, 380], [1245, 2020, 465, 360], [1755, 2020, 520, 360]], "photoHeights": [205, 205, 205, 200, 200]}].map((group,index)=>({...group,items:sheldonV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let sheldonV2FrontArtwork=null;
function sheldonV2FrontState(){
 if(!state.sheldonV2Front)state.sheldonV2Front={slots:sheldonV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.sheldonV2Front.groupNames))state.sheldonV2Front.groupNames=sheldonV2FrontGroups.map(g=>g.name);
 return state.sheldonV2Front;
}

function seedSheldonV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of sheldonV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 sheldonV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[SHELDON_V2_FRONT_ID] ||= 'Template #2 - SHELDON PINAMUNGAJAN - FRONT';
 if(!state.templateSettings[SHELDON_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[SHELDON_V2_FRONT_ID]={poster:{...defaults.poster,store:'SHELDON PINAMUNGAJAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function sheldonV2FrontCard(index){
 const slots=sheldonV2FrontState().slots,slot=slots[index],group=sheldonV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function sheldonV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!sheldonV2FrontArtwork)sheldonV2FrontArtwork=await loadCanvasImage(SHELDON_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(sheldonV2FrontArtwork,0,0,3508,2480);
 const slots=sheldonV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 sheldonV2FrontGroups.forEach((group,groupIndex)=>{
  drawSheldonV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=sheldonV2FrontCard(index),large=groupIndex>=4;
   const seed=sheldonV2FrontSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===sheldonV2FrontSeeds[index]?.name){
     const seed=sheldonV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(sheldonV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function sheldonV2FrontLabel(index){return sheldonV2FrontState().groupNames[index]?.trim()||sheldonV2FrontGroups[index].name}
function drawSheldonV2FrontHeader(ctx,group,index){
 if(sheldonV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#a60000';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(sheldonV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncSheldonV2FrontControls(){
 let panel=$('sheldonV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='sheldonV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  sheldonV2FrontGroups.slice(0,6).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='sheldonV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{sheldonV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{sheldonV2FrontState().groupNames=sheldonV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==SHELDON_V2_FRONT_ID;
 if(!panel.hidden)sheldonV2FrontGroups.slice(0,6).forEach((group,index)=>{const input=$('sheldonV2FrontLabel-'+index);if(document.activeElement!==input)input.value=sheldonV2FrontState().groupNames[index]??group.name});
}
