// Editable product cards over the supplied Unico Talisay artwork.
const TALISAY_V2_BACK_ID='unico-talisay-v2-back';
const TALISAY_V2_BACK_ART=__TALISAY_V2_BACK_ART__;
const talisayV2BackSeeds=__TALISAY_V2_BACK_SEEDS__;
const talisayV2BackGroups=[{"name": "Kitchenware", "headerX": 220, "headerY": 530, "headerW": 860, "boxes": [[55, 635, 195, 295], [280, 635, 195, 295], [500, 635, 195, 295], [715, 635, 195, 295], [935, 635, 195, 295]], "photoHeights": [180, 180, 180, 180, 180]}, {"name": "Cookware", "headerX": 220, "headerY": 955, "headerW": 860, "boxes": [[55, 1050, 195, 240], [280, 1050, 195, 240], [500, 1050, 195, 240], [715, 1050, 195, 240], [935, 1050, 195, 240]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Plasticware", "headerX": 220, "headerY": 1315, "headerW": 860, "boxes": [[55, 1405, 195, 245], [280, 1405, 195, 245], [500, 1405, 195, 245], [715, 1405, 195, 245], [935, 1405, 195, 245]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Storage", "headerX": 220, "headerY": 1680, "headerW": 860, "boxes": [[55, 1765, 195, 235], [280, 1765, 195, 235], [500, 1765, 195, 235], [715, 1765, 195, 235], [935, 1765, 195, 235]], "photoHeights": [125, 125, 125, 125, 125]}, {"name": "Houseware", "headerX": 220, "headerY": 2025, "headerW": 860, "boxes": [[55, 2100, 195, 205], [280, 2100, 195, 205], [500, 2100, 195, 205], [715, 2100, 195, 205], [935, 2100, 195, 205]], "photoHeights": [105, 105, 105, 105, 105]}, {"name": "Kitchenware", "headerX": 1390, "headerY": 530, "headerW": 860, "boxes": [[1225, 635, 195, 295], [1450, 635, 195, 295], [1670, 635, 195, 295], [1885, 635, 195, 295], [2105, 635, 195, 295]], "photoHeights": [180, 180, 180, 180, 180]}, {"name": "Cookware", "headerX": 1390, "headerY": 955, "headerW": 860, "boxes": [[1225, 1050, 195, 240], [1450, 1050, 195, 240], [1670, 1050, 195, 240], [1885, 1050, 195, 240], [2105, 1050, 195, 240]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Plasticware", "headerX": 1390, "headerY": 1315, "headerW": 860, "boxes": [[1225, 1405, 195, 245], [1450, 1405, 195, 245], [1670, 1405, 195, 245], [1885, 1405, 195, 245], [2105, 1405, 195, 245]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Storage", "headerX": 1390, "headerY": 1680, "headerW": 860, "boxes": [[1225, 1765, 195, 235], [1450, 1765, 195, 235], [1670, 1765, 195, 235], [1885, 1765, 195, 235], [2105, 1765, 195, 235]], "photoHeights": [125, 125, 125, 125, 125]}, {"name": "Houseware", "headerX": 1390, "headerY": 2025, "headerW": 860, "boxes": [[1225, 2100, 195, 205], [1450, 2100, 195, 205], [1670, 2100, 195, 205], [1885, 2100, 195, 205], [2105, 2100, 195, 205]], "photoHeights": [105, 105, 105, 105, 105]}].map((group,index)=>({...group,items:talisayV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let talisayV2BackArtwork=null;
function talisayV2BackState(){
 if(!state.talisayV2Back)state.talisayV2Back={slots:talisayV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.talisayV2Back.groupNames))state.talisayV2Back.groupNames=talisayV2BackGroups.map(g=>g.name);
 return state.talisayV2Back;
}

function seedTalisayV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of talisayV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 talisayV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[TALISAY_V2_BACK_ID] ||= 'Template #2 - UNICO TALISAY - BACK';
 if(!state.templateSettings[TALISAY_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[TALISAY_V2_BACK_ID]={poster:{...defaults.poster,store:'UNICO TALISAY',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function talisayV2BackCard(index){
 const slots=talisayV2BackState().slots,slot=slots[index],group=talisayV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function talisayV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!talisayV2BackArtwork)talisayV2BackArtwork=await loadCanvasImage(TALISAY_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(talisayV2BackArtwork,0,0,3508,2480);
 const slots=talisayV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 talisayV2BackGroups.forEach((group,groupIndex)=>{
  drawTalisayV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=talisayV2BackCard(index),large=false;
   const seed=talisayV2BackSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===talisayV2BackSeeds[index]?.name){
     const seed=talisayV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(talisayV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
    }
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#d00000';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b10.00',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function talisayV2BackLabel(index){return talisayV2BackState().groupNames[index]?.trim()||talisayV2BackGroups[index].name}
function drawTalisayV2BackHeader(ctx,group,index){
 if(talisayV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#b00000';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(talisayV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncTalisayV2BackControls(){
 let panel=$('talisayV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='talisayV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  talisayV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='talisayV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{talisayV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{talisayV2BackState().groupNames=talisayV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==TALISAY_V2_BACK_ID;
 if(!panel.hidden)talisayV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('talisayV2BackLabel-'+index);if(document.activeElement!==input)input.value=talisayV2BackState().groupNames[index]??group.name});
}
