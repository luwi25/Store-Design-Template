// Editable product cards over the supplied Alkeia Talamban artwork.
const ALKEIA_V2_BACK_ID='alkeia-talamban-v2-back';
const ALKEIA_V2_BACK_ART=__ALKEIA_V2_BACK_ART__;
const alkeiaV2BackSeeds=__ALKEIA_V2_BACK_SEEDS__;
const alkeiaV2BackGroups=[{"name": "Storage Units", "headerY": 333, "y": 419, "h": 289, "panel": 0}, {"name": "Houseware", "headerY": 733, "y": 821, "h": 315, "panel": 0}, {"name": "Kitchenware & Tableware", "headerY": 1156, "y": 1242, "h": 280, "panel": 0}, {"name": "Electric Fan", "headerY": 1544, "y": 1631, "h": 268, "panel": 0}, {"name": "Plasticware", "headerY": 1917, "y": 1998, "h": 254, "panel": 0}, {"name": "Storage Units", "headerY": 333, "y": 419, "h": 289, "panel": 1}, {"name": "Houseware", "headerY": 733, "y": 821, "h": 315, "panel": 1}, {"name": "Kitchenware & Tableware", "headerY": 1156, "y": 1242, "h": 280, "panel": 1}, {"name": "Electric Fan", "headerY": 1544, "y": 1631, "h": 268, "panel": 1}, {"name": "Plasticware", "headerY": 1917, "y": 1998, "h": 254, "panel": 1}].map((group,index)=>({...group,items:alkeiaV2BackSeeds.slice(index*5,index*5+5).map(p=>[p.name,p.price])}));
let alkeiaV2BackArtwork=null;
function alkeiaV2BackState(){
 if(!state.alkeiaV2Back)state.alkeiaV2Back={slots:alkeiaV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:Math.floor(index/5),discountPercent:0}))};
 if(!Array.isArray(state.alkeiaV2Back.groupNames))state.alkeiaV2Back.groupNames=alkeiaV2BackGroups.map(g=>g.name);
 return state.alkeiaV2Back;
}

function seedAlkeiaV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of alkeiaV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 alkeiaV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[ALKEIA_V2_BACK_ID] ||= 'Template #2 - ALKEIA TALAMBAN - BACK';
 if(!state.templateSettings[ALKEIA_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[ALKEIA_V2_BACK_ID]={poster:{...defaults.poster,store:'ALKEIA TALAMBAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function alkeiaV2BackCard(index){
 const slots=alkeiaV2BackState().slots,slot=slots[index],group=alkeiaV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 return {x:[30,256,482,704,930][column]+group.panel*1172,y:group.y,w:213,h:group.h};
}
async function alkeiaV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!alkeiaV2BackArtwork)alkeiaV2BackArtwork=await loadCanvasImage(ALKEIA_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(alkeiaV2BackArtwork,0,0,3508,2480);
 const slots=alkeiaV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 alkeiaV2BackGroups.forEach((group,groupIndex)=>{
  drawAlkeiaV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<5;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b={x:[30,256,482,704,930][column]+group.panel*1172,y:group.y,w:213,h:group.h};
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);
   ctx.fillStyle='#ffdc00';roundRect(ctx,b.x+16,b.y+b.h-20,b.w-32,10,5);ctx.fill();
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
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#080808';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b1 \u2014',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function alkeiaV2BackLabel(index){return alkeiaV2BackState().groupNames[index]?.trim()||alkeiaV2BackGroups[index].name}
function drawAlkeiaV2BackHeader(ctx,group,index){
 ctx.save();ctx.translate(group.panel*1172,0);ctx.fillStyle='#f45a00';roundRect(ctx,28,group.headerY,1116,69,30);ctx.fill();
 const title=alkeiaV2BackLabel(index).toUpperCase();let size=43;
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
 while(ctx.measureText(title).width>1060&&size>16){size--;ctx.font=`800 ${size}px Outfit, Arial, sans-serif`}
 ctx.fillStyle='#ffffff';ctx.fillText(title,48,group.headerY+34,1060);
 const start=48+ctx.measureText(title).width+18;
 if(start<1100){ctx.strokeStyle='#ffed00';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,group.headerY+34);ctx.lineTo(1118,group.headerY+34);ctx.stroke()}
 ctx.restore();
}
function syncAlkeiaV2BackControls(){
 let panel=$('alkeiaV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='alkeiaV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  alkeiaV2BackGroups.forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='alkeiaV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{alkeiaV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{alkeiaV2BackState().groupNames=alkeiaV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==ALKEIA_V2_BACK_ID;
 if(!panel.hidden)alkeiaV2BackGroups.forEach((group,index)=>{const input=$('alkeiaV2BackLabel-'+index);if(document.activeElement!==input)input.value=alkeiaV2BackState().groupNames[index]??group.name});
}
