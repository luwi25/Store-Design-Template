// Editable product cards over the supplied Alkeia Tayud artwork.
const TAYUD_V2_BACK_ID='alkeia-tayud-v2-back';
const TAYUD_V2_BACK_ART=__TAYUD_V2_BACK_ART__;
const tayudV2BackSeeds=__TAYUD_V2_BACK_SEEDS__;
const tayudV2BackGroups=[{"name": "Storage Units", "headerX": 220, "headerY": 610, "headerW": 530, "boxes": [[60, 710, 195, 250], [285, 710, 195, 250], [500, 710, 195, 250], [710, 710, 195, 250], [925, 710, 195, 250]], "photoHeights": [160, 160, 160, 160, 160]}, {"name": "Houseware", "headerX": 220, "headerY": 990, "headerW": 530, "boxes": [[60, 1080, 195, 230], [285, 1080, 195, 230], [500, 1080, 195, 230], [710, 1080, 195, 230], [925, 1080, 195, 230]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Kitchenware & Tableware", "headerX": 220, "headerY": 1340, "headerW": 780, "boxes": [[60, 1425, 195, 215], [285, 1425, 195, 215], [500, 1425, 195, 215], [710, 1425, 195, 215], [925, 1425, 195, 215]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Electric Fan", "headerX": 220, "headerY": 1665, "headerW": 530, "boxes": [[60, 1745, 195, 230], [285, 1745, 195, 230], [500, 1745, 195, 230], [710, 1745, 195, 230], [925, 1745, 195, 230]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Plasticware", "headerX": 220, "headerY": 2005, "headerW": 530, "boxes": [[60, 2080, 195, 195], [285, 2080, 195, 195], [500, 2080, 195, 195], [710, 2080, 195, 195], [925, 2080, 195, 195]], "photoHeights": [105, 105, 105, 105, 105]}, {"name": "Storage Units", "headerX": 1390, "headerY": 610, "headerW": 530, "boxes": [[1230, 710, 195, 250], [1450, 710, 195, 250], [1670, 710, 195, 250], [1880, 710, 195, 250], [2090, 710, 195, 250]], "photoHeights": [160, 160, 160, 160, 160]}, {"name": "Houseware", "headerX": 1390, "headerY": 990, "headerW": 530, "boxes": [[1230, 1080, 195, 230], [1450, 1080, 195, 230], [1670, 1080, 195, 230], [1880, 1080, 195, 230], [2090, 1080, 195, 230]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Kitchenware & Tableware", "headerX": 1390, "headerY": 1340, "headerW": 780, "boxes": [[1230, 1425, 195, 215], [1450, 1425, 195, 215], [1670, 1425, 195, 215], [1880, 1425, 195, 215], [2090, 1425, 195, 215]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Electric Fan", "headerX": 1390, "headerY": 1665, "headerW": 530, "boxes": [[1230, 1745, 195, 230], [1450, 1745, 195, 230], [1670, 1745, 195, 230], [1880, 1745, 195, 230], [2090, 1745, 195, 230]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Plasticware", "headerX": 1390, "headerY": 2005, "headerW": 530, "boxes": [[1230, 2080, 195, 195], [1450, 2080, 195, 195], [1670, 2080, 195, 195], [1880, 2080, 195, 195], [2090, 2080, 195, 195]], "photoHeights": [105, 105, 105, 105, 105]}].map((group,index)=>({...group,items:tayudV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let tayudV2BackArtwork=null;
function tayudV2BackState(){
 if(!state.tayudV2Back)state.tayudV2Back={slots:tayudV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.tayudV2Back.groupNames))state.tayudV2Back.groupNames=tayudV2BackGroups.map(g=>g.name);
 return state.tayudV2Back;
}

function seedTayudV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of tayudV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 tayudV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[TAYUD_V2_BACK_ID] ||= 'Template #2 - ALKEIA TAYUD - BACK';
 if(!state.templateSettings[TAYUD_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[TAYUD_V2_BACK_ID]={poster:{...defaults.poster,store:'ALKEIA TAYUD',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function tayudV2BackCard(index){
 const slots=tayudV2BackState().slots,slot=slots[index],group=tayudV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function tayudV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!tayudV2BackArtwork)tayudV2BackArtwork=await loadCanvasImage(TAYUD_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(tayudV2BackArtwork,0,0,3508,2480);
 const slots=tayudV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 tayudV2BackGroups.forEach((group,groupIndex)=>{
  drawTayudV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=tayudV2BackCard(index),large=false;
   const seed=tayudV2BackSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===tayudV2BackSeeds[index]?.name){
     const seed=tayudV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(tayudV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function tayudV2BackLabel(index){return tayudV2BackState().groupNames[index]?.trim()||tayudV2BackGroups[index].name}
function drawTayudV2BackHeader(ctx,group,index){
 if(tayudV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#a60000';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(tayudV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncTayudV2BackControls(){
 let panel=$('tayudV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='tayudV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  tayudV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='tayudV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{tayudV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{tayudV2BackState().groupNames=tayudV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==TAYUD_V2_BACK_ID;
 if(!panel.hidden)tayudV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('tayudV2BackLabel-'+index);if(document.activeElement!==input)input.value=tayudV2BackState().groupNames[index]??group.name});
}
