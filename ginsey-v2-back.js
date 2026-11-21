// Editable product cards over the supplied Ginsey Oslob artwork.
const GINSEY_V2_BACK_ID='ginsey-oslob-v2-back';
const GINSEY_V2_BACK_ART=__GINSEY_V2_BACK_ART__;
const ginseyV2BackSeeds=__GINSEY_V2_BACK_SEEDS__;
const ginseyV2BackGroups=[{"name": "Electric Fans", "headerY": 68, "boxes": [[1220, 219, 326, 440], [1590, 219, 326, 440], [1960, 219, 326, 440], [1345, 710, 382, 447], [1775, 710, 382, 447]]}, {"name": "Plasticware", "headerY": 1247, "boxes": [[1220, 1395, 326, 422], [1590, 1395, 326, 422], [1960, 1395, 326, 422], [1345, 1872, 382, 433], [1775, 1872, 382, 433]]}].map((group,index)=>({...group,items:ginseyV2BackSeeds.slice(index*5,index*5+5).map(p=>[p.name,p.price])}));
let ginseyV2BackArtwork=null;
function ginseyV2BackState(){
 if(!state.ginseyV2Back)state.ginseyV2Back={slots:ginseyV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:Math.floor(index/5),discountPercent:0}))};
 if(!Array.isArray(state.ginseyV2Back.groupNames))state.ginseyV2Back.groupNames=ginseyV2BackGroups.map(g=>g.name);
 return state.ginseyV2Back;
}

function seedGinseyV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of ginseyV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 ginseyV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[GINSEY_V2_BACK_ID] ||= 'Template #2 - GINSEY OSLOB - BACK';
 if(!state.templateSettings[GINSEY_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[GINSEY_V2_BACK_ID]={poster:{...defaults.poster,store:'GINSEY OSLOB',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function ginseyV2BackCard(index){
 const slots=ginseyV2BackState().slots,slot=slots[index],group=ginseyV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function ginseyV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!ginseyV2BackArtwork)ginseyV2BackArtwork=await loadCanvasImage(GINSEY_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(ginseyV2BackArtwork,0,0,3508,2480);
 const slots=ginseyV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 ginseyV2BackGroups.forEach((group,groupIndex)=>{
  drawGinseyV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<5;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=ginseyV2BackCard(index);
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,40*textScale('name',slot));
    const priceSize=62*textScale('sale',slot),priceBaseline=b.y+b.h-20;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.fillStyle='#ffd000';roundRect(ctx,b.x+20,priceBaseline-priceSize+3,b.w-40,priceSize+8,26);ctx.fill();ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#ff0000';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b1 \u2014',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function ginseyV2BackLabel(index){return ginseyV2BackState().groupNames[index]?.trim()||ginseyV2BackGroups[index].name}
function drawGinseyV2BackHeader(ctx,group,index){
 if(ginseyV2BackLabel(index)===group.name)return;
 ctx.save();ctx.translate(1172,0);ctx.fillStyle='#b00013';roundRect(ctx,59,group.headerY,1050,98,35);ctx.fill();
 const title=ginseyV2BackLabel(index).toUpperCase();let size=43;
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
 while(ctx.measureText(title).width>1060&&size>16){size--;ctx.font=`800 ${size}px Outfit, Arial, sans-serif`}
 ctx.fillStyle='#ffffff';ctx.fillText(title,85,group.headerY+49,1060);
 const start=85+ctx.measureText(title).width+18;
 if(start<1100){ctx.strokeStyle='#ffed00';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,group.headerY+49);ctx.lineTo(1080,group.headerY+49);ctx.stroke()}
 ctx.restore();
}
function syncGinseyV2BackControls(){
 let panel=$('ginseyV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='ginseyV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  ginseyV2BackGroups.forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='ginseyV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{ginseyV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{ginseyV2BackState().groupNames=ginseyV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==GINSEY_V2_BACK_ID;
 if(!panel.hidden)ginseyV2BackGroups.forEach((group,index)=>{const input=$('ginseyV2BackLabel-'+index);if(document.activeElement!==input)input.value=ginseyV2BackState().groupNames[index]??group.name});
}
