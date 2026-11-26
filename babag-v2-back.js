// Editable product cards over the supplied Weldon Babag artwork.
const BABAG_V2_BACK_ID='weldon-babag-v2-back';
const BABAG_V2_BACK_ART=__BABAG_V2_BACK_ART__;
const babagV2BackSeeds=__BABAG_V2_BACK_SEEDS__;
const babagV2BackGroups=[{"name": "Storage Units", "headerX": 50, "headerY": 505, "headerW": 970, "boxes": [[40, 590, 220, 275], [275, 590, 220, 275], [495, 590, 220, 275], [720, 590, 220, 275], [940, 590, 220, 275]], "photoHeights": [160, 160, 160, 160, 160]}, {"name": "Houseware", "headerX": 50, "headerY": 903, "headerW": 970, "boxes": [[40, 984, 220, 270], [275, 984, 220, 270], [495, 984, 220, 270], [720, 984, 220, 270], [940, 984, 220, 270]], "photoHeights": [158, 158, 158, 158, 158]}, {"name": "Kitchenware & Tableware", "headerX": 50, "headerY": 1290, "headerW": 970, "boxes": [[40, 1367, 220, 235], [275, 1367, 220, 235], [495, 1367, 220, 235], [720, 1367, 220, 235], [940, 1367, 220, 235]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Electric Fan", "headerX": 50, "headerY": 1638, "headerW": 970, "boxes": [[40, 1712, 220, 245], [275, 1712, 220, 245], [495, 1712, 220, 245], [720, 1712, 220, 245], [940, 1712, 220, 245]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Plasticware", "headerX": 50, "headerY": 1990, "headerW": 970, "boxes": [[40, 2060, 220, 220], [275, 2060, 220, 220], [495, 2060, 220, 220], [720, 2060, 220, 220], [940, 2060, 220, 220]], "photoHeights": [110, 110, 110, 110, 110]}, {"name": "Storage Units", "headerX": 1220, "headerY": 505, "headerW": 970, "boxes": [[1210, 590, 220, 275], [1435, 590, 220, 275], [1655, 590, 220, 275], [1880, 590, 220, 275], [2100, 590, 220, 275]], "photoHeights": [160, 160, 160, 160, 160]}, {"name": "Houseware", "headerX": 1220, "headerY": 903, "headerW": 970, "boxes": [[1210, 984, 220, 270], [1435, 984, 220, 270], [1655, 984, 220, 270], [1880, 984, 220, 270], [2100, 984, 220, 270]], "photoHeights": [158, 158, 158, 158, 158]}, {"name": "Kitchenware & Tableware", "headerX": 1220, "headerY": 1290, "headerW": 970, "boxes": [[1210, 1367, 220, 235], [1435, 1367, 220, 235], [1655, 1367, 220, 235], [1880, 1367, 220, 235], [2100, 1367, 220, 235]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Electric Fan", "headerX": 1220, "headerY": 1638, "headerW": 970, "boxes": [[1210, 1712, 220, 245], [1435, 1712, 220, 245], [1655, 1712, 220, 245], [1880, 1712, 220, 245], [2100, 1712, 220, 245]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Plasticware", "headerX": 1220, "headerY": 1990, "headerW": 970, "boxes": [[1210, 2060, 220, 220], [1435, 2060, 220, 220], [1655, 2060, 220, 220], [1880, 2060, 220, 220], [2100, 2060, 220, 220]], "photoHeights": [110, 110, 110, 110, 110]}].map((group,index)=>({...group,items:babagV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let babagV2BackArtwork=null;
function babagV2BackState(){
 if(!state.babagV2Back)state.babagV2Back={slots:babagV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.babagV2Back.groupNames))state.babagV2Back.groupNames=babagV2BackGroups.map(g=>g.name);
 return state.babagV2Back;
}

function seedBabagV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of babagV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 babagV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[BABAG_V2_BACK_ID] ||= 'Template #2 - WELDON BABAG - BACK';
 if(!state.templateSettings[BABAG_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[BABAG_V2_BACK_ID]={poster:{...defaults.poster,store:'WELDON BABAG',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function babagV2BackCard(index){
 const slots=babagV2BackState().slots,slot=slots[index],group=babagV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function babagV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!babagV2BackArtwork)babagV2BackArtwork=await loadCanvasImage(BABAG_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(babagV2BackArtwork,0,0,3508,2480);
 const slots=babagV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 babagV2BackGroups.forEach((group,groupIndex)=>{
  drawBabagV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=babagV2BackCard(index),large=false;
   ctx.save();roundRect(ctx,b.x-3,b.y-8,b.w+6,b.h+16,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x-3,b.y-8,b.w+6,b.h+16);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:36)*textScale('sale',slot),priceBaseline=b.y+b.h-12;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===babagV2BackSeeds[index]?.name){
     const seed=babagV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(babagV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
    }
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#ff0000';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b10.00',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function babagV2BackLabel(index){return babagV2BackState().groupNames[index]?.trim()||babagV2BackGroups[index].name}
function drawBabagV2BackHeader(ctx,group,index){
 if(babagV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#ffcf00';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#000';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(babagV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncBabagV2BackControls(){
 let panel=$('babagV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='babagV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  babagV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='babagV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{babagV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{babagV2BackState().groupNames=babagV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==BABAG_V2_BACK_ID;
 if(!panel.hidden)babagV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('babagV2BackLabel-'+index);if(document.activeElement!==input)input.value=babagV2BackState().groupNames[index]??group.name});
}
