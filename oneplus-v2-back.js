// Editable product cards over the supplied Oneplus Pardo artwork.
const ONEPLUS_V2_BACK_ID='oneplus-pardo-v2-back';
const ONEPLUS_V2_BACK_ART=__ONEPLUS_V2_BACK_ART__;
const oneplusV2BackSeeds=__ONEPLUS_V2_BACK_SEEDS__;
const oneplusV2BackGroups=[{"name": "Storage Units", "headerX": 40, "headerY": 554, "headerW": 680, "boxes": [[43, 643, 210, 260], [282, 643, 193, 260], [501, 643, 193, 260], [722, 643, 198, 260], [950, 643, 183, 260]], "photoHeights": [122, 122, 122, 122, 122]}, {"name": "Houseware", "headerX": 40, "headerY": 937, "headerW": 680, "boxes": [[43, 1024, 210, 254], [282, 1024, 193, 254], [501, 1024, 193, 254], [722, 1024, 198, 254], [950, 1024, 183, 254]], "photoHeights": [120, 120, 120, 120, 120]}, {"name": "Kitchenware & Tableware", "headerX": 40, "headerY": 1310, "headerW": 930, "boxes": [[43, 1396, 210, 235], [282, 1396, 193, 235], [501, 1396, 193, 235], [722, 1396, 198, 235], [950, 1396, 183, 235]], "photoHeights": [112, 112, 112, 112, 112]}, {"name": "Electric Fan", "headerX": 40, "headerY": 1668, "headerW": 680, "boxes": [[43, 1747, 210, 220], [282, 1747, 193, 220], [501, 1747, 193, 220], [722, 1747, 198, 220], [950, 1747, 183, 220]], "photoHeights": [112, 112, 112, 112, 112]}, {"name": "Plasticware", "headerX": 40, "headerY": 1997, "headerW": 680, "boxes": [[43, 2072, 210, 203], [282, 2072, 193, 203], [501, 2072, 193, 203], [722, 2072, 198, 203], [950, 2072, 183, 203]], "photoHeights": [85, 85, 85, 85, 85]}, {"name": "Storage Units", "headerX": 1210, "headerY": 554, "headerW": 680, "boxes": [[1213, 643, 199, 260], [1443, 643, 191, 260], [1665, 643, 191, 260], [1885, 643, 191, 260], [2105, 643, 183, 260]], "photoHeights": [122, 122, 122, 122, 122]}, {"name": "Houseware", "headerX": 1210, "headerY": 937, "headerW": 680, "boxes": [[1213, 1024, 199, 254], [1443, 1024, 191, 254], [1665, 1024, 191, 254], [1885, 1024, 191, 254], [2105, 1024, 183, 254]], "photoHeights": [120, 120, 120, 120, 120]}, {"name": "Kitchenware & Tableware", "headerX": 1210, "headerY": 1310, "headerW": 930, "boxes": [[1213, 1396, 199, 235], [1443, 1396, 191, 235], [1665, 1396, 191, 235], [1885, 1396, 191, 235], [2105, 1396, 183, 235]], "photoHeights": [112, 112, 112, 112, 112]}, {"name": "Electric Fan", "headerX": 1210, "headerY": 1668, "headerW": 680, "boxes": [[1213, 1747, 199, 220], [1443, 1747, 191, 220], [1665, 1747, 191, 220], [1885, 1747, 191, 220], [2105, 1747, 183, 220]], "photoHeights": [112, 112, 112, 112, 112]}, {"name": "Plasticware", "headerX": 1210, "headerY": 1997, "headerW": 680, "boxes": [[1213, 2072, 199, 203], [1443, 2072, 191, 203], [1665, 2072, 191, 203], [1885, 2072, 191, 203], [2105, 2072, 183, 203]], "photoHeights": [85, 85, 85, 85, 85]}].map((group,index)=>({...group,items:oneplusV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let oneplusV2BackArtwork=null;
function oneplusV2BackState(){
 if(!state.oneplusV2Back)state.oneplusV2Back={slots:oneplusV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.oneplusV2Back.groupNames))state.oneplusV2Back.groupNames=oneplusV2BackGroups.map(g=>g.name);
 return state.oneplusV2Back;
}

function seedOneplusV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of oneplusV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 oneplusV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[ONEPLUS_V2_BACK_ID] ||= 'Template #2 - ONEPLUS PARDO - BACK';
 if(!state.templateSettings[ONEPLUS_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[ONEPLUS_V2_BACK_ID]={poster:{...defaults.poster,store:'ONEPLUS PARDO',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function oneplusV2BackCard(index){
 const slots=oneplusV2BackState().slots,slot=slots[index],group=oneplusV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function oneplusV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!oneplusV2BackArtwork)oneplusV2BackArtwork=await loadCanvasImage(ONEPLUS_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(oneplusV2BackArtwork,0,0,3508,2480);
 const slots=oneplusV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 oneplusV2BackGroups.forEach((group,groupIndex)=>{
  drawOneplusV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=oneplusV2BackCard(index),large=false;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===oneplusV2BackSeeds[index]?.name){
     const seed=oneplusV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(oneplusV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function oneplusV2BackLabel(index){return oneplusV2BackState().groupNames[index]?.trim()||oneplusV2BackGroups[index].name}
function drawOneplusV2BackHeader(ctx,group,index){
 if(oneplusV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#b00000';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(oneplusV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncOneplusV2BackControls(){
 let panel=$('oneplusV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='oneplusV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  oneplusV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='oneplusV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{oneplusV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{oneplusV2BackState().groupNames=oneplusV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==ONEPLUS_V2_BACK_ID;
 if(!panel.hidden)oneplusV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('oneplusV2BackLabel-'+index);if(document.activeElement!==input)input.value=oneplusV2BackState().groupNames[index]??group.name});
}
