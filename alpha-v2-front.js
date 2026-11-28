// Editable product cards over the supplied Alpha Dumanjug artwork.
const ALPHA_V2_FRONT_ID='alpha-dumanjug-v2-front';
const ALPHA_V2_FRONT_ART=__ALPHA_V2_FRONT_ART__;
const alphaV2FrontSeeds=__ALPHA_V2_FRONT_SEEDS__;
const alphaV2FrontGroups=[{"name": "Storage Units", "headerX": 70, "headerY": 400, "headerW": 670, "boxes": [[70, 495, 185, 300], [300, 495, 185, 300], [520, 495, 185, 300], [740, 495, 185, 300], [950, 495, 185, 300]], "photoHeights": [150, 150, 150, 150, 150]}, {"name": "Houseware", "headerX": 70, "headerY": 850, "headerW": 670, "boxes": [[70, 945, 185, 295], [300, 945, 185, 295], [520, 945, 185, 295], [740, 945, 185, 295], [950, 945, 185, 295]], "photoHeights": [155, 155, 155, 155, 155]}, {"name": "Kitchenware & Tableware", "headerX": 70, "headerY": 1290, "headerW": 930, "boxes": [[70, 1385, 185, 260], [300, 1385, 185, 260], [520, 1385, 185, 260], [740, 1385, 185, 260], [950, 1385, 185, 260]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Electric Fan", "headerX": 70, "headerY": 1690, "headerW": 670, "boxes": [[70, 1780, 185, 260], [300, 1780, 185, 260], [520, 1780, 185, 260], [740, 1780, 185, 260], [950, 1780, 185, 260]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Plasticware", "headerX": 70, "headerY": 2090, "headerW": 670, "boxes": [[70, 2175, 185, 225], [300, 2175, 185, 225], [520, 2175, 185, 225], [740, 2175, 185, 225], [950, 2175, 185, 225]], "photoHeights": [115, 115, 115, 115, 115]}, {"name": "Electric Fan", "headerX": 1280, "headerY": 430, "headerW": 900, "headerH": 80, "boxes": [[1220, 550, 325, 445], [1590, 550, 325, 445], [1955, 550, 320, 445], [1230, 1040, 490, 405], [1765, 1040, 500, 405]], "photoHeights": [285, 285, 285, 255, 255]}, {"name": "Cookware, Kitchenware & More!", "headerX": 1240, "headerY": 1530, "headerW": 1000, "headerH": 130, "boxes": [[1215, 1695, 340, 320], [1590, 1695, 330, 320], [1955, 1695, 325, 320], [1260, 2050, 460, 340], [1760, 2050, 465, 340]], "photoHeights": [190, 190, 190, 205, 205]}].map((group,index)=>({...group,items:alphaV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let alphaV2FrontArtwork=null;
function alphaV2FrontState(){
 if(!state.alphaV2Front)state.alphaV2Front={slots:alphaV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.alphaV2Front.groupNames))state.alphaV2Front.groupNames=alphaV2FrontGroups.map(g=>g.name);
 return state.alphaV2Front;
}

function seedAlphaV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of alphaV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 alphaV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[ALPHA_V2_FRONT_ID] ||= 'Template #2 - ALPHA DUMANJUG - FRONT';
 if(!state.templateSettings[ALPHA_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[ALPHA_V2_FRONT_ID]={poster:{...defaults.poster,store:'ALPHA DUMANJUG',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function alphaV2FrontCard(index){
 const slots=alphaV2FrontState().slots,slot=slots[index],group=alphaV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function alphaV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!alphaV2FrontArtwork)alphaV2FrontArtwork=await loadCanvasImage(ALPHA_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(alphaV2FrontArtwork,0,0,3508,2480);
 const slots=alphaV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 alphaV2FrontGroups.forEach((group,groupIndex)=>{
  drawAlphaV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=alphaV2FrontCard(index),large=groupIndex>=5;
   const seed=alphaV2FrontSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===alphaV2FrontSeeds[index]?.name){
     const seed=alphaV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(alphaV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function alphaV2FrontLabel(index){return alphaV2FrontState().groupNames[index]?.trim()||alphaV2FrontGroups[index].name}
function drawAlphaV2FrontHeader(ctx,group,index){
 if(alphaV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#a60000';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(alphaV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncAlphaV2FrontControls(){
 let panel=$('alphaV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='alphaV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  alphaV2FrontGroups.slice(0,7).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='alphaV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{alphaV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{alphaV2FrontState().groupNames=alphaV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==ALPHA_V2_FRONT_ID;
 if(!panel.hidden)alphaV2FrontGroups.slice(0,7).forEach((group,index)=>{const input=$('alphaV2FrontLabel-'+index);if(document.activeElement!==input)input.value=alphaV2FrontState().groupNames[index]??group.name});
}
