// Editable product cards over the supplied Unico Talisay artwork.
const UNICO_V2_FRONT_ID='unico-talisay-v2-front';
const UNICO_V2_FRONT_ART=__UNICO_V2_FRONT_ART__;
const unicoV2FrontSeeds=__UNICO_V2_FRONT_SEEDS__;
const unicoV2FrontGroups=[{"name": "Kitchenware", "headerX": 225, "headerY": 390, "headerW": 750, "boxes": [[72, 508, 184, 207], [286, 508, 184, 207], [501, 508, 184, 207], [714, 508, 184, 207], [926, 508, 184, 207]]}, {"name": "Cookware", "headerX": 225, "headerY": 782, "headerW": 750, "boxes": [[72, 902, 184, 208], [286, 902, 184, 208], [501, 902, 184, 208], [714, 902, 184, 208], [926, 902, 184, 208]]}, {"name": "Plasticware", "headerX": 225, "headerY": 1175, "headerW": 750, "boxes": [[72, 1294, 184, 195], [286, 1294, 184, 195], [501, 1294, 184, 195], [714, 1294, 184, 195], [926, 1294, 184, 195]]}, {"name": "Storage", "headerX": 225, "headerY": 1545, "headerW": 750, "boxes": [[72, 1654, 184, 174], [286, 1654, 184, 174], [501, 1654, 184, 174], [714, 1654, 184, 174], [926, 1654, 184, 174]]}, {"name": "Houseware", "headerX": 225, "headerY": 1890, "headerW": 750, "boxes": [[72, 1994, 184, 176], [286, 1994, 184, 176], [501, 1994, 184, 176], [714, 1994, 184, 176], [926, 1994, 184, 176]]}, {"name": "Kitchenware", "headerX": 1470, "headerY": 1060, "headerW": 570, "boxes": [[1210, 1214, 173, 315], [1414, 1214, 173, 315], [1618, 1214, 173, 315], [1821, 1214, 173, 315], [2025, 1214, 173, 315]]}, {"name": "Cookware", "headerX": 1470, "headerY": 1640, "headerW": 570, "boxes": [[1210, 1790, 173, 315], [1414, 1790, 173, 315], [1618, 1790, 173, 315], [1821, 1790, 173, 315], [2025, 1790, 173, 315]]}, {"name": "Featured products", "boxes": [[2280, 1690, 373, 176], [2694, 1690, 373, 176], [3101, 1690, 373, 176], [2280, 1910, 373, 176], [2694, 1910, 373, 176], [3101, 1910, 373, 176]]}].map((group,index)=>({...group,items:unicoV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let unicoV2FrontArtwork=null;
function unicoV2FrontState(){
 if(!state.unicoV2Front)state.unicoV2Front={slots:unicoV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.unicoV2Front.groupNames))state.unicoV2Front.groupNames=unicoV2FrontGroups.map(g=>g.name);
 return state.unicoV2Front;
}

function seedUnicoV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of unicoV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 unicoV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[UNICO_V2_FRONT_ID] ||= 'Template #2 - UNICO TALISAY - FRONT';
 if(!state.templateSettings[UNICO_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[UNICO_V2_FRONT_ID]={poster:{...defaults.poster,store:'UNICO TALISAY',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function unicoV2FrontCard(index){
 const slots=unicoV2FrontState().slots,slot=slots[index],group=unicoV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function unicoV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!unicoV2FrontArtwork)unicoV2FrontArtwork=await loadCanvasImage(UNICO_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(unicoV2FrontArtwork,0,0,3508,2480);
 const slots=unicoV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 unicoV2FrontGroups.forEach((group,groupIndex)=>{
  drawUnicoV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=unicoV2FrontCard(index),large=false;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot&&groupIndex===7){
    const im=photos[index],textX=b.x+164,textW=b.w-174;
    if(im){const scale=Math.min(145/im.width,(b.h-20)/im.height);ctx.drawImage(im,b.x+8+(145-im.width*scale)/2,b.y+(b.h-im.height*scale)/2,im.width*scale,im.height*scale)}
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',textW,30*textScale('name',slot));
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,textX+textW/2,b.y+36+i*lineHeight,textW));
    if(product){ctx.font=`800 ${43*textScale('sale',slot)}px Outfit, Arial, sans-serif`;ctx.fillStyle='#ff0000';ctx.fillText(money(salePrice(product,slot)),textX+textW/2,b.y+b.h-28,textW)}
   }else if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#ff0000';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b10.00',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function unicoV2FrontLabel(index){return unicoV2FrontState().groupNames[index]?.trim()||unicoV2FrontGroups[index].name}
function drawUnicoV2FrontHeader(ctx,group,index){
 if(index===7||unicoV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#b00000';roundRect(ctx,group.headerX,group.headerY,group.headerW,index>=5?106:90,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${index>=5?74:52}px Outfit, Arial, sans-serif`;ctx.fillText(unicoV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(index>=5?53:45),group.headerW-30);ctx.restore();
}
function syncUnicoV2FrontControls(){
 let panel=$('unicoV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='unicoV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  unicoV2FrontGroups.slice(0,7).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='unicoV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{unicoV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{unicoV2FrontState().groupNames=unicoV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==UNICO_V2_FRONT_ID;
 if(!panel.hidden)unicoV2FrontGroups.slice(0,7).forEach((group,index)=>{const input=$('unicoV2FrontLabel-'+index);if(document.activeElement!==input)input.value=unicoV2FrontState().groupNames[index]??group.name});
}
