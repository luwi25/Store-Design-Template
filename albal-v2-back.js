// Editable product cards over the supplied Alkeia Balamban artwork.
const ALBAL_V2_BACK_ID='alkeia-balamban-v2-back';
const ALBAL_V2_BACK_ART=__ALBAL_V2_BACK_ART__;
const albalV2BackSeeds=__ALBAL_V2_BACK_SEEDS__;
const albalV2BackGroups=[{"name": "Storage Units", "headerX": 45, "headerY": 530, "headerW": 1080, "boxes": [[40, 620, 200, 345], [275, 620, 200, 345], [500, 620, 200, 345], [725, 620, 200, 345], [945, 620, 200, 345]], "photoHeights": [190, 190, 190, 190, 190]}, {"name": "Houseware", "headerX": 45, "headerY": 1000, "headerW": 1080, "boxes": [[40, 1080, 200, 320], [275, 1080, 200, 320], [500, 1080, 200, 320], [725, 1080, 200, 320], [945, 1080, 200, 320]], "photoHeights": [180, 180, 180, 180, 180]}, {"name": "Kitchenware & Tableware", "headerX": 45, "headerY": 1430, "headerW": 1080, "boxes": [[40, 1510, 200, 270], [275, 1510, 200, 270], [500, 1510, 200, 270], [725, 1510, 200, 270], [945, 1510, 200, 270]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Electric Fan", "headerX": 45, "headerY": 1810, "headerW": 1080, "boxes": [[40, 1880, 200, 245], [275, 1880, 200, 245], [500, 1880, 200, 245], [725, 1880, 200, 245], [945, 1880, 200, 245]], "photoHeights": [135, 135, 135, 135, 135]}, {"name": "Plasticware", "headerX": 45, "headerY": 2150, "headerW": 1080, "boxes": [[40, 2220, 200, 215], [275, 2220, 200, 215], [500, 2220, 200, 215], [725, 2220, 200, 215], [945, 2220, 200, 215]], "photoHeights": [110, 110, 110, 110, 110]}, {"name": "Storage Units", "headerX": 1215, "headerY": 530, "headerW": 1080, "boxes": [[1205, 620, 200, 345], [1430, 620, 200, 345], [1660, 620, 200, 345], [1880, 620, 200, 345], [2105, 620, 200, 345]], "photoHeights": [190, 190, 190, 190, 190]}, {"name": "Houseware", "headerX": 1215, "headerY": 1000, "headerW": 1080, "boxes": [[1205, 1080, 200, 320], [1430, 1080, 200, 320], [1660, 1080, 200, 320], [1880, 1080, 200, 320], [2105, 1080, 200, 320]], "photoHeights": [180, 180, 180, 180, 180]}, {"name": "Kitchenware & Tableware", "headerX": 1215, "headerY": 1430, "headerW": 1080, "boxes": [[1205, 1510, 200, 270], [1430, 1510, 200, 270], [1660, 1510, 200, 270], [1880, 1510, 200, 270], [2105, 1510, 200, 270]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Electric Fan", "headerX": 1215, "headerY": 1810, "headerW": 1080, "boxes": [[1205, 1880, 200, 245], [1430, 1880, 200, 245], [1660, 1880, 200, 245], [1880, 1880, 200, 245], [2105, 1880, 200, 245]], "photoHeights": [135, 135, 135, 135, 135]}, {"name": "Plasticware", "headerX": 1215, "headerY": 2150, "headerW": 1080, "boxes": [[1205, 2220, 200, 215], [1430, 2220, 200, 215], [1660, 2220, 200, 215], [1880, 2220, 200, 215], [2105, 2220, 200, 215]], "photoHeights": [110, 110, 110, 110, 110]}].map((group,index)=>({...group,items:albalV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let albalV2BackArtwork=null;
function albalV2BackState(){
 if(!state.albalV2Back)state.albalV2Back={slots:albalV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.albalV2Back.groupNames))state.albalV2Back.groupNames=albalV2BackGroups.map(g=>g.name);
 return state.albalV2Back;
}

function seedAlbalV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of albalV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 albalV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[ALBAL_V2_BACK_ID] ||= 'Template #2 - ALKEIA BALAMBAN - BACK';
 if(!state.templateSettings[ALBAL_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[ALBAL_V2_BACK_ID]={poster:{...defaults.poster,store:'ALKEIA BALAMBAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function albalV2BackCard(index){
 const slots=albalV2BackState().slots,slot=slots[index],group=albalV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function albalV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!albalV2BackArtwork)albalV2BackArtwork=await loadCanvasImage(ALBAL_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(albalV2BackArtwork,0,0,3508,2480);
 const slots=albalV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 albalV2BackGroups.forEach((group,groupIndex)=>{
  drawAlbalV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=albalV2BackCard(index),large=false;
   const seed=albalV2BackSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff8e5';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===albalV2BackSeeds[index]?.name){
     const seed=albalV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(albalV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
    }
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#a60000';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b1 ____',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function albalV2BackLabel(index){return albalV2BackState().groupNames[index]?.trim()||albalV2BackGroups[index].name}
function drawAlbalV2BackHeader(ctx,group,index){
 if(albalV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#b00013';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(albalV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncAlbalV2BackControls(){
 let panel=$('albalV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='albalV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  albalV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='albalV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{albalV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{albalV2BackState().groupNames=albalV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==ALBAL_V2_BACK_ID;
 if(!panel.hidden)albalV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('albalV2BackLabel-'+index);if(document.activeElement!==input)input.value=albalV2BackState().groupNames[index]??group.name});
}
