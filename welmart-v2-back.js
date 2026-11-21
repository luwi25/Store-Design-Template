// Editable product cards over the supplied Welmart Inayawan artwork.
const WELMART_V2_BACK_ID='welmart-inayawan-v2-back';
const WELMART_V2_BACK_ART=__WELMART_V2_BACK_ART__;
const welmartV2BackSeeds=__WELMART_V2_BACK_SEEDS__;
const welmartV2BackGroups=[{"name": "Storage Units", "headerY": 385, "y": 503, "h": 235, "panel": 0}, {"name": "Houseware", "headerY": 790, "y": 907, "h": 231, "panel": 0}, {"name": "Kitchenware & Tableware", "headerY": 1195, "y": 1307, "h": 208, "panel": 0}, {"name": "Electric Fan", "headerY": 1568, "y": 1677, "h": 175, "panel": 0}, {"name": "Plasticware", "headerY": 1909, "y": 2017, "h": 178, "panel": 0}, {"name": "Storage Units", "headerY": 385, "y": 503, "h": 235, "panel": 1}, {"name": "Houseware", "headerY": 790, "y": 907, "h": 231, "panel": 1}, {"name": "Kitchenware & Tableware", "headerY": 1195, "y": 1307, "h": 208, "panel": 1}, {"name": "Electric Fan", "headerY": 1568, "y": 1677, "h": 175, "panel": 1}, {"name": "Plasticware", "headerY": 1909, "y": 2017, "h": 178, "panel": 1}].map((group,index)=>({...group,items:welmartV2BackSeeds.slice(index*5,index*5+5).map(p=>[p.name,p.price])}));
let welmartV2BackArtwork=null;
function welmartV2BackState(){
 if(!state.welmartV2Back)state.welmartV2Back={slots:welmartV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:Math.floor(index/5),discountPercent:0}))};
 if(!Array.isArray(state.welmartV2Back.groupNames))state.welmartV2Back.groupNames=welmartV2BackGroups.map(g=>g.name);
 return state.welmartV2Back;
}

function seedWelmartV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of welmartV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 welmartV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[WELMART_V2_BACK_ID] ||= 'Template #2 - WELMART INAYAWAN - BACK';
 if(!state.templateSettings[WELMART_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[WELMART_V2_BACK_ID]={poster:{...defaults.poster,store:'WELMART INAYAWAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function welmartV2BackCard(index){
 const slots=welmartV2BackState().slots,slot=slots[index],group=welmartV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 return {x:(group.panel?[1217,1440,1663,1884,2105]:[47,270,491,712,934])[column],y:group.y,w:196,h:group.h};
}
async function welmartV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!welmartV2BackArtwork)welmartV2BackArtwork=await loadCanvasImage(WELMART_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(welmartV2BackArtwork,0,0,3508,2480);
 const slots=welmartV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 welmartV2BackGroups.forEach((group,groupIndex)=>{
  drawWelmartV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<5;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b={x:(group.panel?[1217,1440,1663,1884,2105]:[47,270,491,712,934])[column],y:group.y,w:196,h:group.h};
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

function welmartV2BackLabel(index){return welmartV2BackState().groupNames[index]?.trim()||welmartV2BackGroups[index].name}
function drawWelmartV2BackHeader(ctx,group,index){
 if(welmartV2BackLabel(index)===group.name)return;
 ctx.save();ctx.translate(group.panel*1172,0);ctx.fillStyle='#b00000';roundRect(ctx,28,group.headerY,1116,83,30);ctx.fill();
 const title=welmartV2BackLabel(index).toUpperCase();let size=43;
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
 while(ctx.measureText(title).width>1060&&size>16){size--;ctx.font=`800 ${size}px Outfit, Arial, sans-serif`}
 ctx.fillStyle='#ffffff';ctx.fillText(title,48,group.headerY+36,1060);
 const start=48+ctx.measureText(title).width+18;
 if(start<1100){ctx.strokeStyle='#ffed00';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,group.headerY+36);ctx.lineTo(1118,group.headerY+36);ctx.stroke()}
 ctx.restore();
}
function syncWelmartV2BackControls(){
 let panel=$('welmartV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='welmartV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  welmartV2BackGroups.forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='welmartV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{welmartV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{welmartV2BackState().groupNames=welmartV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==WELMART_V2_BACK_ID;
 if(!panel.hidden)welmartV2BackGroups.forEach((group,index)=>{const input=$('welmartV2BackLabel-'+index);if(document.activeElement!==input)input.value=welmartV2BackState().groupNames[index]??group.name});
}
