// Editable product cards over the supplied Atomi Lutopan artwork.
const ATOMI_V2_BACK_ID='atomi-lutopan-v2-back';
const ATOMI_V2_BACK_ART=__ATOMI_V2_BACK_ART__;
const atomiV2BackSeeds=__ATOMI_V2_BACK_SEEDS__;
const atomiV2BackGroups=[{"name": "Storage Units", "headerX": 60, "headerY": 415, "headerW": 650, "boxes": [[60, 510, 185, 320], [295, 510, 185, 320], [515, 510, 185, 320], [735, 510, 185, 320], [950, 510, 185, 320]], "photoHeights": [175, 175, 175, 175, 175]}, {"name": "Houseware", "headerX": 60, "headerY": 880, "headerW": 650, "boxes": [[60, 970, 185, 310], [295, 970, 185, 310], [515, 970, 185, 310], [735, 970, 185, 310], [950, 970, 185, 310]], "photoHeights": [175, 175, 175, 175, 175]}, {"name": "Kitchenware & Tableware", "headerX": 60, "headerY": 1330, "headerW": 940, "boxes": [[60, 1420, 185, 265], [295, 1420, 185, 265], [515, 1420, 185, 265], [735, 1420, 185, 265], [950, 1420, 185, 265]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Electric Fan", "headerX": 60, "headerY": 1725, "headerW": 650, "boxes": [[60, 1810, 185, 265], [295, 1810, 185, 265], [515, 1810, 185, 265], [735, 1810, 185, 265], [950, 1810, 185, 265]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Plasticware", "headerX": 60, "headerY": 2120, "headerW": 650, "boxes": [[60, 2200, 185, 225], [295, 2200, 185, 225], [515, 2200, 185, 225], [735, 2200, 185, 225], [950, 2200, 185, 225]], "photoHeights": [115, 115, 115, 115, 115]}, {"name": "Storage Units", "headerX": 1230, "headerY": 295, "headerW": 650, "boxes": [[1215, 395, 185, 335], [1440, 395, 185, 335], [1665, 395, 185, 335], [1890, 395, 185, 335], [2110, 395, 185, 335]], "photoHeights": [175, 175, 175, 175, 175]}, {"name": "Houseware", "headerX": 1230, "headerY": 780, "headerW": 650, "boxes": [[1215, 870, 185, 335], [1440, 870, 185, 335], [1665, 870, 185, 335], [1890, 870, 185, 335], [2110, 870, 185, 335]], "photoHeights": [180, 180, 180, 180, 180]}, {"name": "Kitchenware & Tableware", "headerX": 1230, "headerY": 1255, "headerW": 940, "boxes": [[1215, 1340, 185, 285], [1440, 1340, 185, 285], [1665, 1340, 185, 285], [1890, 1340, 185, 285], [2110, 1340, 185, 285]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Electric Fan", "headerX": 1230, "headerY": 1675, "headerW": 650, "boxes": [[1215, 1750, 185, 300], [1440, 1750, 185, 300], [1665, 1750, 185, 300], [1890, 1750, 185, 300], [2110, 1750, 185, 300]], "photoHeights": [170, 170, 170, 170, 170]}, {"name": "Plasticware", "headerX": 1230, "headerY": 2085, "headerW": 650, "boxes": [[1215, 2160, 185, 265], [1440, 2160, 185, 265], [1665, 2160, 185, 265], [1890, 2160, 185, 265], [2110, 2160, 185, 265]], "photoHeights": [140, 140, 140, 140, 140]}].map((group,index)=>({...group,items:atomiV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let atomiV2BackArtwork=null;
function atomiV2BackState(){
 if(!state.atomiV2Back)state.atomiV2Back={slots:atomiV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.atomiV2Back.groupNames))state.atomiV2Back.groupNames=atomiV2BackGroups.map(g=>g.name);
 return state.atomiV2Back;
}

function seedAtomiV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of atomiV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 atomiV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[ATOMI_V2_BACK_ID] ||= 'Template #2 - ATOMI LUTOPAN - BACK';
 if(!state.templateSettings[ATOMI_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[ATOMI_V2_BACK_ID]={poster:{...defaults.poster,store:'ATOMI LUTOPAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function atomiV2BackCard(index){
 const slots=atomiV2BackState().slots,slot=slots[index],group=atomiV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function atomiV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!atomiV2BackArtwork)atomiV2BackArtwork=await loadCanvasImage(ATOMI_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(atomiV2BackArtwork,0,0,3508,2480);
 const slots=atomiV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 atomiV2BackGroups.forEach((group,groupIndex)=>{
  drawAtomiV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=atomiV2BackCard(index),large=false;
   const seed=atomiV2BackSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===atomiV2BackSeeds[index]?.name){
     const seed=atomiV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(atomiV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function atomiV2BackLabel(index){return atomiV2BackState().groupNames[index]?.trim()||atomiV2BackGroups[index].name}
function drawAtomiV2BackHeader(ctx,group,index){
 if(atomiV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#003395';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(atomiV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncAtomiV2BackControls(){
 let panel=$('atomiV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='atomiV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  atomiV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='atomiV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{atomiV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{atomiV2BackState().groupNames=atomiV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==ATOMI_V2_BACK_ID;
 if(!panel.hidden)atomiV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('atomiV2BackLabel-'+index);if(document.activeElement!==input)input.value=atomiV2BackState().groupNames[index]??group.name});
}
