// Editable product cards over the supplied Weldon Carcar artwork.
const WELDON_BACK_ID='weldon-carcar-back';
const WELDON_BACK_ART=__WELDON_BACK_ART__;
const weldonBackSeeds=__WELDON_BACK_SEEDS__;
const weldonBackGroups=[{"name": "Storage Units", "headerY": 174, "y": 228, "h": 242}, {"name": "Houseware", "headerY": 479, "y": 534, "h": 236}, {"name": "Kitchenware & Tableware", "headerY": 778, "y": 830, "h": 239}, {"name": "Electric Fan", "headerY": 1075, "y": 1128, "h": 217}, {"name": "Plasticware", "headerY": 1350, "y": 1403, "h": 222}].map((group,index)=>({...group,items:weldonBackSeeds.slice(index*5,index*5+5).map(p=>[p.name,p.price])}));
let weldonBackArtwork=null;
function weldonBackState(){
 if(!state.weldonBack)state.weldonBack={slots:weldonBackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:Math.floor(index/5),discountPercent:0}))};
 if(!Array.isArray(state.weldonBack.groupNames))state.weldonBack.groupNames=weldonBackGroups.map(g=>g.name);
 return state.weldonBack;
}

function seedWeldonBack(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of weldonBackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 weldonBackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[WELDON_BACK_ID] ||= 'Template #1 - WELDON CARCAR - BACK';
 if(!state.templateSettings[WELDON_BACK_ID]){
  const defaults=starter();
  state.templateSettings[WELDON_BACK_ID]={poster:{...defaults.poster,store:'WELDON CARCAR',paper:'letter',fit:'half'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function weldonBackCard(index){
 const slots=weldonBackState().slots,slot=slots[index],group=weldonBackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 return {x:[33,281,527,771,1016][column],y:group.y,w:[237,235,232,232,233][column],h:group.h};
}
async function weldonBackCanvas({width=1650,height=2550}={}){
 await document.fonts.load('800 20px Outfit');
 if(!weldonBackArtwork)weldonBackArtwork=await loadCanvasImage(WELDON_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/1280,height/1920);
 ctx.drawImage(weldonBackArtwork,0,0,1280,1920);
 const slots=weldonBackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 weldonBackGroups.forEach((group,groupIndex)=>{
  drawWeldonBackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<5;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b={x:[33,281,527,771,1016][column],y:group.y,w:[237,235,232,232,233][column],h:group.h};
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);
   ctx.fillStyle='#cf0000';roundRect(ctx,b.x+29,b.y+b.h-53,b.w-58,41,20);ctx.fill();
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
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#ffffff';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b1 \u2014',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function weldonBackLabel(index){return weldonBackState().groupNames[index]?.trim()||weldonBackGroups[index].name}
function drawWeldonBackHeader(ctx,group,index){
 ctx.save();ctx.fillStyle='#ac0000';roundRect(ctx,29,group.headerY,1222,48,24);ctx.fill();
 const title=weldonBackLabel(index).toUpperCase();let size=39;
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
 while(ctx.measureText(title).width>1160&&size>16){size--;ctx.font=`800 ${size}px Outfit, Arial, sans-serif`}
 ctx.fillStyle='#ffffff';ctx.fillText(title,48,group.headerY+24,1160);
 const start=48+ctx.measureText(title).width+18;
 if(start<1200){ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,group.headerY+24);ctx.lineTo(1218,group.headerY+24);ctx.stroke()}
 ctx.restore();
}
function syncWeldonBackControls(){
 let panel=$('weldonBackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='weldonBackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  weldonBackGroups.forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='weldonBackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{weldonBackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{weldonBackState().groupNames=weldonBackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==WELDON_BACK_ID;
 if(!panel.hidden)weldonBackGroups.forEach((group,index)=>{const input=$('weldonBackLabel-'+index);if(document.activeElement!==input)input.value=weldonBackState().groupNames[index]??group.name});
}
