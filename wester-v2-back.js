// Editable product cards over the supplied Wester Talibon artwork.
const WESTER_V2_BACK_ID='wester-talibon-v2-back';
const WESTER_V2_BACK_ART=__WESTER_V2_BACK_ART__;
const westerV2BackSeeds=__WESTER_V2_BACK_SEEDS__;
const westerV2BackGroups=[{"name": "Storage Units", "headerX": 45, "headerY": 175, "headerW": 530, "boxes": [[50, 280, 195, 360], [280, 280, 195, 360], [505, 280, 195, 360], [725, 280, 195, 360], [945, 280, 195, 360]], "photoHeights": [185, 185, 185, 185, 185]}, {"name": "Houseware", "headerX": 45, "headerY": 690, "headerW": 530, "boxes": [[50, 790, 195, 355], [280, 790, 195, 355], [505, 790, 195, 355], [725, 790, 195, 355], [945, 790, 195, 355]], "photoHeights": [190, 190, 190, 190, 190]}, {"name": "Kitchenware & Tableware", "headerX": 45, "headerY": 1200, "headerW": 850, "boxes": [[50, 1300, 195, 290], [280, 1300, 195, 290], [505, 1300, 195, 290], [725, 1300, 195, 290], [945, 1300, 195, 290]], "photoHeights": [165, 165, 165, 165, 165]}, {"name": "Electric Fan", "headerX": 45, "headerY": 1640, "headerW": 530, "boxes": [[50, 1735, 195, 290], [280, 1735, 195, 290], [505, 1735, 195, 290], [725, 1735, 195, 290], [945, 1735, 195, 290]], "photoHeights": [170, 170, 170, 170, 170]}, {"name": "Plasticware", "headerX": 45, "headerY": 2070, "headerW": 530, "boxes": [[50, 2160, 195, 255], [280, 2160, 195, 255], [505, 2160, 195, 255], [725, 2160, 195, 255], [945, 2160, 195, 255]], "photoHeights": [130, 130, 130, 130, 130]}].map((group,index)=>({...group,items:westerV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let westerV2BackArtwork=null;
function westerV2BackState(){
 if(!state.westerV2Back)state.westerV2Back={slots:westerV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.westerV2Back.groupNames))state.westerV2Back.groupNames=westerV2BackGroups.map(g=>g.name);
 // Retain edits to the left panel when upgrading the previous two-panel design.
 state.westerV2Back.slots=state.westerV2Back.slots.filter(slot=>slot.group<5);
 state.westerV2Back.groupNames=state.westerV2Back.groupNames.slice(0,5);
 return state.westerV2Back;
}

function seedWesterV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of westerV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 westerV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[WESTER_V2_BACK_ID] ||= 'Template #2 - WESTER TALIBON - BACK';
 if(!state.templateSettings[WESTER_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[WESTER_V2_BACK_ID]={poster:{...defaults.poster,store:'WESTER TALIBON',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function westerV2BackCard(index){
 const slots=westerV2BackState().slots,slot=slots[index],group=westerV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function westerV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!westerV2BackArtwork)westerV2BackArtwork=await loadCanvasImage(WESTER_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(westerV2BackArtwork,0,0,3508,2480);
 const slots=westerV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 westerV2BackGroups.forEach((group,groupIndex)=>{
  drawWesterV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=westerV2BackCard(index),large=false;
   const seed=westerV2BackSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===westerV2BackSeeds[index]?.name){
     const seed=westerV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(westerV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
    }
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.fillStyle='#e54700';roundRect(ctx,b.x+12,priceBaseline-priceSize+2,b.w-24,priceSize+10,24);ctx.fill();ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#fff';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b10.00',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function westerV2BackLabel(index){return westerV2BackState().groupNames[index]?.trim()||westerV2BackGroups[index].name}
function drawWesterV2BackHeader(ctx,group,index){
 if(westerV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#dc4200';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(westerV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncWesterV2BackControls(){
 let panel=$('westerV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='westerV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  westerV2BackGroups.slice(0,5).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='westerV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{westerV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{westerV2BackState().groupNames=westerV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==WESTER_V2_BACK_ID;
 if(!panel.hidden)westerV2BackGroups.slice(0,5).forEach((group,index)=>{const input=$('westerV2BackLabel-'+index);if(document.activeElement!==input)input.value=westerV2BackState().groupNames[index]??group.name});
}
