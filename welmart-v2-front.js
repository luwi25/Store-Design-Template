// Editable product cards over the supplied Welmart Inayawan artwork.
const WELMART_V2_FRONT_ID='welmart-inayawan-v2-front';
const WELMART_V2_FRONT_ART=__WELMART_V2_FRONT_ART__;
const welmartV2FrontSeeds=__WELMART_V2_FRONT_SEEDS__;
const welmartV2FrontGroups=[{"name": "Kitchenware", "headerX": 30, "headerY": 526, "headerW": 700, "boxes": [[45, 650, 202, 244], [278, 650, 202, 244], [508, 650, 202, 244], [731, 650, 202, 244], [949, 650, 202, 244]]}, {"name": "Cookware", "headerX": 30, "headerY": 940, "headerW": 700, "boxes": [[45, 1050, 202, 244], [278, 1050, 202, 244], [508, 1050, 202, 244], [731, 1050, 202, 244], [949, 1050, 202, 244]]}, {"name": "Plasticware", "headerX": 30, "headerY": 1340, "headerW": 700, "boxes": [[45, 1450, 202, 244], [278, 1450, 202, 244], [508, 1450, 202, 244], [731, 1450, 202, 244], [949, 1450, 202, 244]]}, {"name": "Houseware", "headerX": 30, "headerY": 1745, "headerW": 535, "boxes": [[37, 1855, 166, 230], [224, 1855, 166, 230], [411, 1855, 166, 230]]}, {"name": "Storage Units", "headerX": 602, "headerY": 1745, "headerW": 542, "boxes": [[613, 1855, 166, 230], [803, 1855, 166, 230], [992, 1855, 166, 230]]}, {"name": "Kitchenware", "headerX": 1270, "headerY": 90, "headerW": 970, "boxes": [[1260, 258, 305, 244], [1610, 258, 305, 244], [1959, 258, 305, 244], [1390, 553, 327, 242], [1795, 553, 333, 242]]}, {"name": "Cookware", "headerX": 1270, "headerY": 865, "headerW": 970, "boxes": [[1260, 1027, 305, 232], [1610, 1027, 305, 232], [1959, 1027, 305, 232], [1390, 1308, 327, 242], [1795, 1308, 333, 242]]}, {"name": "Plasticware", "headerX": 1270, "headerY": 1600, "headerW": 970, "boxes": [[1260, 1758, 305, 232], [1610, 1758, 305, 232], [1959, 1758, 305, 232], [1390, 2026, 327, 242], [1795, 2026, 333, 242]]}, {"name": "Featured products", "boxes": [[2378, 1332, 249, 222], [2668, 1332, 249, 222], [2955, 1332, 249, 222], [3242, 1332, 249, 222], [2378, 1602, 249, 222], [2668, 1602, 249, 222], [2955, 1602, 249, 222], [3242, 1602, 249, 222]]}].map((group,index)=>({...group,items:welmartV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let welmartV2FrontArtwork=null;
function welmartV2FrontState(){
 if(!state.welmartV2Front)state.welmartV2Front={slots:welmartV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.welmartV2Front.groupNames))state.welmartV2Front.groupNames=welmartV2FrontGroups.map(g=>g.name);
 return state.welmartV2Front;
}

function seedWelmartV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of welmartV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 welmartV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[WELMART_V2_FRONT_ID] ||= 'Template #2 - WELMART INAYAWAN - FRONT';
 if(!state.templateSettings[WELMART_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[WELMART_V2_FRONT_ID]={poster:{...defaults.poster,store:'WELMART INAYAWAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function welmartV2FrontCard(index){
 const slots=welmartV2FrontState().slots,slot=slots[index],group=welmartV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function welmartV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!welmartV2FrontArtwork)welmartV2FrontArtwork=await loadCanvasImage(WELMART_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(welmartV2FrontArtwork,0,0,3508,2480);
 const slots=welmartV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 welmartV2FrontGroups.forEach((group,groupIndex)=>{
  drawWelmartV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=welmartV2FrontCard(index),large=groupIndex>=5&&groupIndex<=7;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
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

function welmartV2FrontLabel(index){return welmartV2FrontState().groupNames[index]?.trim()||welmartV2FrontGroups[index].name}
function drawWelmartV2FrontHeader(ctx,group,index){
 if(index===8||welmartV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#b00000';roundRect(ctx,group.headerX,group.headerY,group.headerW,index>=5?106:90,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${index>=5?74:52}px Outfit, Arial, sans-serif`;ctx.fillText(welmartV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(index>=5?53:45),group.headerW-30);ctx.restore();
}
function syncWelmartV2FrontControls(){
 let panel=$('welmartV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='welmartV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  welmartV2FrontGroups.slice(0,8).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='welmartV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{welmartV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{welmartV2FrontState().groupNames=welmartV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==WELMART_V2_FRONT_ID;
 if(!panel.hidden)welmartV2FrontGroups.slice(0,8).forEach((group,index)=>{const input=$('welmartV2FrontLabel-'+index);if(document.activeElement!==input)input.value=welmartV2FrontState().groupNames[index]??group.name});
}
