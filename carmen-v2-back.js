// Editable product cards over the supplied Alkeia Carmen artwork.
const CARMEN_V2_BACK_ID='alkeia-carmen-v2-back';
const CARMEN_V2_BACK_ART=__CARMEN_V2_BACK_ART__;
const carmenV2BackSeeds=__CARMEN_V2_BACK_SEEDS__;
const carmenV2BackGroups=[{"name": "Storage Units", "headerX": 50, "headerY": 175, "headerW": 970, "boxes": [[65, 280, 200, 350], [295, 280, 200, 350], [515, 280, 200, 350], [730, 280, 200, 350], [940, 280, 200, 350]], "photoHeights": [190, 190, 190, 190, 190]}, {"name": "Houseware", "headerX": 50, "headerY": 685, "headerW": 970, "boxes": [[65, 785, 200, 350], [295, 785, 200, 350], [515, 785, 200, 350], [730, 785, 200, 350], [940, 785, 200, 350]], "photoHeights": [200, 200, 200, 200, 200]}, {"name": "Kitchenware & Tableware", "headerX": 50, "headerY": 1195, "headerW": 970, "boxes": [[65, 1295, 200, 290], [295, 1295, 200, 290], [515, 1295, 200, 290], [730, 1295, 200, 290], [940, 1295, 200, 290]], "photoHeights": [150, 150, 150, 150, 150]}, {"name": "Electric Fan", "headerX": 50, "headerY": 1625, "headerW": 970, "boxes": [[65, 1720, 200, 290], [295, 1720, 200, 290], [515, 1720, 200, 290], [730, 1720, 200, 290], [940, 1720, 200, 290]], "photoHeights": [170, 170, 170, 170, 170]}, {"name": "Plasticware", "headerX": 50, "headerY": 2055, "headerW": 970, "boxes": [[65, 2150, 200, 250], [295, 2150, 200, 250], [515, 2150, 200, 250], [730, 2150, 200, 250], [940, 2150, 200, 250]], "photoHeights": [135, 135, 135, 135, 135]}, {"name": "Storage Units", "headerX": 1220, "headerY": 175, "headerW": 970, "boxes": [[1220, 280, 200, 350], [1440, 280, 200, 350], [1665, 280, 200, 350], [1880, 280, 200, 350], [2090, 280, 200, 350]], "photoHeights": [190, 190, 190, 190, 190]}, {"name": "Houseware", "headerX": 1220, "headerY": 685, "headerW": 970, "boxes": [[1220, 785, 200, 350], [1440, 785, 200, 350], [1665, 785, 200, 350], [1880, 785, 200, 350], [2090, 785, 200, 350]], "photoHeights": [200, 200, 200, 200, 200]}, {"name": "Kitchenware & Tableware", "headerX": 1220, "headerY": 1195, "headerW": 970, "boxes": [[1220, 1295, 200, 290], [1440, 1295, 200, 290], [1665, 1295, 200, 290], [1880, 1295, 200, 290], [2090, 1295, 200, 290]], "photoHeights": [150, 150, 150, 150, 150]}, {"name": "Electric Fan", "headerX": 1220, "headerY": 1625, "headerW": 970, "boxes": [[1220, 1720, 200, 290], [1440, 1720, 200, 290], [1665, 1720, 200, 290], [1880, 1720, 200, 290], [2090, 1720, 200, 290]], "photoHeights": [170, 170, 170, 170, 170]}, {"name": "Plasticware", "headerX": 1220, "headerY": 2055, "headerW": 970, "boxes": [[1220, 2150, 200, 250], [1440, 2150, 200, 250], [1665, 2150, 200, 250], [1880, 2150, 200, 250], [2090, 2150, 200, 250]], "photoHeights": [135, 135, 135, 135, 135]}].map((group,index)=>({...group,items:carmenV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let carmenV2BackArtwork=null;
function carmenV2BackState(){
 if(!state.carmenV2Back)state.carmenV2Back={slots:carmenV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.carmenV2Back.groupNames))state.carmenV2Back.groupNames=carmenV2BackGroups.map(g=>g.name);
 return state.carmenV2Back;
}

function seedCarmenV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of carmenV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 carmenV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[CARMEN_V2_BACK_ID] ||= 'Template #2 - ALKEIA CARMEN - BACK';
 if(!state.templateSettings[CARMEN_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[CARMEN_V2_BACK_ID]={poster:{...defaults.poster,store:'ALKEIA CARMEN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function carmenV2BackCard(index){
 const slots=carmenV2BackState().slots,slot=slots[index],group=carmenV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function carmenV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!carmenV2BackArtwork)carmenV2BackArtwork=await loadCanvasImage(CARMEN_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(carmenV2BackArtwork,0,0,3508,2480);
 const slots=carmenV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 carmenV2BackGroups.forEach((group,groupIndex)=>{
  drawCarmenV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=carmenV2BackCard(index),large=false;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===carmenV2BackSeeds[index]?.name){
     const seed=carmenV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(carmenV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function carmenV2BackLabel(index){return carmenV2BackState().groupNames[index]?.trim()||carmenV2BackGroups[index].name}
function drawCarmenV2BackHeader(ctx,group,index){
 if(carmenV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#b00000';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(carmenV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncCarmenV2BackControls(){
 let panel=$('carmenV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='carmenV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  carmenV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='carmenV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{carmenV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{carmenV2BackState().groupNames=carmenV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==CARMEN_V2_BACK_ID;
 if(!panel.hidden)carmenV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('carmenV2BackLabel-'+index);if(document.activeElement!==input)input.value=carmenV2BackState().groupNames[index]??group.name});
}
