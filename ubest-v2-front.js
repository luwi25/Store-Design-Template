// Editable product cards over the supplied UBEST Opon artwork.
const UBEST_V2_FRONT_ID='ubest-opon-v2-front';
const UBEST_V2_FRONT_ART=__UBEST_V2_FRONT_ART__;
const ubestV2FrontSeeds=__UBEST_V2_FRONT_SEEDS__;
const ubestV2FrontGroups=[{"name": "Storage Units", "headerX": 35, "headerY": 365, "headerW": 980, "boxes": [[45, 473, 215, 310], [286, 473, 195, 310], [508, 473, 198, 310], [730, 473, 195, 310], [952, 473, 192, 310]], "photoHeights": [157, 157, 157, 157, 157]}, {"name": "Houseware", "headerX": 35, "headerY": 833, "headerW": 980, "boxes": [[45, 939, 215, 310], [286, 939, 195, 310], [508, 939, 198, 310], [730, 939, 195, 310], [952, 939, 192, 310]], "photoHeights": [170, 170, 170, 170, 170]}, {"name": "Kitchenware & Tableware", "headerX": 35, "headerY": 1300, "headerW": 980, "boxes": [[45, 1407, 215, 253], [286, 1407, 195, 253], [508, 1407, 198, 253], [730, 1407, 195, 253], [952, 1407, 192, 253]], "photoHeights": [137, 137, 137, 137, 137]}, {"name": "Electric Fan", "headerX": 35, "headerY": 1702, "headerW": 980, "boxes": [[45, 1803, 215, 225], [286, 1803, 195, 225], [508, 1803, 198, 225], [730, 1803, 195, 225], [952, 1803, 192, 225]], "photoHeights": [126, 126, 126, 126, 126]}, {"name": "Plasticware", "headerX": 35, "headerY": 2075, "headerW": 980, "boxes": [[45, 2170, 215, 207], [286, 2170, 195, 207], [508, 2170, 198, 207], [730, 2170, 195, 207], [952, 2170, 192, 207]], "photoHeights": [105, 105, 105, 105, 105]}, {"name": "Kitchenware", "headerX": 1265, "headerY": 98, "headerW": 965, "headerH": 105, "boxes": [[1229, 263, 340, 445], [1613, 263, 325, 445], [1985, 263, 304, 445]], "photoHeights": [270, 270, 270]}, {"name": "Cookware", "headerX": 1265, "headerY": 778, "headerW": 965, "headerH": 105, "boxes": [[1229, 927, 340, 343], [1613, 927, 325, 343], [1985, 927, 304, 343]], "photoHeights": [191, 191, 191]}, {"name": "Tableware", "headerX": 1265, "headerY": 1325, "headerW": 965, "headerH": 105, "boxes": [[1229, 1463, 340, 359], [1613, 1463, 325, 359], [1985, 1463, 304, 359]], "photoHeights": [220, 220, 220]}, {"name": "Plasticware", "headerX": 1265, "headerY": 1880, "headerW": 965, "headerH": 105, "boxes": [[1229, 2015, 340, 358], [1613, 2015, 325, 358], [1985, 2015, 304, 358]], "photoHeights": [215, 215, 195]}].map((group,index)=>({...group,items:ubestV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let ubestV2FrontArtwork=null;
function ubestV2FrontState(){
 if(!state.ubestV2Front)state.ubestV2Front={slots:ubestV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.ubestV2Front.groupNames))state.ubestV2Front.groupNames=ubestV2FrontGroups.map(g=>g.name);
 return state.ubestV2Front;
}

function seedUbestV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of ubestV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 ubestV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[UBEST_V2_FRONT_ID] ||= 'Template #2 - UBEST OPON - FRONT';
 if(!state.templateSettings[UBEST_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[UBEST_V2_FRONT_ID]={poster:{...defaults.poster,store:'UBEST OPON',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function ubestV2FrontCard(index){
 const slots=ubestV2FrontState().slots,slot=slots[index],group=ubestV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function ubestV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!ubestV2FrontArtwork)ubestV2FrontArtwork=await loadCanvasImage(UBEST_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(ubestV2FrontArtwork,0,0,3508,2480);
 const slots=ubestV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 ubestV2FrontGroups.forEach((group,groupIndex)=>{
  drawUbestV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=ubestV2FrontCard(index),large=groupIndex>=5;
   ctx.save();roundRect(ctx,b.x-10,b.y-8,b.w+20,b.h+20,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x-10,b.y-8,b.w+20,b.h+20);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(Number(product?.price)>0?(large?60:36):0)*textScale('sale',slot),priceBaseline=b.y+b.h-12;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===ubestV2FrontSeeds[index]?.name){
     const seed=ubestV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(ubestV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
    }
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product&&Number(product.price)>0){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#ff0000';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b10.00',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function ubestV2FrontLabel(index){return ubestV2FrontState().groupNames[index]?.trim()||ubestV2FrontGroups[index].name}
function drawUbestV2FrontHeader(ctx,group,index){
 if(ubestV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#003395';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(ubestV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncUbestV2FrontControls(){
 let panel=$('ubestV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='ubestV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  ubestV2FrontGroups.slice(0,9).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='ubestV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{ubestV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{ubestV2FrontState().groupNames=ubestV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==UBEST_V2_FRONT_ID;
 if(!panel.hidden)ubestV2FrontGroups.slice(0,9).forEach((group,index)=>{const input=$('ubestV2FrontLabel-'+index);if(document.activeElement!==input)input.value=ubestV2FrontState().groupNames[index]??group.name});
}
