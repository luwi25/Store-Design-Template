// Editable product cards over the supplied Weldon Carcar artwork.
const CARCAR_V2_BACK_ID='weldon-carcar-v2-back';
const CARCAR_V2_BACK_ART=__CARCAR_V2_BACK_ART__;
const carcarV2BackSeeds=__CARCAR_V2_BACK_SEEDS__;
const carcarV2BackGroups=[{"name": "Storage Units", "headerX": 220, "headerY": 725, "headerW": 530, "boxes": [[60, 825, 195, 220], [285, 825, 195, 220], [500, 825, 195, 220], [710, 825, 195, 220], [925, 825, 195, 220]], "photoHeights": [120, 120, 120, 120, 120]}, {"name": "Houseware", "headerX": 220, "headerY": 1095, "headerW": 530, "boxes": [[60, 1190, 195, 220], [285, 1190, 195, 220], [500, 1190, 195, 220], [710, 1190, 195, 220], [925, 1190, 195, 220]], "photoHeights": [120, 120, 120, 120, 120]}, {"name": "Kitchenware & Tableware", "headerX": 220, "headerY": 1460, "headerW": 780, "boxes": [[60, 1555, 195, 220], [285, 1555, 195, 220], [500, 1555, 195, 220], [710, 1555, 195, 220], [925, 1555, 195, 220]], "photoHeights": [120, 120, 120, 120, 120]}, {"name": "Plasticware", "headerX": 220, "headerY": 1830, "headerW": 530, "boxes": [[60, 1935, 195, 220], [285, 1935, 195, 220], [500, 1935, 195, 220], [710, 1935, 195, 220], [925, 1935, 195, 220]], "photoHeights": [120, 120, 120, 120, 120]}, {"name": "Storage Units", "headerX": 1390, "headerY": 725, "headerW": 530, "boxes": [[1230, 825, 195, 220], [1450, 825, 195, 220], [1670, 825, 195, 220], [1880, 825, 195, 220], [2090, 825, 195, 220]], "photoHeights": [120, 120, 120, 120, 120]}, {"name": "Houseware", "headerX": 1390, "headerY": 1095, "headerW": 530, "boxes": [[1230, 1190, 195, 220], [1450, 1190, 195, 220], [1670, 1190, 195, 220], [1880, 1190, 195, 220], [2090, 1190, 195, 220]], "photoHeights": [120, 120, 120, 120, 120]}, {"name": "Kitchenware & Tableware", "headerX": 1390, "headerY": 1460, "headerW": 780, "boxes": [[1230, 1555, 195, 220], [1450, 1555, 195, 220], [1670, 1555, 195, 220], [1880, 1555, 195, 220], [2090, 1555, 195, 220]], "photoHeights": [120, 120, 120, 120, 120]}, {"name": "Plasticware", "headerX": 1390, "headerY": 1830, "headerW": 530, "boxes": [[1230, 1935, 195, 220], [1450, 1935, 195, 220], [1670, 1935, 195, 220], [1880, 1935, 195, 220], [2090, 1935, 195, 220]], "photoHeights": [120, 120, 120, 120, 120]}].map((group,index)=>({...group,items:carcarV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let carcarV2BackArtwork=null;
function carcarV2BackState(){
 if(!state.carcarV2Back)state.carcarV2Back={slots:carcarV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.carcarV2Back.groupNames))state.carcarV2Back.groupNames=carcarV2BackGroups.map(g=>g.name);
 return state.carcarV2Back;
}

function seedCarcarV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of carcarV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 carcarV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[CARCAR_V2_BACK_ID] ||= 'Template #2 - WELDON CARCAR - BACK';
 if(!state.templateSettings[CARCAR_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[CARCAR_V2_BACK_ID]={poster:{...defaults.poster,store:'WELDON CARCAR',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function carcarV2BackCard(index){
 const slots=carcarV2BackState().slots,slot=slots[index],group=carcarV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function carcarV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!carcarV2BackArtwork)carcarV2BackArtwork=await loadCanvasImage(CARCAR_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(carcarV2BackArtwork,0,0,3508,2480);
 const slots=carcarV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 carcarV2BackGroups.forEach((group,groupIndex)=>{
  drawCarcarV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=carcarV2BackCard(index),large=false;
   const seed=carcarV2BackSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===carcarV2BackSeeds[index]?.name){
     const seed=carcarV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(carcarV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
    }
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.fillStyle='#d00000';ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#d00000';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b10.00',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function carcarV2BackLabel(index){return carcarV2BackState().groupNames[index]?.trim()||carcarV2BackGroups[index].name}
function drawCarcarV2BackHeader(ctx,group,index){
 if(carcarV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#a60000';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(carcarV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncCarcarV2BackControls(){
 let panel=$('carcarV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='carcarV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  carcarV2BackGroups.slice(0,8).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='carcarV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{carcarV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{carcarV2BackState().groupNames=carcarV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==CARCAR_V2_BACK_ID;
 if(!panel.hidden)carcarV2BackGroups.slice(0,8).forEach((group,index)=>{const input=$('carcarV2BackLabel-'+index);if(document.activeElement!==input)input.value=carcarV2BackState().groupNames[index]??group.name});
}
