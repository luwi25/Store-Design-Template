// Editable product cards over the supplied Bestco Tuburan artwork.
const BESTCO_V2_BACK_ID='bestco-tuburan-v2-back';
const BESTCO_V2_BACK_ART=__BESTCO_V2_BACK_ART__;
const bestcoV2BackSeeds=__BESTCO_V2_BACK_SEEDS__;
const bestcoV2BackGroups=[{"name": "Storage Units", "headerY": 395, "y": 503, "h": 232, "panel": 0}, {"name": "Houseware", "headerY": 765, "y": 874, "h": 239, "panel": 0}, {"name": "Kitchenware & Tableware", "headerY": 1148, "y": 1260, "h": 214, "panel": 0}, {"name": "Electric Fan", "headerY": 1510, "y": 1616, "h": 195, "panel": 0}, {"name": "Plasticware", "headerY": 1845, "y": 1953, "h": 192, "panel": 0}, {"name": "Storage Units", "headerY": 395, "y": 503, "h": 232, "panel": 1}, {"name": "Houseware", "headerY": 765, "y": 874, "h": 239, "panel": 1}, {"name": "Kitchenware & Tableware", "headerY": 1148, "y": 1260, "h": 214, "panel": 1}, {"name": "Electric Fan", "headerY": 1510, "y": 1616, "h": 195, "panel": 1}, {"name": "Plasticware", "headerY": 1845, "y": 1953, "h": 192, "panel": 1}].map((group,index)=>({...group,items:bestcoV2BackSeeds.slice(index*5,index*5+5).map(p=>[p.name,p.price])}));
let bestcoV2BackArtwork=null;
function bestcoV2BackState(){
 if(!state.bestcoV2Back)state.bestcoV2Back={slots:bestcoV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:Math.floor(index/5),discountPercent:0}))};
 if(!Array.isArray(state.bestcoV2Back.groupNames))state.bestcoV2Back.groupNames=bestcoV2BackGroups.map(g=>g.name);
 return state.bestcoV2Back;
}

function seedBestcoV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of bestcoV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 bestcoV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[BESTCO_V2_BACK_ID] ||= 'Template #2 - BESTCO TUBURAN - BACK';
 if(!state.templateSettings[BESTCO_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[BESTCO_V2_BACK_ID]={poster:{...defaults.poster,store:'BESTCO TUBURAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function bestcoV2BackCard(index){
 const slots=bestcoV2BackState().slots,slot=slots[index],group=bestcoV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 return {x:(group.panel?[1194,1423,1653,1877,2104]:[49,267,485,702,917])[column],y:group.y,w:group.panel?202:198,h:group.h};
}
async function bestcoV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!bestcoV2BackArtwork)bestcoV2BackArtwork=await loadCanvasImage(BESTCO_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(bestcoV2BackArtwork,0,0,3508,2480);
 const slots=bestcoV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 bestcoV2BackGroups.forEach((group,groupIndex)=>{
  drawBestcoV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<5;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b={x:(group.panel?[1194,1423,1653,1877,2104]:[49,267,485,702,917])[column],y:group.y,w:group.panel?202:198,h:group.h};
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,26*textScale('name',slot));
    const priceSize=43*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#ff0000';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b1 \u2014',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function bestcoV2BackLabel(index){return bestcoV2BackState().groupNames[index]?.trim()||bestcoV2BackGroups[index].name}
function drawBestcoV2BackHeader(ctx,group,index){
 if(bestcoV2BackLabel(index)===group.name)return;
 ctx.save();ctx.translate(group.panel*1172,0);ctx.fillStyle='#003395';roundRect(ctx,28,group.headerY,1116,83,30);ctx.fill();
 const title=bestcoV2BackLabel(index).toUpperCase();let size=43;
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
 while(ctx.measureText(title).width>1060&&size>16){size--;ctx.font=`800 ${size}px Outfit, Arial, sans-serif`}
 ctx.fillStyle='#ffffff';ctx.fillText(title,48,group.headerY+36,1060);
 const start=48+ctx.measureText(title).width+18;
 if(start<1100){ctx.strokeStyle='#ffed00';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,group.headerY+36);ctx.lineTo(1118,group.headerY+36);ctx.stroke()}
 ctx.restore();
}
function syncBestcoV2BackControls(){
 let panel=$('bestcoV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='bestcoV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  bestcoV2BackGroups.forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='bestcoV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{bestcoV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{bestcoV2BackState().groupNames=bestcoV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==BESTCO_V2_BACK_ID;
 if(!panel.hidden)bestcoV2BackGroups.forEach((group,index)=>{const input=$('bestcoV2BackLabel-'+index);if(document.activeElement!==input)input.value=bestcoV2BackState().groupNames[index]??group.name});
}
