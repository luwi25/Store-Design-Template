// Editable product cards over the supplied Alkeia Tayud artwork.
const TAYUD_BACK_ID='alkeia-tayud-back';
const TAYUD_BACK_ART=__TAYUD_BACK_ART__;
const tayudBackSeeds=__TAYUD_BACK_SEEDS__;
const tayudBackGroups=[{"name": "Storage Units", "headerY": 202, "y": 257, "h": 234}, {"name": "Houseware", "headerY": 501, "y": 553, "h": 252}, {"name": "Kitchenware & Tableware", "headerY": 813, "y": 866, "h": 226}, {"name": "Electric Fan", "headerY": 1100, "y": 1152, "h": 214}, {"name": "Plasticware", "headerY": 1375, "y": 1425, "h": 198}].map((group,index)=>({...group,items:tayudBackSeeds.slice(index*5,index*5+5).map(p=>[p.name,p.price])}));
let tayudBackArtwork=null;
function tayudBackState(){
 if(!state.tayudBack)state.tayudBack={slots:tayudBackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:Math.floor(index/5),discountPercent:0}))};
 if(!Array.isArray(state.tayudBack.groupNames))state.tayudBack.groupNames=tayudBackGroups.map(g=>g.name);
 return state.tayudBack;
}

function seedTayudBack(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of tayudBackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 tayudBackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[TAYUD_BACK_ID] ||= 'Template #1 - ALKEIA TAYUD - BACK';
 if(!state.templateSettings[TAYUD_BACK_ID]){
  const defaults=starter();
  state.templateSettings[TAYUD_BACK_ID]={poster:{...defaults.poster,store:'ALKEIA TAYUD',paper:'letter',fit:'half'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function tayudBackCard(index){
 const slots=tayudBackState().slots,slot=slots[index],group=tayudBackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 return {x:[30,280,527,770,1014][column],y:group.y,w:238,h:group.h};
}
async function tayudBackCanvas({width=1650,height=2550}={}){
 await document.fonts.load('800 20px Outfit');
 if(!tayudBackArtwork)tayudBackArtwork=await loadCanvasImage(TAYUD_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/1280,height/1920);
 ctx.drawImage(tayudBackArtwork,0,0,1280,1920);
 const slots=tayudBackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 tayudBackGroups.forEach((group,groupIndex)=>{
  drawTayudBackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<5;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b={x:[30,280,527,770,1014][column],y:group.y,w:238,h:group.h};
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);
   ctx.fillStyle='#ffeb22';roundRect(ctx,b.x+29,b.y+b.h-53,b.w-58,41,20);ctx.fill();
   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,21*textScale('name',slot));
    const priceSize=32*textScale('sale',slot),priceBaseline=b.y+b.h-20;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#b00000';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#b00000';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b1 \u2014',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function tayudBackLabel(index){return tayudBackState().groupNames[index]?.trim()||tayudBackGroups[index].name}
function drawTayudBackHeader(ctx,group,index){
 ctx.save();ctx.fillStyle='#ac0000';roundRect(ctx,29,group.headerY,1222,48,24);ctx.fill();
 const title=tayudBackLabel(index).toUpperCase();let size=39;
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
 while(ctx.measureText(title).width>1160&&size>16){size--;ctx.font=`800 ${size}px Outfit, Arial, sans-serif`}
 ctx.fillStyle='#ffeb22';ctx.fillText(title,48,group.headerY+24,1160);
 const start=48+ctx.measureText(title).width+18;
 if(start<1200){ctx.strokeStyle='#ffeb22';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,group.headerY+24);ctx.lineTo(1218,group.headerY+24);ctx.stroke()}
 ctx.restore();
}
function syncTayudBackControls(){
 let panel=$('tayudBackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='tayudBackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  tayudBackGroups.forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='tayudBackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{tayudBackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{tayudBackState().groupNames=tayudBackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==TAYUD_BACK_ID;
 if(!panel.hidden)tayudBackGroups.forEach((group,index)=>{const input=$('tayudBackLabel-'+index);if(document.activeElement!==input)input.value=tayudBackState().groupNames[index]??group.name});
}
