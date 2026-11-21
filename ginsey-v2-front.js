// Editable product cards over the supplied Ginsey Oslob artwork.
const GINSEY_V2_FRONT_ID='ginsey-oslob-v2-front';
const GINSEY_V2_FRONT_ART=__GINSEY_V2_FRONT_ART__;
const ginseyV2FrontSeeds=__GINSEY_V2_FRONT_SEEDS__;
const ginseyV2FrontGroups=[{"name": "Storage Units", "headerY": 448, "y": 548, "h": 258, "panel": 0}, {"name": "Houseware", "headerY": 840, "y": 939, "h": 241, "panel": 0}, {"name": "Kitchenware", "headerY": 1217, "y": 1318, "h": 217, "panel": 0}, {"name": "Electric Fans", "headerY": 1573, "y": 1673, "h": 209, "panel": 0}, {"name": "Plasticware", "headerY": 1919, "y": 2017, "h": 204, "panel": 0}, {"name": "Storage Units", "headerY": 448, "y": 548, "h": 258, "panel": 1}, {"name": "Houseware", "headerY": 840, "y": 939, "h": 241, "panel": 1}, {"name": "Tableware", "headerY": 1217, "y": 1318, "h": 217, "panel": 1}, {"name": "Electric Fans", "headerY": 1573, "y": 1673, "h": 209, "panel": 1}, {"name": "Plasticware", "headerY": 1919, "y": 2017, "h": 204, "panel": 1}].map((group,index)=>({...group,items:ginseyV2FrontSeeds.slice(index*3,index*3+3).map(p=>[p.name,p.price])}));
let ginseyV2FrontArtwork=null;
function ginseyV2FrontState(){
 if(!state.ginseyV2Front)state.ginseyV2Front={slots:ginseyV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:Math.floor(index/3),discountPercent:0}))};
 if(!Array.isArray(state.ginseyV2Front.groupNames))state.ginseyV2Front.groupNames=ginseyV2FrontGroups.map(g=>g.name);
 return state.ginseyV2Front;
}

function seedGinseyV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of ginseyV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 ginseyV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[GINSEY_V2_FRONT_ID] ||= 'Template #2 - GINSEY OSLOB - FRONT';
 if(!state.templateSettings[GINSEY_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[GINSEY_V2_FRONT_ID]={poster:{...defaults.poster,store:'GINSEY OSLOB',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function ginseyV2FrontCard(index){
 const slots=ginseyV2FrontState().slots,slot=slots[index],group=ginseyV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 return {x:(group.panel?[1240,1600,1958]:[70,429,788])[column],y:group.y,w:318,h:group.h};
}
async function ginseyV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!ginseyV2FrontArtwork)ginseyV2FrontArtwork=await loadCanvasImage(GINSEY_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(ginseyV2FrontArtwork,0,0,3508,2480);
 const slots=ginseyV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 ginseyV2FrontGroups.forEach((group,groupIndex)=>{
  drawGinseyV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<3;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b={x:(group.panel?[1240,1600,1958]:[70,429,788])[column],y:group.y,w:318,h:group.h};
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,38*textScale('name',slot));
    const priceSize=55*textScale('sale',slot),priceBaseline=b.y+b.h-20;
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

function ginseyV2FrontLabel(index){return ginseyV2FrontState().groupNames[index]?.trim()||ginseyV2FrontGroups[index].name}
function drawGinseyV2FrontHeader(ctx,group,index){
 if(ginseyV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.translate(group.panel*1172,0);ctx.fillStyle='#b00013';roundRect(ctx,59,group.headerY,1050,76,35);ctx.fill();
 const title=ginseyV2FrontLabel(index).toUpperCase();let size=43;
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
 while(ctx.measureText(title).width>1060&&size>16){size--;ctx.font=`800 ${size}px Outfit, Arial, sans-serif`}
 ctx.fillStyle='#ffffff';ctx.fillText(title,85,group.headerY+36,1060);
 const start=85+ctx.measureText(title).width+18;
 if(start<1100){ctx.strokeStyle='#ffed00';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,group.headerY+36);ctx.lineTo(1080,group.headerY+36);ctx.stroke()}
 ctx.restore();
}
function syncGinseyV2FrontControls(){
 let panel=$('ginseyV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='ginseyV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  ginseyV2FrontGroups.forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='ginseyV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{ginseyV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{ginseyV2FrontState().groupNames=ginseyV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==GINSEY_V2_FRONT_ID;
 if(!panel.hidden)ginseyV2FrontGroups.forEach((group,index)=>{const input=$('ginseyV2FrontLabel-'+index);if(document.activeElement!==input)input.value=ginseyV2FrontState().groupNames[index]??group.name});
}
