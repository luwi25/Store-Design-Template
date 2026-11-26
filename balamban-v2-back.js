// Editable product cards over the supplied Unico Balamban artwork.
const BALAMBAN_V2_BACK_ID='unico-balamban-v2-back';
const BALAMBAN_V2_BACK_ART=__BALAMBAN_V2_BACK_ART__;
const balambanV2BackSeeds=__BALAMBAN_V2_BACK_SEEDS__;
const balambanV2BackGroups=[{"name": "Storage Units", "headerX": 50, "headerY": 545, "headerW": 650, "boxes": [[40, 635, 215, 305], [275, 635, 200, 305], [495, 635, 198, 305], [713, 635, 200, 305], [932, 635, 205, 305]], "photoHeights": [160, 160, 160, 160, 160]}, {"name": "Houseware", "headerX": 50, "headerY": 985, "headerW": 650, "boxes": [[40, 1070, 215, 280], [275, 1070, 200, 280], [495, 1070, 198, 280], [713, 1070, 200, 280], [932, 1070, 205, 280]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Kitchenware & Tableware", "headerX": 50, "headerY": 1390, "headerW": 970, "boxes": [[40, 1470, 215, 245], [275, 1470, 200, 245], [495, 1470, 198, 245], [713, 1470, 200, 245], [932, 1470, 205, 245]], "photoHeights": [125, 125, 125, 125, 125]}, {"name": "Electric Fan", "headerX": 50, "headerY": 1750, "headerW": 650, "boxes": [[40, 1830, 215, 230], [275, 1830, 200, 230], [495, 1830, 198, 230], [713, 1830, 200, 230], [932, 1830, 205, 230]], "photoHeights": [125, 125, 125, 125, 125]}, {"name": "Plasticware", "headerX": 50, "headerY": 2090, "headerW": 650, "boxes": [[40, 2160, 215, 190], [275, 2160, 200, 190], [495, 2160, 198, 190], [713, 2160, 200, 190], [932, 2160, 205, 190]], "photoHeights": [90, 90, 90, 90, 90]}, {"name": "Storage Units", "headerX": 1220, "headerY": 545, "headerW": 650, "boxes": [[1200, 635, 210, 305], [1430, 635, 207, 305], [1655, 635, 205, 305], [1880, 635, 200, 305], [2100, 635, 210, 305]], "photoHeights": [160, 160, 160, 160, 160]}, {"name": "Houseware", "headerX": 1220, "headerY": 985, "headerW": 650, "boxes": [[1200, 1070, 210, 280], [1430, 1070, 207, 280], [1655, 1070, 205, 280], [1880, 1070, 200, 280], [2100, 1070, 210, 280]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Kitchenware & Tableware", "headerX": 1220, "headerY": 1390, "headerW": 970, "boxes": [[1200, 1470, 210, 245], [1430, 1470, 207, 245], [1655, 1470, 205, 245], [1880, 1470, 200, 245], [2100, 1470, 210, 245]], "photoHeights": [125, 125, 125, 125, 125]}, {"name": "Electric Fan", "headerX": 1220, "headerY": 1750, "headerW": 650, "boxes": [[1200, 1830, 210, 230], [1430, 1830, 207, 230], [1655, 1830, 205, 230], [1880, 1830, 200, 230], [2100, 1830, 210, 230]], "photoHeights": [125, 125, 125, 125, 125]}, {"name": "Plasticware", "headerX": 1220, "headerY": 2090, "headerW": 650, "boxes": [[1200, 2160, 210, 190], [1430, 2160, 207, 190], [1655, 2160, 205, 190], [1880, 2160, 200, 190], [2100, 2160, 210, 190]], "photoHeights": [90, 90, 90, 90, 90]}].map((group,index)=>({...group,items:balambanV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let balambanV2BackArtwork=null;
function balambanV2BackState(){
 if(!state.balambanV2Back)state.balambanV2Back={slots:balambanV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.balambanV2Back.groupNames))state.balambanV2Back.groupNames=balambanV2BackGroups.map(g=>g.name);
 return state.balambanV2Back;
}

function seedBalambanV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of balambanV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 balambanV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[BALAMBAN_V2_BACK_ID] ||= 'Template #2 - UNICO BALAMBAN - BACK';
 if(!state.templateSettings[BALAMBAN_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[BALAMBAN_V2_BACK_ID]={poster:{...defaults.poster,store:'UNICO BALAMBAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function balambanV2BackCard(index){
 const slots=balambanV2BackState().slots,slot=slots[index],group=balambanV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function balambanV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!balambanV2BackArtwork)balambanV2BackArtwork=await loadCanvasImage(BALAMBAN_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(balambanV2BackArtwork,0,0,3508,2480);
 const slots=balambanV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 balambanV2BackGroups.forEach((group,groupIndex)=>{
  drawBalambanV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=balambanV2BackCard(index),large=false;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===balambanV2BackSeeds[index]?.name){
     const seed=balambanV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(balambanV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function balambanV2BackLabel(index){return balambanV2BackState().groupNames[index]?.trim()||balambanV2BackGroups[index].name}
function drawBalambanV2BackHeader(ctx,group,index){
 if(balambanV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#151515';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(balambanV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncBalambanV2BackControls(){
 let panel=$('balambanV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='balambanV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  balambanV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='balambanV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{balambanV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{balambanV2BackState().groupNames=balambanV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==BALAMBAN_V2_BACK_ID;
 if(!panel.hidden)balambanV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('balambanV2BackLabel-'+index);if(document.activeElement!==input)input.value=balambanV2BackState().groupNames[index]??group.name});
}
