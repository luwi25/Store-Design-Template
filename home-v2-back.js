// Editable product cards over the supplied Alkeia Talamban artwork.
const HOME_V2_BACK_ID='home-v2-back';
const HOME_V2_BACK_ART=__HOME_V2_BACK_ART__;
const homeV2BackSeeds=__HOME_V2_BACK_SEEDS__;
const homeV2BackGroups=[{"name": "Storage Units", "headerY": 357, "y": 460, "h": 239, "panel": 0}, {"name": "Houseware", "headerY": 741, "y": 842, "h": 250, "panel": 0}, {"name": "Kitchenware & Tableware", "headerY": 1140, "y": 1240, "h": 241, "panel": 0}, {"name": "Electric Fan", "headerY": 1525, "y": 1622, "h": 226, "panel": 0}, {"name": "Plasticware", "headerY": 1894, "y": 1990, "h": 210, "panel": 0}, {"name": "Storage Units", "headerY": 357, "y": 460, "h": 239, "panel": 1}, {"name": "Houseware", "headerY": 741, "y": 842, "h": 250, "panel": 1}, {"name": "Kitchenware & Tableware", "headerY": 1140, "y": 1240, "h": 241, "panel": 1}, {"name": "Electric Fan", "headerY": 1525, "y": 1622, "h": 226, "panel": 1}, {"name": "Plasticware", "headerY": 1894, "y": 1990, "h": 210, "panel": 1}].map((group,index)=>({...group,items:homeV2BackSeeds.slice(index*5,index*5+5).map(p=>[p.name,p.price])}));
let homeV2BackArtwork=null;
function homeV2BackState(){
 if(!state.homeV2Back)state.homeV2Back={slots:homeV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:Math.floor(index/5),discountPercent:0}))};
 if(!Array.isArray(state.homeV2Back.groupNames))state.homeV2Back.groupNames=homeV2BackGroups.map(g=>g.name);
 return state.homeV2Back;
}

function seedHomeV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of homeV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 homeV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[HOME_V2_BACK_ID] ||= 'Template #3 - HOME EXPRESS BASAK - BACK';
 if(!state.templateSettings[HOME_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[HOME_V2_BACK_ID]={poster:{...defaults.poster,store:'HOME EXPRESS BASAK',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function homeV2BackCard(index){
 const slots=homeV2BackState().slots,slot=slots[index],group=homeV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 return {x:[40,263,485,707,927][column]+group.panel*1172,y:group.y,w:200,h:group.h};
}
async function homeV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!homeV2BackArtwork)homeV2BackArtwork=await loadCanvasImage(HOME_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(homeV2BackArtwork,0,0,3508,2480);
 const slots=homeV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 homeV2BackGroups.forEach((group,groupIndex)=>{
  drawHomeV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<5;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b={x:[40,263,485,707,927][column]+group.panel*1172,y:group.y,w:200,h:group.h};
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

function homeV2BackLabel(index){return homeV2BackState().groupNames[index]?.trim()||homeV2BackGroups[index].name}
function drawHomeV2BackHeader(ctx,group,index){
 ctx.save();ctx.translate(group.panel*1172,0);ctx.fillStyle='#003395';roundRect(ctx,28,group.headerY,1116,72,30);ctx.fill();
 const title=homeV2BackLabel(index).toUpperCase();let size=43;
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
 while(ctx.measureText(title).width>1060&&size>16){size--;ctx.font=`800 ${size}px Outfit, Arial, sans-serif`}
 ctx.fillStyle='#ffffff';ctx.fillText(title,48,group.headerY+36,1060);
 const start=48+ctx.measureText(title).width+18;
 if(start<1100){ctx.strokeStyle='#ffed00';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,group.headerY+36);ctx.lineTo(1118,group.headerY+36);ctx.stroke()}
 ctx.restore();
}
function syncHomeV2BackControls(){
 let panel=$('homeV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='homeV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  homeV2BackGroups.forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='homeV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{homeV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{homeV2BackState().groupNames=homeV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==HOME_V2_BACK_ID;
 if(!panel.hidden)homeV2BackGroups.forEach((group,index)=>{const input=$('homeV2BackLabel-'+index);if(document.activeElement!==input)input.value=homeV2BackState().groupNames[index]??group.name});
}
