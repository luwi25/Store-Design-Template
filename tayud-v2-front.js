// Editable product cards over the supplied Alkeia Tayud artwork.
const TAYUD_V2_FRONT_ID='alkeia-tayud-v2-front';
const TAYUD_V2_FRONT_ART=__TAYUD_V2_FRONT_ART__;
const tayudV2FrontSeeds=__TAYUD_V2_FRONT_SEEDS__;
const tayudV2FrontGroups=[{"name": "Storage Units", "headerX": 30, "headerY": 515, "headerW": 1080, "boxes": [[45, 620, 195, 200], [270, 620, 195, 200], [490, 620, 195, 200], [715, 620, 195, 200], [940, 620, 195, 200]], "photoHeights": [115, 115, 115, 115, 115]}, {"name": "Houseware", "headerX": 30, "headerY": 860, "headerW": 1080, "boxes": [[45, 970, 195, 190], [270, 970, 195, 190], [490, 970, 195, 190], [715, 970, 195, 190], [940, 970, 195, 190]], "photoHeights": [110, 110, 110, 110, 110]}, {"name": "Kitchenware & Tableware", "headerX": 30, "headerY": 1200, "headerW": 1080, "boxes": [[45, 1305, 195, 185], [270, 1305, 195, 185], [490, 1305, 195, 185], [715, 1305, 195, 185], [940, 1305, 195, 185]], "photoHeights": [105, 105, 105, 105, 105]}, {"name": "Electric Fan", "headerX": 30, "headerY": 1525, "headerW": 1080, "boxes": [[45, 1625, 195, 185], [270, 1625, 195, 185], [490, 1625, 195, 185], [715, 1625, 195, 185], [940, 1625, 195, 185]], "photoHeights": [105, 105, 105, 105, 105]}, {"name": "Plasticware", "headerX": 30, "headerY": 1840, "headerW": 1080, "boxes": [[45, 1945, 195, 175], [270, 1945, 195, 175], [490, 1945, 195, 175], [715, 1945, 195, 175], [940, 1945, 195, 175]], "photoHeights": [100, 100, 100, 100, 100]}, {"name": "Electric Fan", "headerX": 1250, "headerY": 170, "headerW": 1000, "headerH": 100, "boxes": [[1215, 350, 325, 400], [1590, 350, 325, 400], [1965, 350, 325, 400], [1305, 805, 410, 355], [1780, 805, 415, 355]], "photoHeights": [260, 260, 260, 225, 225]}, {"name": "Plasticware", "headerX": 1250, "headerY": 1240, "headerW": 1000, "headerH": 100, "boxes": [[1215, 1410, 325, 340], [1590, 1410, 325, 340], [1965, 1410, 325, 340], [1310, 1805, 410, 335], [1785, 1805, 410, 335]], "photoHeights": [215, 215, 215, 205, 205]}].map((group,index)=>({...group,items:tayudV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let tayudV2FrontArtwork=null;
function tayudV2FrontState(){
 if(!state.tayudV2Front)state.tayudV2Front={slots:tayudV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.tayudV2Front.groupNames))state.tayudV2Front.groupNames=tayudV2FrontGroups.map(g=>g.name);
 return state.tayudV2Front;
}

function seedTayudV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of tayudV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 tayudV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[TAYUD_V2_FRONT_ID] ||= 'Template #2 - ALKEIA TAYUD - FRONT';
 if(!state.templateSettings[TAYUD_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[TAYUD_V2_FRONT_ID]={poster:{...defaults.poster,store:'ALKEIA TAYUD',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function tayudV2FrontCard(index){
 const slots=tayudV2FrontState().slots,slot=slots[index],group=tayudV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function tayudV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!tayudV2FrontArtwork)tayudV2FrontArtwork=await loadCanvasImage(TAYUD_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(tayudV2FrontArtwork,0,0,3508,2480);
 const slots=tayudV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 tayudV2FrontGroups.forEach((group,groupIndex)=>{
  drawTayudV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=tayudV2FrontCard(index),large=groupIndex>=5;
   const seed=tayudV2FrontSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===tayudV2FrontSeeds[index]?.name){
     const seed=tayudV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(tayudV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function tayudV2FrontLabel(index){return tayudV2FrontState().groupNames[index]?.trim()||tayudV2FrontGroups[index].name}
function drawTayudV2FrontHeader(ctx,group,index){
 if(tayudV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#a60000';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(tayudV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncTayudV2FrontControls(){
 let panel=$('tayudV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='tayudV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  tayudV2FrontGroups.slice(0,7).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='tayudV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{tayudV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{tayudV2FrontState().groupNames=tayudV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==TAYUD_V2_FRONT_ID;
 if(!panel.hidden)tayudV2FrontGroups.slice(0,7).forEach((group,index)=>{const input=$('tayudV2FrontLabel-'+index);if(document.activeElement!==input)input.value=tayudV2FrontState().groupNames[index]??group.name});
}
