// Editable product cards over the supplied Felcon Bato artwork.
const FELCON_BACK_ID='felcon-bato-back';
const FELCON_BACK_ART=__FELCON_BACK_ART__;
const felconBackSeeds=__FELCON_BACK_SEEDS__;
const felconBackGroups=[{"name": "Storage Units", "headerY": 225, "y": 290, "h": 220}, {"name": "Houseware", "headerY": 522, "y": 585, "h": 263}, {"name": "Kitchenware & Tableware", "headerY": 859, "y": 926, "h": 261}, {"name": "Electric Fan", "headerY": 1198, "y": 1260, "h": 240}, {"name": "Plasticware", "headerY": 1512, "y": 1572, "h": 204}].map((group,index)=>({...group,items:felconBackSeeds.slice(index*5,index*5+5).map(p=>[p.name,p.price])}));
let felconBackArtwork=null;
function felconBackState(){
 if(!state.felconBack)state.felconBack={slots:felconBackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:Math.floor(index/5),discountPercent:0}))};
 if(!Array.isArray(state.felconBack.groupNames))state.felconBack.groupNames=felconBackGroups.map(g=>g.name);
 return state.felconBack;
}

function seedFelconBack(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of felconBackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 felconBackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[FELCON_BACK_ID] ||= 'Template #1 - FELCON BATO - BACK';
 if(!state.templateSettings[FELCON_BACK_ID]){
  const defaults=starter();
  state.templateSettings[FELCON_BACK_ID]={poster:{...defaults.poster,store:'FELCON BATO',paper:'letter',fit:'half'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function felconBackCard(index){
 const slots=felconBackState().slots,slot=slots[index],group=felconBackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 return {x:31+column*247,y:group.y,w:237,h:group.h};
}
async function felconBackCanvas({width=1650,height=2550}={}){
 await document.fonts.load('800 20px Outfit');
 if(!felconBackArtwork)felconBackArtwork=await loadCanvasImage(FELCON_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/1280,height/1920);
 ctx.drawImage(felconBackArtwork,0,0,1280,1920);
 const slots=felconBackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 felconBackGroups.forEach((group,groupIndex)=>{
  drawFelconBackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<5;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b={x:31+column*247,y:group.y,w:237,h:group.h};
   ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);
   ctx.strokeStyle='#f6cb39';ctx.lineWidth=1.5;roundRect(ctx,b.x+1,b.y+1,b.w-2,b.h-2,16);ctx.fill();ctx.stroke();
   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,21*textScale('name',slot));
    const priceSize=38*textScale('sale',slot),priceBaseline=b.y+b.h-10;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#00358b';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#00358b';ctx.fillText(money(salePrice(product,slot)),b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function felconBackLabel(index){return felconBackState().groupNames[index]?.trim()||felconBackGroups[index].name}
function drawFelconBackHeader(ctx,group,index){
 ctx.save();ctx.fillStyle='#0039a6';roundRect(ctx,29,group.headerY,1222,56,24);ctx.fill();
 const title=felconBackLabel(index).toUpperCase();let size=39;
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
 while(ctx.measureText(title).width>1160&&size>16){size--;ctx.font=`800 ${size}px Outfit, Arial, sans-serif`}
 ctx.fillStyle='#fff200';ctx.fillText(title,48,group.headerY+28,1160);
 const start=48+ctx.measureText(title).width+18;
 if(start<1200){ctx.strokeStyle='#fff200';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,group.headerY+29);ctx.lineTo(1218,group.headerY+29);ctx.stroke()}
 ctx.restore();
}
function syncFelconBackControls(){
 let panel=$('felconBackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='felconBackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  felconBackGroups.forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='felconBackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{felconBackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{felconBackState().groupNames=felconBackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==FELCON_BACK_ID;
 if(!panel.hidden)felconBackGroups.forEach((group,index)=>{const input=$('felconBackLabel-'+index);if(document.activeElement!==input)input.value=felconBackState().groupNames[index]??group.name});
}
