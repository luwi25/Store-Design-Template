// Editable product cards over the supplied Weldon Babag artwork.
const BABAG_V2_FRONT_ID='weldon-babag-v2-front';
const BABAG_V2_FRONT_ART=__BABAG_V2_FRONT_ART__;
const babagV2FrontSeeds=__BABAG_V2_FRONT_SEEDS__;
const babagV2FrontGroups=[{"name": "Storage Units", "headerX": 50, "headerY": 607, "headerW": 950, "boxes": [[30, 690, 210, 270], [260, 690, 210, 270], [490, 690, 210, 270], [720, 690, 210, 270], [945, 690, 210, 270]], "photoHeights": [155, 155, 155, 155, 155]}, {"name": "Houseware", "headerX": 50, "headerY": 1005, "headerW": 950, "boxes": [[30, 1090, 210, 265], [260, 1090, 210, 265], [490, 1090, 210, 265], [720, 1090, 210, 265], [945, 1090, 210, 265]], "photoHeights": [160, 160, 160, 160, 160]}, {"name": "Kitchenware & Tableware", "headerX": 50, "headerY": 1410, "headerW": 950, "boxes": [[30, 1490, 210, 240], [260, 1490, 210, 240], [490, 1490, 210, 240], [720, 1490, 210, 240], [945, 1490, 210, 240]], "photoHeights": [125, 125, 125, 125, 125]}, {"name": "Electric Fan", "headerX": 50, "headerY": 1777, "headerW": 950, "boxes": [[30, 1850, 210, 235], [260, 1850, 210, 235], [490, 1850, 210, 235], [720, 1850, 210, 235], [945, 1850, 210, 235]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Plasticware", "headerX": 50, "headerY": 2130, "headerW": 950, "boxes": [[30, 2200, 210, 235], [260, 2200, 210, 235], [490, 2200, 210, 235], [720, 2200, 210, 235], [945, 2200, 210, 235]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Electric Fan", "headerX": 1230, "headerY": 105, "headerW": 1020, "headerH": 110, "boxes": [[1215, 275, 325, 510], [1595, 275, 320, 510], [1970, 275, 320, 510], [1330, 850, 385, 460], [1785, 850, 390, 460]], "photoHeights": [345, 345, 345, 295, 295]}, {"name": "Plasticware, Kitchenware, Cookware & More!", "headerX": 1230, "headerY": 1390, "headerW": 1020, "headerH": 125, "boxes": [[1225, 1580, 315, 365], [1595, 1580, 320, 365], [1970, 1580, 320, 365], [1330, 2005, 385, 350], [1785, 2005, 390, 350]], "photoHeights": [220, 220, 220, 205, 205]}].map((group,index)=>({...group,items:babagV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let babagV2FrontArtwork=null;
function babagV2FrontState(){
 if(!state.babagV2Front)state.babagV2Front={slots:babagV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.babagV2Front.groupNames))state.babagV2Front.groupNames=babagV2FrontGroups.map(g=>g.name);
 return state.babagV2Front;
}

function seedBabagV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of babagV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 babagV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[BABAG_V2_FRONT_ID] ||= 'Template #2 - WELDON BABAG - FRONT';
 if(!state.templateSettings[BABAG_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[BABAG_V2_FRONT_ID]={poster:{...defaults.poster,store:'WELDON BABAG',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function babagV2FrontCard(index){
 const slots=babagV2FrontState().slots,slot=slots[index],group=babagV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function babagV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!babagV2FrontArtwork)babagV2FrontArtwork=await loadCanvasImage(BABAG_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(babagV2FrontArtwork,0,0,3508,2480);
 const slots=babagV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 babagV2FrontGroups.forEach((group,groupIndex)=>{
  drawBabagV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=babagV2FrontCard(index),large=groupIndex>=5;
   ctx.save();roundRect(ctx,b.x-3,b.y-8,b.w+6,b.h+16,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x-3,b.y-8,b.w+6,b.h+16);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:36)*textScale('sale',slot),priceBaseline=b.y+b.h-12;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===babagV2FrontSeeds[index]?.name){
     const seed=babagV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(babagV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
    }
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#ff0000';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b10.00',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function babagV2FrontLabel(index){return babagV2FrontState().groupNames[index]?.trim()||babagV2FrontGroups[index].name}
function drawBabagV2FrontHeader(ctx,group,index){
 if(babagV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#ffcf00';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#000';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(babagV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncBabagV2FrontControls(){
 let panel=$('babagV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='babagV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  babagV2FrontGroups.slice(0,7).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='babagV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{babagV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{babagV2FrontState().groupNames=babagV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==BABAG_V2_FRONT_ID;
 if(!panel.hidden)babagV2FrontGroups.slice(0,7).forEach((group,index)=>{const input=$('babagV2FrontLabel-'+index);if(document.activeElement!==input)input.value=babagV2FrontState().groupNames[index]??group.name});
}
