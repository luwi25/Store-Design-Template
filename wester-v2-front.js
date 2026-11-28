// Editable product cards over the supplied Wester Talibon artwork.
const WESTER_V2_FRONT_ID='wester-talibon-v2-front';
const WESTER_V2_FRONT_ART=__WESTER_V2_FRONT_ART__;
const westerV2FrontSeeds=__WESTER_V2_FRONT_SEEDS__;
const westerV2FrontGroups=[{"name": "Household Best Deals", "headerX": 1350, "headerY": 185, "headerW": 780, "headerH": 90, "boxes": [[1210, 335, 495, 540], [1755, 335, 540, 540], [1210, 925, 505, 470], [1760, 925, 535, 470], [1210, 1445, 510, 465], [1760, 1445, 535, 465], [1205, 1960, 335, 385], [1585, 1960, 335, 385], [1960, 1960, 335, 385]], "photoHeights": [360, 360, 320, 320, 310, 310, 230, 230, 230]}].map((group,index)=>({...group,items:westerV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let westerV2FrontArtwork=null;
function westerV2FrontState(){
 if(!state.westerV2Front)state.westerV2Front={slots:westerV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.westerV2Front.groupNames))state.westerV2Front.groupNames=westerV2FrontGroups.map(g=>g.name);
 return state.westerV2Front;
}

function seedWesterV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of westerV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 westerV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[WESTER_V2_FRONT_ID] ||= 'Template #2 - WESTER TALIBON - FRONT';
 if(!state.templateSettings[WESTER_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[WESTER_V2_FRONT_ID]={poster:{...defaults.poster,store:'WESTER TALIBON',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function westerV2FrontCard(index){
 const slots=westerV2FrontState().slots,slot=slots[index],group=westerV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function westerV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!westerV2FrontArtwork)westerV2FrontArtwork=await loadCanvasImage(WESTER_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(westerV2FrontArtwork,0,0,3508,2480);
 const slots=westerV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 westerV2FrontGroups.forEach((group,groupIndex)=>{
  drawWesterV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=westerV2FrontCard(index),large=true;
   const seed=westerV2FrontSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===westerV2FrontSeeds[index]?.name){
     const seed=westerV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(westerV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function westerV2FrontLabel(index){return westerV2FrontState().groupNames[index]?.trim()||westerV2FrontGroups[index].name}
function drawWesterV2FrontHeader(ctx,group,index){
 if(westerV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#dc4200';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(westerV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncWesterV2FrontControls(){
 let panel=$('westerV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='westerV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  westerV2FrontGroups.slice(0,1).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='westerV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{westerV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{westerV2FrontState().groupNames=westerV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==WESTER_V2_FRONT_ID;
 if(!panel.hidden)westerV2FrontGroups.slice(0,1).forEach((group,index)=>{const input=$('westerV2FrontLabel-'+index);if(document.activeElement!==input)input.value=westerV2FrontState().groupNames[index]??group.name});
}
