// Editable product cards over the supplied Kazumi Opon artwork.
const OPON_V2_FRONT_ID='kazumi-opon-v2-front';
const OPON_V2_FRONT_ART=__OPON_V2_FRONT_ART__;
const oponV2FrontSeeds=__OPON_V2_FRONT_SEEDS__;
const oponV2FrontGroups=[{"name": "Storage Units", "headerX": 35, "headerY": 345, "headerW": 660, "boxes": [[40, 470, 195, 225], [265, 470, 195, 225], [485, 470, 195, 225], [705, 470, 195, 225], [925, 470, 195, 225]], "photoHeights": [120, 120, 120, 120, 120]}, {"name": "Houseware", "headerX": 35, "headerY": 755, "headerW": 660, "boxes": [[40, 880, 195, 210], [265, 880, 195, 210], [485, 880, 195, 210], [705, 880, 195, 210], [925, 880, 195, 210]], "photoHeights": [110, 110, 110, 110, 110]}, {"name": "Kitchenware & Tableware", "headerX": 35, "headerY": 1150, "headerW": 1000, "boxes": [[40, 1280, 195, 205], [265, 1280, 195, 205], [485, 1280, 195, 205], [705, 1280, 195, 205], [925, 1280, 195, 205]], "photoHeights": [105, 105, 105, 105, 105]}, {"name": "Electric Fan", "headerX": 35, "headerY": 1535, "headerW": 660, "boxes": [[40, 1645, 195, 195], [265, 1645, 195, 195], [485, 1645, 195, 195], [705, 1645, 195, 195], [925, 1645, 195, 195]], "photoHeights": [95, 95, 95, 95, 95]}, {"name": "Plasticware", "headerX": 35, "headerY": 1895, "headerW": 660, "boxes": [[40, 2005, 195, 205], [265, 2005, 195, 205], [485, 2005, 195, 205], [705, 2005, 195, 205], [925, 2005, 195, 205]], "photoHeights": [105, 105, 105, 105, 105]}, {"name": "Electric Fan", "headerX": 1290, "headerY": 175, "headerW": 950, "headerH": 135, "boxes": [[1215, 390, 330, 485], [1590, 390, 335, 485], [1970, 390, 325, 485], [1275, 925, 455, 390], [1785, 925, 445, 390]], "photoHeights": [320, 320, 320, 260, 260]}, {"name": "Plasticware, Kitchenware, Cookware & More!", "headerX": 1220, "headerY": 1390, "headerW": 1065, "headerH": 145, "boxes": [[1215, 1590, 325, 320], [1580, 1590, 345, 320], [1965, 1590, 335, 320], [1280, 1955, 445, 355], [1785, 1955, 440, 355]], "photoHeights": [190, 190, 190, 220, 220]}].map((group,index)=>({...group,items:oponV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let oponV2FrontArtwork=null;
function oponV2FrontState(){
 if(!state.oponV2Front)state.oponV2Front={slots:oponV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.oponV2Front.groupNames))state.oponV2Front.groupNames=oponV2FrontGroups.map(g=>g.name);
 return state.oponV2Front;
}

function seedOponV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of oponV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 oponV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[OPON_V2_FRONT_ID] ||= 'Template #2 - KAZUMI OPON - FRONT';
 if(!state.templateSettings[OPON_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[OPON_V2_FRONT_ID]={poster:{...defaults.poster,store:'KAZUMI OPON',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function oponV2FrontCard(index){
 const slots=oponV2FrontState().slots,slot=slots[index],group=oponV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function oponV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!oponV2FrontArtwork)oponV2FrontArtwork=await loadCanvasImage(OPON_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(oponV2FrontArtwork,0,0,3508,2480);
 const slots=oponV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 oponV2FrontGroups.forEach((group,groupIndex)=>{
  drawOponV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=oponV2FrontCard(index),large=groupIndex>=5;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:23)*textScale('name',slot));
    const priceSize=(large?60:36)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===oponV2FrontSeeds[index]?.name){
     const seed=oponV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){if(index<25){ctx.save();ctx.fillStyle='#555';ctx.textAlign='center';ctx.font='600 28px Outfit, Arial, sans-serif';ctx.fillText('Insert',b.x+b.w/2,b.y+photoH/2-4);ctx.fillText('Product',b.x+b.w/2,b.y+photoH/2+27);ctx.restore()}else{const sourceH=group.photoHeights[column]-25,sourceW=b.w-30,scale=Math.min((b.w-16)/sourceW,photoH/sourceH);ctx.drawImage(oponV2FrontArtwork,b.x+15,b.y+15,sourceW,sourceH,b.x+(b.w-sourceW*scale)/2,b.y+7+(photoH-sourceH*scale)/2,sourceW*scale,sourceH*scale)}}
    }
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){if(large){ctx.fillStyle='#d00000';roundRect(ctx,b.x+12,priceBaseline-priceSize+2,b.w-24,priceSize+10,24);ctx.fill()}ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle=large?'#fff':'#d00000';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b10.00',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function oponV2FrontLabel(index){return oponV2FrontState().groupNames[index]?.trim()||oponV2FrontGroups[index].name}
function drawOponV2FrontHeader(ctx,group,index){
 if(oponV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#a00010';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(oponV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncOponV2FrontControls(){
 let panel=$('oponV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='oponV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  oponV2FrontGroups.slice(0,7).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='oponV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{oponV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{oponV2FrontState().groupNames=oponV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==OPON_V2_FRONT_ID;
 if(!panel.hidden)oponV2FrontGroups.slice(0,7).forEach((group,index)=>{const input=$('oponV2FrontLabel-'+index);if(document.activeElement!==input)input.value=oponV2FrontState().groupNames[index]??group.name});
}
