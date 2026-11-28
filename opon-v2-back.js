// Editable product cards over the supplied Kazumi Opon artwork.
const OPON_V2_BACK_ID='kazumi-opon-v2-back';
const OPON_V2_BACK_ART=__OPON_V2_BACK_ART__;
const oponV2BackSeeds=__OPON_V2_BACK_SEEDS__;
const oponV2BackGroups=[{"name": "Storage Units", "headerX": 40, "headerY": 375, "headerW": 1070, "boxes": [[50, 490, 160, 235], [235, 490, 160, 235], [420, 490, 160, 235], [605, 490, 160, 235], [790, 490, 160, 235], [975, 490, 160, 235]], "photoHeights": [120, 120, 120, 120, 120, 120]}, {"name": "Houseware", "headerX": 40, "headerY": 775, "headerW": 1070, "boxes": [[50, 890, 160, 235], [235, 890, 160, 235], [420, 890, 160, 235], [605, 890, 160, 235], [790, 890, 160, 235], [975, 890, 160, 235]], "photoHeights": [120, 120, 120, 120, 120, 120]}, {"name": "Kitchenware & Tableware", "headerX": 40, "headerY": 1175, "headerW": 1070, "boxes": [[50, 1290, 160, 220], [235, 1290, 160, 220], [420, 1290, 160, 220], [605, 1290, 160, 220], [790, 1290, 160, 220], [975, 1290, 160, 220]], "photoHeights": [110, 110, 110, 110, 110, 110]}, {"name": "Electric Fan", "headerX": 40, "headerY": 1560, "headerW": 1070, "boxes": [[50, 1660, 160, 220], [235, 1660, 160, 220], [420, 1660, 160, 220], [605, 1660, 160, 220], [790, 1660, 160, 220], [975, 1660, 160, 220]], "photoHeights": [110, 110, 110, 110, 110, 110]}, {"name": "Plasticware", "headerX": 40, "headerY": 1930, "headerW": 1070, "boxes": [[50, 2030, 160, 220], [235, 2030, 160, 220], [420, 2030, 160, 220], [605, 2030, 160, 220], [790, 2030, 160, 220], [975, 2030, 160, 220]], "photoHeights": [110, 110, 110, 110, 110, 110]}, {"name": "Storage Units", "headerX": 1210, "headerY": 375, "headerW": 1070, "boxes": [[1205, 490, 160, 235], [1390, 490, 160, 235], [1575, 490, 160, 235], [1760, 490, 160, 235], [1945, 490, 160, 235], [2130, 490, 160, 235]], "photoHeights": [120, 120, 120, 120, 120, 120]}, {"name": "Houseware", "headerX": 1210, "headerY": 775, "headerW": 1070, "boxes": [[1205, 890, 160, 235], [1390, 890, 160, 235], [1575, 890, 160, 235], [1760, 890, 160, 235], [1945, 890, 160, 235], [2130, 890, 160, 235]], "photoHeights": [120, 120, 120, 120, 120, 120]}, {"name": "Kitchenware & Tableware", "headerX": 1210, "headerY": 1175, "headerW": 1070, "boxes": [[1205, 1290, 160, 220], [1390, 1290, 160, 220], [1575, 1290, 160, 220], [1760, 1290, 160, 220], [1945, 1290, 160, 220], [2130, 1290, 160, 220]], "photoHeights": [110, 110, 110, 110, 110, 110]}, {"name": "Electric Fan", "headerX": 1210, "headerY": 1560, "headerW": 1070, "boxes": [[1205, 1660, 160, 220], [1390, 1660, 160, 220], [1575, 1660, 160, 220], [1760, 1660, 160, 220], [1945, 1660, 160, 220], [2130, 1660, 160, 220]], "photoHeights": [110, 110, 110, 110, 110, 110]}, {"name": "Plasticware", "headerX": 1210, "headerY": 1930, "headerW": 1070, "boxes": [[1205, 2030, 160, 220], [1390, 2030, 160, 220], [1575, 2030, 160, 220], [1760, 2030, 160, 220], [1945, 2030, 160, 220], [2130, 2030, 160, 220]], "photoHeights": [110, 110, 110, 110, 110, 110]}].map((group,index)=>({...group,items:oponV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let oponV2BackArtwork=null;
function oponV2BackState(){
 if(!state.oponV2Back)state.oponV2Back={slots:oponV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.oponV2Back.groupNames))state.oponV2Back.groupNames=oponV2BackGroups.map(g=>g.name);
 return state.oponV2Back;
}

function seedOponV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of oponV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 oponV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[OPON_V2_BACK_ID] ||= 'Template #2 - KAZUMI OPON - BACK';
 if(!state.templateSettings[OPON_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[OPON_V2_BACK_ID]={poster:{...defaults.poster,store:'KAZUMI OPON',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function oponV2BackCard(index){
 const slots=oponV2BackState().slots,slot=slots[index],group=oponV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function oponV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!oponV2BackArtwork)oponV2BackArtwork=await loadCanvasImage(OPON_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(oponV2BackArtwork,0,0,3508,2480);
 const slots=oponV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 oponV2BackGroups.forEach((group,groupIndex)=>{
  drawOponV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=oponV2BackCard(index),large=false;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:23)*textScale('name',slot));
    const priceSize=(large?60:36)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===oponV2BackSeeds[index]?.name){
     const seed=oponV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){ctx.save();ctx.fillStyle='#555';ctx.textAlign='center';ctx.font='600 28px Outfit, Arial, sans-serif';ctx.fillText('Insert',b.x+b.w/2,b.y+photoH/2-4);ctx.fillText('Product',b.x+b.w/2,b.y+photoH/2+27);ctx.restore()}
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

function oponV2BackLabel(index){return oponV2BackState().groupNames[index]?.trim()||oponV2BackGroups[index].name}
function drawOponV2BackHeader(ctx,group,index){
 if(oponV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#a00010';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(oponV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncOponV2BackControls(){
 let panel=$('oponV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='oponV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  oponV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='oponV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{oponV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{oponV2BackState().groupNames=oponV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==OPON_V2_BACK_ID;
 if(!panel.hidden)oponV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('oponV2BackLabel-'+index);if(document.activeElement!==input)input.value=oponV2BackState().groupNames[index]??group.name});
}
