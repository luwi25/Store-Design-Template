// Editable product cards over the supplied Unico Pinamungajan artwork.
const PINAM_V2_BACK_ID='unico-pinamungajan-v2-back';
const PINAM_V2_BACK_ART=__PINAM_V2_BACK_ART__;
const pinamV2BackSeeds=__PINAM_V2_BACK_SEEDS__;
const pinamV2BackGroups=[{"name": "Storage Units", "headerX": 40, "headerY": 620, "headerW": 900, "boxes": [[50, 710, 200, 315], [280, 710, 200, 315], [505, 710, 200, 315], [725, 710, 200, 315], [945, 710, 200, 315]], "photoHeights": [165, 165, 165, 165, 165]}, {"name": "Houseware", "headerX": 40, "headerY": 1070, "headerW": 900, "boxes": [[50, 1155, 200, 290], [280, 1155, 200, 290], [505, 1155, 200, 290], [725, 1155, 200, 290], [945, 1155, 200, 290]], "photoHeights": [165, 165, 165, 165, 165]}, {"name": "Kitchenware & Tableware", "headerX": 40, "headerY": 1485, "headerW": 900, "boxes": [[50, 1570, 200, 270], [280, 1570, 200, 270], [505, 1570, 200, 270], [725, 1570, 200, 270], [945, 1570, 200, 270]], "photoHeights": [135, 135, 135, 135, 135]}, {"name": "Electric Fan", "headerX": 40, "headerY": 1880, "headerW": 900, "boxes": [[50, 1955, 200, 235], [280, 1955, 200, 235], [505, 1955, 200, 235], [725, 1955, 200, 235], [945, 1955, 200, 235]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Plasticware", "headerX": 40, "headerY": 2225, "headerW": 900, "boxes": [[50, 2290, 200, 165], [280, 2290, 200, 165], [505, 2290, 200, 165], [725, 2290, 200, 165], [945, 2290, 200, 165]], "photoHeights": [75, 75, 75, 75, 75]}, {"name": "Storage Units", "headerX": 1200, "headerY": 415, "headerW": 900, "boxes": [[1195, 505, 200, 330], [1420, 505, 200, 330], [1645, 505, 200, 330], [1870, 505, 200, 330], [2095, 505, 200, 330]], "photoHeights": [185, 185, 185, 185, 185]}, {"name": "Houseware", "headerX": 1200, "headerY": 880, "headerW": 900, "boxes": [[1195, 965, 200, 320], [1420, 965, 200, 320], [1645, 965, 200, 320], [1870, 965, 200, 320], [2095, 965, 200, 320]], "photoHeights": [165, 165, 165, 165, 165]}, {"name": "Kitchenware & Tableware", "headerX": 1200, "headerY": 1330, "headerW": 900, "boxes": [[1195, 1420, 200, 265], [1420, 1420, 200, 265], [1645, 1420, 200, 265], [1870, 1420, 200, 265], [2095, 1420, 200, 265]], "photoHeights": [120, 120, 120, 120, 120]}, {"name": "Electric Fan", "headerX": 1200, "headerY": 1720, "headerW": 900, "boxes": [[1195, 1805, 200, 275], [1420, 1805, 200, 275], [1645, 1805, 200, 275], [1870, 1805, 200, 275], [2095, 1805, 200, 275]], "photoHeights": [135, 135, 135, 135, 135]}, {"name": "Plasticware", "headerX": 1200, "headerY": 2120, "headerW": 900, "boxes": [[1195, 2200, 200, 250], [1420, 2200, 200, 250], [1645, 2200, 200, 250], [1870, 2200, 200, 250], [2095, 2200, 200, 250]], "photoHeights": [110, 110, 110, 110, 110]}].map((group,index)=>({...group,items:pinamV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let pinamV2BackArtwork=null;
function pinamV2BackState(){
 if(!state.pinamV2Back)state.pinamV2Back={slots:pinamV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.pinamV2Back.groupNames))state.pinamV2Back.groupNames=pinamV2BackGroups.map(g=>g.name);
 return state.pinamV2Back;
}

function seedPinamV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of pinamV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 pinamV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[PINAM_V2_BACK_ID] ||= 'Template #2 - UNICO PINAMUNGAJAN - BACK';
 if(!state.templateSettings[PINAM_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[PINAM_V2_BACK_ID]={poster:{...defaults.poster,store:'UNICO PINAMUNGAJAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function pinamV2BackCard(index){
 const slots=pinamV2BackState().slots,slot=slots[index],group=pinamV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function pinamV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!pinamV2BackArtwork)pinamV2BackArtwork=await loadCanvasImage(PINAM_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(pinamV2BackArtwork,0,0,3508,2480);
 const slots=pinamV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 pinamV2BackGroups.forEach((group,groupIndex)=>{
  drawPinamV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=pinamV2BackCard(index),large=false;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:b.h<200?22:26)*textScale('name',slot));
    const priceSize=(large?60:b.h<200?32:43)*textScale('sale',slot),priceBaseline=b.y+b.h-(b.h<200?18:30);
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===pinamV2BackSeeds[index]?.name){
     const seed=pinamV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(pinamV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function pinamV2BackLabel(index){return pinamV2BackState().groupNames[index]?.trim()||pinamV2BackGroups[index].name}
function drawPinamV2BackHeader(ctx,group,index){
 if(pinamV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#b00000';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(pinamV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncPinamV2BackControls(){
 let panel=$('pinamV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='pinamV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  pinamV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='pinamV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{pinamV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{pinamV2BackState().groupNames=pinamV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==PINAM_V2_BACK_ID;
 if(!panel.hidden)pinamV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('pinamV2BackLabel-'+index);if(document.activeElement!==input)input.value=pinamV2BackState().groupNames[index]??group.name});
}
