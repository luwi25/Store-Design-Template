// Editable product cards over the supplied Mandarin Catmon artwork.
const MANDARIN_BACK_ID='mandarin-catmon-back';
const MANDARIN_BACK_ART=__MANDARIN_BACK_ART__;
const mandarinBackSeeds=__MANDARIN_BACK_SEEDS__;
const mandarinBackGroups=[{"name": "Storage Units", "headerY": 176, "y": 229, "h": 242}, {"name": "Houseware", "headerY": 480, "y": 536, "h": 238}, {"name": "Kitchenware & Tableware", "headerY": 783, "y": 838, "h": 239}, {"name": "Electric Fan", "headerY": 1086, "y": 1140, "h": 217}, {"name": "Plasticware", "headerY": 1367, "y": 1421, "h": 218}].map((group,index)=>({...group,items:mandarinBackSeeds.slice(index*5,index*5+5).map(p=>[p.name,p.price])}));
let mandarinBackArtwork=null;
function mandarinBackState(){
 if(!state.mandarinBack)state.mandarinBack={slots:mandarinBackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:Math.floor(index/5),discountPercent:0}))};
 if(!Array.isArray(state.mandarinBack.groupNames))state.mandarinBack.groupNames=mandarinBackGroups.map(g=>g.name);
 return state.mandarinBack;
}

function seedMandarinBack(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of mandarinBackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 mandarinBackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[MANDARIN_BACK_ID] ||= 'Template #1 - MANDARIN CATMON - BACK';
 if(!state.templateSettings[MANDARIN_BACK_ID]){
  const defaults=starter();
  state.templateSettings[MANDARIN_BACK_ID]={poster:{...defaults.poster,store:'MANDARIN CATMON',paper:'letter',fit:'half'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function mandarinBackCard(index){
 const slots=mandarinBackState().slots,slot=slots[index],group=mandarinBackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 return {x:[35,281,528,770,1016][column],y:group.y,w:[231,231,230,231,231][column],h:group.h};
}
async function mandarinBackCanvas({width=1650,height=2550}={}){
 await document.fonts.load('800 20px Outfit');
 if(!mandarinBackArtwork)mandarinBackArtwork=await loadCanvasImage(MANDARIN_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/1280,height/1920);
 ctx.drawImage(mandarinBackArtwork,0,0,1280,1920);
 const slots=mandarinBackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 mandarinBackGroups.forEach((group,groupIndex)=>{
  drawMandarinBackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<5;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b={x:[35,281,528,770,1016][column],y:group.y,w:[231,231,230,231,231][column],h:group.h};
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);
   ctx.fillStyle='#ffcf00';roundRect(ctx,b.x+29,b.y+b.h-53,b.w-58,41,20);ctx.fill();
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
    ctx.textAlign='center';ctx.fillStyle='#07155b';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#07155b';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b1 \u2014',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function mandarinBackLabel(index){return mandarinBackState().groupNames[index]?.trim()||mandarinBackGroups[index].name}
function drawMandarinBackHeader(ctx,group,index){
 ctx.save();ctx.fillStyle='#071b75';roundRect(ctx,29,group.headerY,1222,48,24);ctx.fill();
 const title=mandarinBackLabel(index).toUpperCase();let size=39;
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
 while(ctx.measureText(title).width>1160&&size>16){size--;ctx.font=`800 ${size}px Outfit, Arial, sans-serif`}
 ctx.fillStyle='#ffcf00';ctx.fillText(title,48,group.headerY+24,1160);
 const start=48+ctx.measureText(title).width+18;
 if(start<1200){ctx.strokeStyle='#ffcf00';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,group.headerY+24);ctx.lineTo(1218,group.headerY+24);ctx.stroke()}
 ctx.restore();
}
function syncMandarinBackControls(){
 let panel=$('mandarinBackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='mandarinBackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  mandarinBackGroups.forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='mandarinBackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{mandarinBackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{mandarinBackState().groupNames=mandarinBackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==MANDARIN_BACK_ID;
 if(!panel.hidden)mandarinBackGroups.forEach((group,index)=>{const input=$('mandarinBackLabel-'+index);if(document.activeElement!==input)input.value=mandarinBackState().groupNames[index]??group.name});
}
