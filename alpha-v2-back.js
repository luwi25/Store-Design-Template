// Editable product cards over the supplied Alpha Dumanjug artwork.
const ALPHA_V2_BACK_ID='alpha-dumanjug-v2-back';
const ALPHA_V2_BACK_ART=__ALPHA_V2_BACK_ART__;
const alphaV2BackSeeds=__ALPHA_V2_BACK_SEEDS__;
const alphaV2BackGroups=[{"name": "Storage Units", "headerX": 70, "headerY": 540, "headerW": 650, "boxes": [[60, 620, 185, 300], [295, 620, 185, 300], [515, 620, 185, 300], [735, 620, 185, 300], [950, 620, 185, 300]], "photoHeights": [155, 155, 155, 155, 155]}, {"name": "Houseware", "headerX": 70, "headerY": 970, "headerW": 650, "boxes": [[60, 1045, 185, 285], [295, 1045, 185, 285], [515, 1045, 185, 285], [735, 1045, 185, 285], [950, 1045, 185, 285]], "photoHeights": [155, 155, 155, 155, 155]}, {"name": "Kitchenware & Tableware", "headerX": 70, "headerY": 1380, "headerW": 920, "boxes": [[60, 1460, 185, 265], [295, 1460, 185, 265], [515, 1460, 185, 265], [735, 1460, 185, 265], [950, 1460, 185, 265]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Electric Fan", "headerX": 70, "headerY": 1770, "headerW": 650, "boxes": [[60, 1840, 185, 250], [295, 1840, 185, 250], [515, 1840, 185, 250], [735, 1840, 185, 250], [950, 1840, 185, 250]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Plasticware", "headerX": 70, "headerY": 2130, "headerW": 650, "boxes": [[60, 2190, 185, 225], [295, 2190, 185, 225], [515, 2190, 185, 225], [735, 2190, 185, 225], [950, 2190, 185, 225]], "photoHeights": [115, 115, 115, 115, 115]}, {"name": "Storage Units", "headerX": 1240, "headerY": 440, "headerW": 650, "boxes": [[1215, 525, 185, 335], [1440, 525, 185, 335], [1665, 525, 185, 335], [1890, 525, 185, 335], [2110, 525, 185, 335]], "photoHeights": [170, 170, 170, 170, 170]}, {"name": "Houseware", "headerX": 1240, "headerY": 910, "headerW": 650, "boxes": [[1215, 985, 185, 325], [1440, 985, 185, 325], [1665, 985, 185, 325], [1890, 985, 185, 325], [2110, 985, 185, 325]], "photoHeights": [175, 175, 175, 175, 175]}, {"name": "Kitchenware & Tableware", "headerX": 1240, "headerY": 1360, "headerW": 920, "boxes": [[1215, 1440, 185, 280], [1440, 1440, 185, 280], [1665, 1440, 185, 280], [1890, 1440, 185, 280], [2110, 1440, 185, 280]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Electric Fan", "headerX": 1240, "headerY": 1770, "headerW": 650, "boxes": [[1215, 1840, 185, 250], [1440, 1840, 185, 250], [1665, 1840, 185, 250], [1890, 1840, 185, 250], [2110, 1840, 185, 250]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Plasticware", "headerX": 1240, "headerY": 2130, "headerW": 650, "boxes": [[1215, 2190, 185, 225], [1440, 2190, 185, 225], [1665, 2190, 185, 225], [1890, 2190, 185, 225], [2110, 2190, 185, 225]], "photoHeights": [115, 115, 115, 115, 115]}].map((group,index)=>({...group,items:alphaV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let alphaV2BackArtwork=null;
function alphaV2BackState(){
 if(!state.alphaV2Back)state.alphaV2Back={slots:alphaV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.alphaV2Back.groupNames))state.alphaV2Back.groupNames=alphaV2BackGroups.map(g=>g.name);
 return state.alphaV2Back;
}

function seedAlphaV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of alphaV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 alphaV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[ALPHA_V2_BACK_ID] ||= 'Template #2 - ALPHA DUMANJUG - BACK';
 if(!state.templateSettings[ALPHA_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[ALPHA_V2_BACK_ID]={poster:{...defaults.poster,store:'ALPHA DUMANJUG',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function alphaV2BackCard(index){
 const slots=alphaV2BackState().slots,slot=slots[index],group=alphaV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function alphaV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!alphaV2BackArtwork)alphaV2BackArtwork=await loadCanvasImage(ALPHA_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(alphaV2BackArtwork,0,0,3508,2480);
 const slots=alphaV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 alphaV2BackGroups.forEach((group,groupIndex)=>{
  drawAlphaV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=alphaV2BackCard(index),large=false;
   const seed=alphaV2BackSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===alphaV2BackSeeds[index]?.name){
     const seed=alphaV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(alphaV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function alphaV2BackLabel(index){return alphaV2BackState().groupNames[index]?.trim()||alphaV2BackGroups[index].name}
function drawAlphaV2BackHeader(ctx,group,index){
 if(alphaV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#a60000';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(alphaV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncAlphaV2BackControls(){
 let panel=$('alphaV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='alphaV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  alphaV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='alphaV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{alphaV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{alphaV2BackState().groupNames=alphaV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==ALPHA_V2_BACK_ID;
 if(!panel.hidden)alphaV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('alphaV2BackLabel-'+index);if(document.activeElement!==input)input.value=alphaV2BackState().groupNames[index]??group.name});
}
