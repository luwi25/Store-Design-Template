// Editable product cards over the supplied Weldon Bogo artwork.
const BOGO_V2_BACK_ID='weldon-bogo-v2-back';
const BOGO_V2_BACK_ART=__BOGO_V2_BACK_ART__;
const bogoV2BackSeeds=__BOGO_V2_BACK_SEEDS__;
const bogoV2BackGroups=[{"name": "Storage Units", "headerX": 60, "headerY": 530, "headerW": 720, "boxes": [[50, 620, 195, 280], [280, 620, 195, 280], [505, 620, 195, 280], [735, 620, 195, 280], [955, 620, 195, 280]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Houseware", "headerX": 60, "headerY": 945, "headerW": 720, "boxes": [[50, 1040, 195, 265], [280, 1040, 195, 265], [505, 1040, 195, 265], [735, 1040, 195, 265], [955, 1040, 195, 265]], "photoHeights": [135, 135, 135, 135, 135]}, {"name": "Kitchenware & Tableware", "headerX": 60, "headerY": 1350, "headerW": 1000, "boxes": [[50, 1440, 195, 255], [280, 1440, 195, 255], [505, 1440, 195, 255], [735, 1440, 195, 255], [955, 1440, 195, 255]], "photoHeights": [125, 125, 125, 125, 125]}, {"name": "Electric Fan", "headerX": 60, "headerY": 1735, "headerW": 720, "boxes": [[50, 1820, 195, 235], [280, 1820, 195, 235], [505, 1820, 195, 235], [735, 1820, 195, 235], [955, 1820, 195, 235]], "photoHeights": [120, 120, 120, 120, 120]}, {"name": "Plasticware", "headerX": 60, "headerY": 2095, "headerW": 720, "boxes": [[50, 2180, 195, 220], [280, 2180, 195, 220], [505, 2180, 195, 220], [735, 2180, 195, 220], [955, 2180, 195, 220]], "photoHeights": [100, 100, 100, 100, 100]}, {"name": "Electric Fan", "headerX": 1230, "headerY": 360, "headerW": 1000, "boxes": [[1205, 450, 195, 295], [1430, 450, 195, 295], [1655, 450, 195, 295], [1880, 450, 195, 295], [2105, 450, 195, 295]], "photoHeights": [160, 160, 160, 160, 160]}, {"name": "Storage Units", "headerX": 1230, "headerY": 790, "headerW": 1000, "boxes": [[1205, 880, 195, 270], [1430, 880, 195, 270], [1655, 880, 195, 270], [1880, 880, 195, 270], [2105, 880, 195, 270]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Houseware", "headerX": 1230, "headerY": 1200, "headerW": 1000, "boxes": [[1205, 1285, 195, 255], [1430, 1285, 195, 255], [1655, 1285, 195, 255], [1880, 1285, 195, 255], [2105, 1285, 195, 255]], "photoHeights": [120, 120, 120, 120, 120]}, {"name": "Kitchenware & Tableware", "headerX": 1230, "headerY": 1590, "headerW": 1000, "boxes": [[1205, 1675, 195, 280], [1430, 1675, 195, 280], [1655, 1675, 195, 280], [1880, 1675, 195, 280], [2105, 1675, 195, 280]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Plasticware", "headerX": 1230, "headerY": 2005, "headerW": 1000, "boxes": [[1205, 2100, 195, 270], [1430, 2100, 195, 270], [1655, 2100, 195, 270], [1880, 2100, 195, 270], [2105, 2100, 195, 270]], "photoHeights": [140, 140, 140, 140, 140]}].map((group,index)=>({...group,items:bogoV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let bogoV2BackArtwork=null;
function bogoV2BackState(){
 if(!state.bogoV2Back)state.bogoV2Back={slots:bogoV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.bogoV2Back.groupNames))state.bogoV2Back.groupNames=bogoV2BackGroups.map(g=>g.name);
 return state.bogoV2Back;
}

function seedBogoV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of bogoV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 bogoV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[BOGO_V2_BACK_ID] ||= 'Template #2 - WELDON BOGO - BACK';
 if(!state.templateSettings[BOGO_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[BOGO_V2_BACK_ID]={poster:{...defaults.poster,store:'WELDON BOGO',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function bogoV2BackCard(index){
 const slots=bogoV2BackState().slots,slot=slots[index],group=bogoV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function bogoV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!bogoV2BackArtwork)bogoV2BackArtwork=await loadCanvasImage(BOGO_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(bogoV2BackArtwork,0,0,3508,2480);
 const slots=bogoV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 bogoV2BackGroups.forEach((group,groupIndex)=>{
  drawBogoV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=bogoV2BackCard(index),large=false;
   const seed=bogoV2BackSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===bogoV2BackSeeds[index]?.name){
     const seed=bogoV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(bogoV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function bogoV2BackLabel(index){return bogoV2BackState().groupNames[index]?.trim()||bogoV2BackGroups[index].name}
function drawBogoV2BackHeader(ctx,group,index){
 if(bogoV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#b00013';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(bogoV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncBogoV2BackControls(){
 let panel=$('bogoV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='bogoV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  bogoV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='bogoV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{bogoV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{bogoV2BackState().groupNames=bogoV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==BOGO_V2_BACK_ID;
 if(!panel.hidden)bogoV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('bogoV2BackLabel-'+index);if(document.activeElement!==input)input.value=bogoV2BackState().groupNames[index]??group.name});
}
