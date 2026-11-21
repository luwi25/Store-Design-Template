// Editable product cards over the supplied Oneplus Pardo artwork.
const ONEPLUS_V2_FRONT_ID='oneplus-pardo-v2-front';
const ONEPLUS_V2_FRONT_ART=__ONEPLUS_V2_FRONT_ART__;
const oneplusV2FrontSeeds=__ONEPLUS_V2_FRONT_SEEDS__;
const oneplusV2FrontGroups=[{"name": "Storage Units", "headerX": 48, "headerY": 590, "headerW": 640, "boxes": [[60, 678, 190, 259], [285, 678, 190, 259], [502, 678, 190, 259], [718, 678, 190, 259], [936, 678, 190, 259]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Houseware", "headerX": 48, "headerY": 977, "headerW": 640, "boxes": [[60, 1064, 190, 252], [285, 1064, 190, 252], [502, 1064, 190, 252], [718, 1064, 190, 252], [936, 1064, 190, 252]], "photoHeights": [125, 125, 125, 125, 125]}, {"name": "Kitchenware & Tableware", "headerX": 48, "headerY": 1356, "headerW": 900, "boxes": [[60, 1438, 190, 229], [285, 1438, 190, 229], [502, 1438, 190, 229], [718, 1438, 190, 229], [936, 1438, 190, 229]], "photoHeights": [105, 105, 105, 105, 105]}, {"name": "Electric Fan", "headerX": 48, "headerY": 1700, "headerW": 640, "boxes": [[60, 1775, 190, 218], [285, 1775, 190, 218], [502, 1775, 190, 218], [718, 1775, 190, 218], [936, 1775, 190, 218]], "photoHeights": [117, 117, 117, 117, 117]}, {"name": "Plasticware", "headerX": 48, "headerY": 2024, "headerW": 640, "boxes": [[60, 2095, 190, 199], [285, 2095, 190, 199], [502, 2095, 190, 199], [718, 2095, 190, 199], [936, 2095, 190, 199]], "photoHeights": [83, 83, 83, 83, 83]}, {"name": "Electric Fan", "headerX": 1350, "headerY": 190, "headerW": 840, "boxes": [[1215, 392, 327, 482], [1594, 392, 327, 482], [1972, 392, 327, 482], [1277, 925, 450, 389], [1782, 925, 450, 389]], "photoHeights": [315, 315, 315, 255, 255]}, {"name": "Plasticware, Kitchenware, Cookware & More!", "headerX": 1260, "headerY": 1400, "headerW": 1000, "boxes": [[1218, 1591, 320, 316], [1581, 1591, 349, 316], [1972, 1591, 322, 316], [1282, 1957, 445, 348], [1783, 1957, 441, 348]], "photoHeights": [175, 175, 175, 204, 204]}].map((group,index)=>({...group,items:oneplusV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let oneplusV2FrontArtwork=null;
function oneplusV2FrontState(){
 if(!state.oneplusV2Front)state.oneplusV2Front={slots:oneplusV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.oneplusV2Front.groupNames))state.oneplusV2Front.groupNames=oneplusV2FrontGroups.map(g=>g.name);
 return state.oneplusV2Front;
}

function seedOneplusV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of oneplusV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 oneplusV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[ONEPLUS_V2_FRONT_ID] ||= 'Template #2 - ONEPLUS PARDO - FRONT';
 if(!state.templateSettings[ONEPLUS_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[ONEPLUS_V2_FRONT_ID]={poster:{...defaults.poster,store:'ONEPLUS PARDO',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function oneplusV2FrontCard(index){
 const slots=oneplusV2FrontState().slots,slot=slots[index],group=oneplusV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function oneplusV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!oneplusV2FrontArtwork)oneplusV2FrontArtwork=await loadCanvasImage(ONEPLUS_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(oneplusV2FrontArtwork,0,0,3508,2480);
 const slots=oneplusV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 oneplusV2FrontGroups.forEach((group,groupIndex)=>{
  drawOneplusV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=oneplusV2FrontCard(index),large=groupIndex>=5&&groupIndex<=7;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===oneplusV2FrontSeeds[index]?.name){
     const seed=oneplusV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(oneplusV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
    }
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.fillStyle='#d00000';roundRect(ctx,b.x+12,priceBaseline-priceSize+2,b.w-24,priceSize+10,24);ctx.fill();ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#fff';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b10.00',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function oneplusV2FrontLabel(index){return oneplusV2FrontState().groupNames[index]?.trim()||oneplusV2FrontGroups[index].name}
function drawOneplusV2FrontHeader(ctx,group,index){
 if(index===7||oneplusV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#b00000';roundRect(ctx,group.headerX,group.headerY,group.headerW,index>=5?106:90,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${index>=5?74:52}px Outfit, Arial, sans-serif`;ctx.fillText(oneplusV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(index>=5?53:45),group.headerW-30);ctx.restore();
}
function syncOneplusV2FrontControls(){
 let panel=$('oneplusV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='oneplusV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  oneplusV2FrontGroups.slice(0,7).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='oneplusV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{oneplusV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{oneplusV2FrontState().groupNames=oneplusV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==ONEPLUS_V2_FRONT_ID;
 if(!panel.hidden)oneplusV2FrontGroups.slice(0,7).forEach((group,index)=>{const input=$('oneplusV2FrontLabel-'+index);if(document.activeElement!==input)input.value=oneplusV2FrontState().groupNames[index]??group.name});
}
