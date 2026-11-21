// Editable product cards over the supplied Bestco Tuburan artwork.
const BESTCO_V2_FRONT_ID='bestco-tuburan-v2-front';
const BESTCO_V2_FRONT_ART=__BESTCO_V2_FRONT_ART__;
const bestcoV2FrontSeeds=__BESTCO_V2_FRONT_SEEDS__;
const bestcoV2FrontGroups=[{"name": "Storage Units", "headerY": 405, "y": 510, "h": 235, "panel": 0}, {"name": "Houseware", "headerY": 785, "y": 887, "h": 233, "panel": 0}, {"name": "Kitchenware & Tableware", "headerY": 1165, "y": 1267, "h": 217, "panel": 0}, {"name": "Electric Fan", "headerY": 1535, "y": 1627, "h": 192, "panel": 0}, {"name": "Plasticware", "headerY": 1860, "y": 1962, "h": 198, "panel": 0}, {"name": "Electric Fan", "headerY": 160, "panel": 1}, {"name": "Plasticware", "headerY": 1270, "panel": 1}, {"name": "Featured products", "panel": 2}].map((group,index)=>({...group,items:bestcoV2FrontSeeds.slice(index*5,index===7?44:index*5+5).map(p=>[p.name,p.price])}));
let bestcoV2FrontArtwork=null;
function bestcoV2FrontState(){
 if(!state.bestcoV2Front)state.bestcoV2Front={slots:bestcoV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:Math.min(7,Math.floor(index/5)),discountPercent:0}))};
 if(!Array.isArray(state.bestcoV2Front.groupNames))state.bestcoV2Front.groupNames=bestcoV2FrontGroups.map(g=>g.name);
 return state.bestcoV2Front;
}

function seedBestcoV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of bestcoV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 bestcoV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[BESTCO_V2_FRONT_ID] ||= 'Template #2 - BESTCO TUBURAN - FRONT';
 if(!state.templateSettings[BESTCO_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[BESTCO_V2_FRONT_ID]={poster:{...defaults.poster,store:'BESTCO TUBURAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function bestcoV2FrontCard(index){
 const slots=bestcoV2FrontState().slots,slot=slots[index],group=bestcoV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 if(slot.group<5)return {x:[50,273,488,705,920][column],y:group.y,w:200,h:group.h+8};
 const boxes=slot.group===5?[[1215, 350, 325, 407], [1588, 350, 325, 407], [1963, 350, 325, 407], [1318, 818, 411, 377], [1788, 818, 411, 377]]:slot.group===6?[[1215, 1450, 325, 330], [1588, 1450, 325, 330], [1963, 1450, 325, 330], [1318, 1839, 411, 329], [1788, 1839, 411, 329]]:[[2392, 748, 339, 353], [2751, 748, 339, 353], [3114, 748, 339, 353], [2392, 1128, 339, 331], [2751, 1128, 339, 331], [3114, 1128, 339, 331], [2392, 1485, 339, 331], [2751, 1485, 339, 331], [3114, 1485, 339, 331]];
 const [x,y,w,h]=boxes[column];return {x,y,w,h};
}
async function bestcoV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!bestcoV2FrontArtwork)bestcoV2FrontArtwork=await loadCanvasImage(BESTCO_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(bestcoV2FrontArtwork,0,0,3508,2480);
 const slots=bestcoV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 bestcoV2FrontGroups.forEach((group,groupIndex)=>{
  drawBestcoV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=bestcoV2FrontCard(index),large=groupIndex>=5;
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
    ctx.textAlign='center';ctx.fillStyle=groupIndex===7?'#e94400':'#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){if(groupIndex===7){ctx.fillStyle='#b00000';roundRect(ctx,b.x+55,priceBaseline-priceSize+2,b.w-110,priceSize+14,26);ctx.fill()}ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle=groupIndex===7?'#fff':'#ff0000';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b1 \u2014',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function bestcoV2FrontLabel(index){return bestcoV2FrontState().groupNames[index]?.trim()||bestcoV2FrontGroups[index].name}
function drawBestcoV2FrontHeader(ctx,group,index){
 if(index===7||bestcoV2FrontLabel(index)===group.name)return;
 if(index>=5){ctx.save();ctx.fillStyle='#003395';roundRect(ctx,1225,group.headerY+4,1065,112,50);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='italic 800 78px Outfit, Arial, sans-serif';ctx.fillText(bestcoV2FrontLabel(index).toUpperCase(),1742,group.headerY+60,1030);ctx.restore();return}
 ctx.save();ctx.translate(group.panel*1172,0);ctx.fillStyle='#f45a00';roundRect(ctx,28,group.headerY-12,1116,89,30);ctx.fill();
 const title=bestcoV2FrontLabel(index).toUpperCase();let size=43;
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
 while(ctx.measureText(title).width>1060&&size>16){size--;ctx.font=`800 ${size}px Outfit, Arial, sans-serif`}
 ctx.fillStyle='#ffffff';ctx.fillText(title,48,group.headerY+38,1060);
 const start=48+ctx.measureText(title).width+18;
 if(start<1100){ctx.strokeStyle='#ffed00';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,group.headerY+38);ctx.lineTo(1118,group.headerY+38);ctx.stroke()}
 ctx.restore();
}
function syncBestcoV2FrontControls(){
 let panel=$('bestcoV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='bestcoV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  bestcoV2FrontGroups.slice(0,7).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='bestcoV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{bestcoV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{bestcoV2FrontState().groupNames=bestcoV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==BESTCO_V2_FRONT_ID;
 if(!panel.hidden)bestcoV2FrontGroups.slice(0,7).forEach((group,index)=>{const input=$('bestcoV2FrontLabel-'+index);if(document.activeElement!==input)input.value=bestcoV2FrontState().groupNames[index]??group.name});
}
