// Editable product cards over the supplied Alkeia Talamban artwork.
const HOME_V2_FRONT_ID='home-v2-front';
const HOME_V2_FRONT_ART=__HOME_V2_FRONT_ART__;
const homeV2FrontSeeds=__HOME_V2_FRONT_SEEDS__;
const homeV2FrontGroups=[{"name": "Storage Units", "headerY": 390, "y": 494, "h": 238, "panel": 0}, {"name": "Houseware", "headerY": 765, "y": 866, "h": 240, "panel": 0}, {"name": "Kitchenware & Tableware", "headerY": 1140, "y": 1240, "h": 227, "panel": 0}, {"name": "Electric Fan", "headerY": 1498, "y": 1592, "h": 208, "panel": 0}, {"name": "Plasticware", "headerY": 1830, "y": 1930, "h": 211, "panel": 0}, {"name": "Electric Fan", "headerY": 150, "panel": 1}, {"name": "Plasticware", "headerY": 1275, "panel": 1}, {"name": "Featured products", "panel": 2}].map((group,index)=>({...group,items:homeV2FrontSeeds.slice(index*5,index===7?41:index*5+5).map(p=>[p.name,p.price])}));
let homeV2FrontArtwork=null;
function homeV2FrontState(){
 if(!state.homeV2Front)state.homeV2Front={slots:homeV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:Math.min(7,Math.floor(index/5)),discountPercent:0}))};
 if(!Array.isArray(state.homeV2Front.groupNames))state.homeV2Front.groupNames=homeV2FrontGroups.map(g=>g.name);
 return state.homeV2Front;
}

function seedHomeV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of homeV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 homeV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[HOME_V2_FRONT_ID] ||= 'Template #3 - HOME EXPRESS BASAK - FRONT';
 if(!state.templateSettings[HOME_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[HOME_V2_FRONT_ID]={poster:{...defaults.poster,store:'HOME EXPRESS BASAK',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function homeV2FrontCard(index){
 const slots=homeV2FrontState().slots,slot=slots[index],group=homeV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 if(slot.group<5)return {x:[40,265,484,706,928][column],y:group.y,w:204,h:group.h};
 const boxes=slot.group===5?[[1218,333,325,423],[1588,333,325,423],[1958,333,332,423],[1308,817,421,380],[1777,817,420,380]]:slot.group===6?[[1218,1448,325,390],[1588,1448,325,390],[1958,1448,332,390],[1308,1887,421,354],[1777,1887,420,354]]:[[2395,1280,332,267],[2768,1280,331,267],[3140,1280,330,267],[2395,1586,332,263],[2768,1586,331,263],[3140,1586,330,263]];
 const [x,y,w,h]=boxes[column];return {x,y,w,h};
}
async function homeV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!homeV2FrontArtwork)homeV2FrontArtwork=await loadCanvasImage(HOME_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(homeV2FrontArtwork,0,0,3508,2480);
 const slots=homeV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 homeV2FrontGroups.forEach((group,groupIndex)=>{
  drawHomeV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=homeV2FrontCard(index),large=groupIndex>=5;
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
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#ff0000';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b1 \u2014',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function homeV2FrontLabel(index){return homeV2FrontState().groupNames[index]?.trim()||homeV2FrontGroups[index].name}
function drawHomeV2FrontHeader(ctx,group,index){
 if(index===7)return;
 if(index>=5){ctx.save();ctx.fillStyle='#003395';roundRect(ctx,1225,group.headerY+4,1065,112,50);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='italic 800 78px Outfit, Arial, sans-serif';ctx.fillText(homeV2FrontLabel(index).toUpperCase(),1742,group.headerY+60,1030);ctx.restore();return}
 ctx.save();ctx.translate(group.panel*1172,0);ctx.fillStyle='#f45a00';roundRect(ctx,28,group.headerY,1116,77,30);ctx.fill();
 const title=homeV2FrontLabel(index).toUpperCase();let size=43;
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
 while(ctx.measureText(title).width>1060&&size>16){size--;ctx.font=`800 ${size}px Outfit, Arial, sans-serif`}
 ctx.fillStyle='#ffffff';ctx.fillText(title,48,group.headerY+38,1060);
 const start=48+ctx.measureText(title).width+18;
 if(start<1100){ctx.strokeStyle='#ffed00';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,group.headerY+38);ctx.lineTo(1118,group.headerY+38);ctx.stroke()}
 ctx.restore();
}
function syncHomeV2FrontControls(){
 let panel=$('homeV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='homeV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  homeV2FrontGroups.slice(0,7).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='homeV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{homeV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{homeV2FrontState().groupNames=homeV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==HOME_V2_FRONT_ID;
 if(!panel.hidden)homeV2FrontGroups.slice(0,7).forEach((group,index)=>{const input=$('homeV2FrontLabel-'+index);if(document.activeElement!==input)input.value=homeV2FrontState().groupNames[index]??group.name});
}
