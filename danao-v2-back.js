// Editable product cards over the supplied UBest Danao artwork.
const DANAO_V2_BACK_ID='ubest-danao-v2-back';
const DANAO_V2_BACK_ART=__DANAO_V2_BACK_ART__;
const danaoV2BackSeeds=__DANAO_V2_BACK_SEEDS__;
const danaoV2BackGroups=[{"name": "Storage Units", "headerX": 50, "headerY": 570, "headerW": 680, "boxes": [[38, 660, 222, 300], [274, 660, 205, 300], [495, 660, 213, 300], [716, 660, 215, 300], [938, 660, 204, 300]], "photoHeights": [150, 150, 150, 150, 150]}, {"name": "Houseware", "headerX": 50, "headerY": 995, "headerW": 680, "boxes": [[38, 1085, 222, 280], [274, 1085, 205, 280], [495, 1085, 213, 280], [716, 1085, 215, 280], [938, 1085, 204, 280]], "photoHeights": [150, 150, 150, 150, 150]}, {"name": "Kitchenware & Tableware", "headerX": 50, "headerY": 1400, "headerW": 970, "boxes": [[38, 1485, 222, 275], [274, 1485, 205, 275], [495, 1485, 213, 275], [716, 1485, 215, 275], [938, 1485, 204, 275]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Electric Fan", "headerX": 50, "headerY": 1795, "headerW": 680, "boxes": [[38, 1875, 222, 225], [274, 1875, 205, 225], [495, 1875, 213, 225], [716, 1875, 215, 225], [938, 1875, 204, 225]], "photoHeights": [125, 125, 125, 125, 125]}, {"name": "Plasticware", "headerX": 50, "headerY": 2130, "headerW": 680, "boxes": [[38, 2205, 222, 230], [274, 2205, 205, 230], [495, 2205, 213, 230], [716, 2205, 215, 230], [938, 2205, 204, 230]], "photoHeights": [112, 112, 112, 112, 112]}, {"name": "Storage Units", "headerX": 1220, "headerY": 385, "headerW": 680, "boxes": [[1208, 470, 215, 340], [1440, 470, 205, 340], [1660, 470, 210, 340], [1883, 470, 205, 340], [2095, 470, 205, 340]], "photoHeights": [190, 190, 190, 190, 190]}, {"name": "Houseware", "headerX": 1220, "headerY": 855, "headerW": 680, "boxes": [[1208, 945, 215, 305], [1440, 945, 205, 305], [1660, 945, 210, 305], [1883, 945, 205, 305], [2095, 945, 205, 305]], "photoHeights": [170, 170, 170, 170, 170]}, {"name": "Kitchenware & Tableware", "headerX": 1220, "headerY": 1300, "headerW": 970, "boxes": [[1208, 1385, 215, 260], [1440, 1385, 205, 260], [1660, 1385, 210, 260], [1883, 1385, 205, 260], [2095, 1385, 205, 260]], "photoHeights": [135, 135, 135, 135, 135]}, {"name": "Electric Fan", "headerX": 1220, "headerY": 1695, "headerW": 680, "boxes": [[1208, 1770, 215, 280], [1440, 1770, 205, 280], [1660, 1770, 210, 280], [1883, 1770, 205, 280], [2095, 1770, 205, 280]], "photoHeights": [165, 165, 165, 165, 165]}, {"name": "Plasticware", "headerX": 1220, "headerY": 2090, "headerW": 680, "boxes": [[1208, 2170, 215, 260], [1440, 2170, 205, 260], [1660, 2170, 210, 260], [1883, 2170, 205, 260], [2095, 2170, 205, 260]], "photoHeights": [128, 128, 128, 128, 128]}].map((group,index)=>({...group,items:danaoV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let danaoV2BackArtwork=null;
function danaoV2BackState(){
 if(!state.danaoV2Back)state.danaoV2Back={slots:danaoV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.danaoV2Back.groupNames))state.danaoV2Back.groupNames=danaoV2BackGroups.map(g=>g.name);
 return state.danaoV2Back;
}

function seedDanaoV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of danaoV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 danaoV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[DANAO_V2_BACK_ID] ||= 'Template #2 - UBEST DANAO - BACK';
 if(!state.templateSettings[DANAO_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[DANAO_V2_BACK_ID]={poster:{...defaults.poster,store:'UBEST DANAO',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function danaoV2BackCard(index){
 const slots=danaoV2BackState().slots,slot=slots[index],group=danaoV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function danaoV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!danaoV2BackArtwork)danaoV2BackArtwork=await loadCanvasImage(DANAO_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(danaoV2BackArtwork,0,0,3508,2480);
 // Store hours correction shared by the preview and all print/export sizes.
 ctx.save();
 ctx.fillStyle='#f5f7f6';ctx.fillRect(2538,2238,460,58);
 ctx.fillStyle='#080808';ctx.font='800 44px Outfit, Arial, sans-serif';
 ctx.textAlign='left';ctx.textBaseline='alphabetic';
 ctx.fillText('8:30 AM - 8:00 PM',2542,2280,450);
 ctx.restore();
 const slots=danaoV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 danaoV2BackGroups.forEach((group,groupIndex)=>{
  drawDanaoV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=danaoV2BackCard(index),large=false;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===danaoV2BackSeeds[index]?.name){
     const seed=danaoV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(danaoV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
    }
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.fillStyle='#ef5900';roundRect(ctx,b.x+12,priceBaseline-priceSize+2,b.w-24,priceSize+10,24);ctx.fill();ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#fff';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b10.00',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function danaoV2BackLabel(index){return danaoV2BackState().groupNames[index]?.trim()||danaoV2BackGroups[index].name}
function drawDanaoV2BackHeader(ctx,group,index){
 if(danaoV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#003b85';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(danaoV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncDanaoV2BackControls(){
 let panel=$('danaoV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='danaoV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  danaoV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='danaoV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{danaoV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{danaoV2BackState().groupNames=danaoV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==DANAO_V2_BACK_ID;
 if(!panel.hidden)danaoV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('danaoV2BackLabel-'+index);if(document.activeElement!==input)input.value=danaoV2BackState().groupNames[index]??group.name});
}
