// Editable product cards over the supplied Atomi Lutopan artwork.
const ATOMI_V2_FRONT_ID='atomi-lutopan-v2-front';
const ATOMI_V2_FRONT_ART=__ATOMI_V2_FRONT_ART__;
const atomiV2FrontSeeds=__ATOMI_V2_FRONT_SEEDS__;
const atomiV2FrontGroups=[{"name": "Storage Units", "headerX": 55, "headerY": 665, "headerW": 620, "boxes": [[60, 775, 190, 315], [290, 775, 190, 315], [515, 775, 190, 315], [735, 775, 190, 315], [955, 775, 190, 315]], "photoHeights": [175, 175, 175, 175, 175]}, {"name": "Houseware", "headerX": 55, "headerY": 1145, "headerW": 620, "boxes": [[60, 1245, 190, 305], [290, 1245, 190, 305], [515, 1245, 190, 305], [735, 1245, 190, 305], [955, 1245, 190, 305]], "photoHeights": [180, 180, 180, 180, 180]}, {"name": "Kitchenware & Tableware", "headerX": 55, "headerY": 1600, "headerW": 910, "boxes": [[60, 1705, 190, 265], [290, 1705, 190, 265], [515, 1705, 190, 265], [735, 1705, 190, 265], [955, 1705, 190, 265]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Plasticware", "headerX": 55, "headerY": 2020, "headerW": 620, "boxes": [[60, 2120, 190, 275], [290, 2120, 190, 275], [515, 2120, 190, 275], [735, 2120, 190, 275], [955, 2120, 190, 275]], "photoHeights": [150, 150, 150, 150, 150]}, {"name": "Electric Fan", "headerX": 1230, "headerY": 170, "headerW": 900, "headerH": 90, "boxes": [[1205, 345, 330, 545], [1575, 345, 335, 545], [1950, 345, 330, 545], [1280, 940, 440, 450], [1770, 940, 445, 450]], "photoHeights": [370, 370, 370, 300, 300]}, {"name": "Cookware, Kitchenware & More!", "headerX": 1220, "headerY": 1465, "headerW": 1030, "headerH": 115, "boxes": [[1205, 1650, 335, 330], [1575, 1650, 335, 330], [1950, 1650, 335, 330], [1250, 2025, 460, 390], [1760, 2025, 480, 390]], "photoHeights": [195, 195, 195, 235, 235]}].map((group,index)=>({...group,items:atomiV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let atomiV2FrontArtwork=null;
function atomiV2FrontState(){
 if(!state.atomiV2Front)state.atomiV2Front={slots:atomiV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.atomiV2Front.groupNames))state.atomiV2Front.groupNames=atomiV2FrontGroups.map(g=>g.name);
 return state.atomiV2Front;
}

function seedAtomiV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of atomiV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 atomiV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[ATOMI_V2_FRONT_ID] ||= 'Template #2 - ATOMI LUTOPAN - FRONT';
 if(!state.templateSettings[ATOMI_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[ATOMI_V2_FRONT_ID]={poster:{...defaults.poster,store:'ATOMI LUTOPAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function atomiV2FrontCard(index){
 const slots=atomiV2FrontState().slots,slot=slots[index],group=atomiV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function atomiV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!atomiV2FrontArtwork)atomiV2FrontArtwork=await loadCanvasImage(ATOMI_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(atomiV2FrontArtwork,0,0,3508,2480);
 const slots=atomiV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 atomiV2FrontGroups.forEach((group,groupIndex)=>{
  drawAtomiV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=atomiV2FrontCard(index),large=groupIndex>=4;
   const seed=atomiV2FrontSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===atomiV2FrontSeeds[index]?.name){
     const seed=atomiV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(atomiV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function atomiV2FrontLabel(index){return atomiV2FrontState().groupNames[index]?.trim()||atomiV2FrontGroups[index].name}
function drawAtomiV2FrontHeader(ctx,group,index){
 if(atomiV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#003395';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(atomiV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncAtomiV2FrontControls(){
 let panel=$('atomiV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='atomiV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  atomiV2FrontGroups.slice(0,6).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='atomiV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{atomiV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{atomiV2FrontState().groupNames=atomiV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==ATOMI_V2_FRONT_ID;
 if(!panel.hidden)atomiV2FrontGroups.slice(0,6).forEach((group,index)=>{const input=$('atomiV2FrontLabel-'+index);if(document.activeElement!==input)input.value=atomiV2FrontState().groupNames[index]??group.name});
}
