// Editable product cards over the supplied Alkeia Talamban artwork.
const ALKEIA_V2_FRONT_ID='alkeia-talamban-v2-front';
const ALKEIA_V2_FRONT_ART=__ALKEIA_V2_FRONT_ART__;
const alkeiaV2FrontSeeds=__ALKEIA_V2_FRONT_SEEDS__;
const alkeiaV2FrontGroups=[{"name": "Storage Units", "headerY": 333, "y": 419, "h": 289, "panel": 0}, {"name": "Houseware", "headerY": 733, "y": 821, "h": 315, "panel": 0}, {"name": "Kitchenware & Tableware", "headerY": 1156, "y": 1242, "h": 280, "panel": 0}, {"name": "Electric Fan", "headerY": 1544, "y": 1631, "h": 268, "panel": 0}, {"name": "Plasticware", "headerY": 1917, "y": 1998, "h": 254, "panel": 0}, {"name": "Electric Fan", "headerY": 70, "panel": 1}, {"name": "Plasticware", "headerY": 1310, "panel": 1}].map((group,index)=>({...group,items:alkeiaV2FrontSeeds.slice(index*5,index*5+5).map(p=>[p.name,p.price])}));
let alkeiaV2FrontArtwork=null;
function alkeiaV2FrontState(){
 if(!state.alkeiaV2Front)state.alkeiaV2Front={slots:alkeiaV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:Math.floor(index/5),discountPercent:0}))};
 if(!Array.isArray(state.alkeiaV2Front.groupNames))state.alkeiaV2Front.groupNames=alkeiaV2FrontGroups.map(g=>g.name);
 return state.alkeiaV2Front;
}

function seedAlkeiaV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of alkeiaV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 alkeiaV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[ALKEIA_V2_FRONT_ID] ||= 'Template #2 - ALKEIA TALAMBAN - FRONT';
 if(!state.templateSettings[ALKEIA_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[ALKEIA_V2_FRONT_ID]={poster:{...defaults.poster,store:'ALKEIA TALAMBAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function alkeiaV2FrontCard(index){
 const slots=alkeiaV2FrontState().slots,slot=slots[index],group=alkeiaV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 if(slot.group<5)return {x:[30,256,482,704,930][column],y:group.y,w:213,h:group.h};
 const boxes=slot.group===5?[[1214,224,330,491],[1582,224,330,491],[1950,224,330,491],[1310,760,411,482],[1778,760,405,482]]:[[1214,1457,330,441],[1582,1457,330,441],[1950,1457,330,441],[1318,1933,400,421],[1780,1933,394,421]];
 const [x,y,w,h]=boxes[column];return {x,y,w,h};
}
async function alkeiaV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!alkeiaV2FrontArtwork)alkeiaV2FrontArtwork=await loadCanvasImage(ALKEIA_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(alkeiaV2FrontArtwork,0,0,3508,2480);
 const slots=alkeiaV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 alkeiaV2FrontGroups.forEach((group,groupIndex)=>{
  drawAlkeiaV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<5;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=alkeiaV2FrontCard(index),large=groupIndex>=5;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);
   ctx.fillStyle='#ffdc00';roundRect(ctx,b.x+16,b.y+b.h-(large?95:20),b.w-32,large?80:10,large?40:5);ctx.fill();
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
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#080808';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b1 \u2014',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function alkeiaV2FrontLabel(index){return alkeiaV2FrontState().groupNames[index]?.trim()||alkeiaV2FrontGroups[index].name}
function drawAlkeiaV2FrontHeader(ctx,group,index){
 if(index>=5){ctx.save();ctx.fillStyle='#ae0000';roundRect(ctx,1207,group.headerY+4,1070,101,45);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='italic 800 78px Outfit, Arial, sans-serif';ctx.fillText(alkeiaV2FrontLabel(index).toUpperCase(),1742,group.headerY+55,1030);ctx.restore();return}
 ctx.save();ctx.translate(group.panel*1172,0);ctx.fillStyle='#f45a00';roundRect(ctx,28,group.headerY,1116,69,30);ctx.fill();
 const title=alkeiaV2FrontLabel(index).toUpperCase();let size=43;
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
 while(ctx.measureText(title).width>1060&&size>16){size--;ctx.font=`800 ${size}px Outfit, Arial, sans-serif`}
 ctx.fillStyle='#ffffff';ctx.fillText(title,48,group.headerY+34,1060);
 const start=48+ctx.measureText(title).width+18;
 if(start<1100){ctx.strokeStyle='#ffed00';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,group.headerY+34);ctx.lineTo(1118,group.headerY+34);ctx.stroke()}
 ctx.restore();
}
function syncAlkeiaV2FrontControls(){
 let panel=$('alkeiaV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='alkeiaV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  alkeiaV2FrontGroups.forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='alkeiaV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{alkeiaV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{alkeiaV2FrontState().groupNames=alkeiaV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==ALKEIA_V2_FRONT_ID;
 if(!panel.hidden)alkeiaV2FrontGroups.forEach((group,index)=>{const input=$('alkeiaV2FrontLabel-'+index);if(document.activeElement!==input)input.value=alkeiaV2FrontState().groupNames[index]??group.name});
}
