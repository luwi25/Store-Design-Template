// Editable product cards over the supplied Ginsey Sibonga artwork.
const SIBONGA_V2_BACK_ID='ginsey-sibonga-v2-back';
const SIBONGA_V2_BACK_ART=__SIBONGA_V2_BACK_ART__;
const sibongaV2BackSeeds=__SIBONGA_V2_BACK_SEEDS__;
const sibongaV2BackGroups=[{"name": "Storage Units", "headerX": 40, "headerY": 610, "headerW": 700, "boxes": [[55, 710, 200, 320], [285, 710, 200, 320], [510, 710, 200, 320], [735, 710, 200, 320], [945, 710, 200, 320]], "photoHeights": [165, 165, 165, 165, 165]}, {"name": "Houseware", "headerX": 40, "headerY": 1095, "headerW": 700, "boxes": [[55, 1190, 200, 290], [285, 1190, 200, 290], [510, 1190, 200, 290], [735, 1190, 200, 290], [945, 1190, 200, 290]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Kitchenware & Tableware", "headerX": 40, "headerY": 1540, "headerW": 1010, "boxes": [[55, 1640, 200, 260], [285, 1640, 200, 260], [510, 1640, 200, 260], [735, 1640, 200, 260], [945, 1640, 200, 260]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Plasticware", "headerX": 40, "headerY": 1960, "headerW": 700, "boxes": [[55, 2050, 200, 265], [285, 2050, 200, 265], [510, 2050, 200, 265], [735, 2050, 200, 265], [945, 2050, 200, 265]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Electric Fan", "headerX": 1270, "headerY": 170, "headerW": 910, "headerH": 110, "boxes": [[1215, 335, 330, 560], [1590, 335, 330, 560], [1960, 335, 335, 560], [1270, 950, 460, 450], [1780, 950, 460, 450]], "photoHeights": [380, 380, 380, 300, 300]}, {"name": "Cookware, Kitchenware & More", "headerX": 1220, "headerY": 1470, "headerW": 1060, "headerH": 120, "boxes": [[1220, 1640, 335, 320], [1590, 1640, 335, 320], [1960, 1640, 335, 320], [1280, 2015, 460, 345], [1780, 2015, 460, 345]], "photoHeights": [180, 180, 180, 210, 210]}].map((group,index)=>({...group,items:sibongaV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let sibongaV2BackArtwork=null;
function sibongaV2BackState(){
 if(!state.sibongaV2Back)state.sibongaV2Back={slots:sibongaV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.sibongaV2Back.groupNames))state.sibongaV2Back.groupNames=sibongaV2BackGroups.map(g=>g.name);
 return state.sibongaV2Back;
}

function seedSibongaV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of sibongaV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 sibongaV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[SIBONGA_V2_BACK_ID] ||= 'Template #2 - GINSEY SIBONGA - BACK';
 if(!state.templateSettings[SIBONGA_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[SIBONGA_V2_BACK_ID]={poster:{...defaults.poster,store:'GINSEY SIBONGA',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function sibongaV2BackCard(index){
 const slots=sibongaV2BackState().slots,slot=slots[index],group=sibongaV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function sibongaV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!sibongaV2BackArtwork)sibongaV2BackArtwork=await loadCanvasImage(SIBONGA_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(sibongaV2BackArtwork,0,0,3508,2480);
 const slots=sibongaV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 sibongaV2BackGroups.forEach((group,groupIndex)=>{
  drawSibongaV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=sibongaV2BackCard(index),large=groupIndex>=4;
   const seed=sibongaV2BackSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===sibongaV2BackSeeds[index]?.name){
     const seed=sibongaV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(sibongaV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function sibongaV2BackLabel(index){return sibongaV2BackState().groupNames[index]?.trim()||sibongaV2BackGroups[index].name}
function drawSibongaV2BackHeader(ctx,group,index){
 if(sibongaV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle=(index%2===0?'#c60014':'#003395');roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(sibongaV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncSibongaV2BackControls(){
 let panel=$('sibongaV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='sibongaV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  sibongaV2BackGroups.slice(0,6).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='sibongaV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{sibongaV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{sibongaV2BackState().groupNames=sibongaV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==SIBONGA_V2_BACK_ID;
 if(!panel.hidden)sibongaV2BackGroups.slice(0,6).forEach((group,index)=>{const input=$('sibongaV2BackLabel-'+index);if(document.activeElement!==input)input.value=sibongaV2BackState().groupNames[index]??group.name});
}
