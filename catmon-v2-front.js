// Editable product cards over the supplied Mandarin Catmon artwork.
const CATMON_V2_FRONT_ID='mandarin-catmon-v2-front';
const CATMON_V2_FRONT_ART=__CATMON_V2_FRONT_ART__;
const catmonV2FrontSeeds=__CATMON_V2_FRONT_SEEDS__;
const catmonV2FrontGroups=[{"name": "Storage Units", "headerX": 220, "headerY": 695, "headerW": 520, "boxes": [[55, 800, 195, 290], [290, 800, 195, 290], [510, 800, 195, 290], [730, 800, 195, 290], [945, 800, 195, 290]], "photoHeights": [175, 175, 175, 175, 175]}, {"name": "Houseware", "headerX": 220, "headerY": 1150, "headerW": 520, "boxes": [[55, 1240, 195, 270], [290, 1240, 195, 270], [510, 1240, 195, 270], [730, 1240, 195, 270], [945, 1240, 195, 270]], "photoHeights": [170, 170, 170, 170, 170]}, {"name": "Kitchenware & Tableware", "headerX": 220, "headerY": 1570, "headerW": 760, "boxes": [[55, 1670, 195, 235], [290, 1670, 195, 235], [510, 1670, 195, 235], [730, 1670, 195, 235], [945, 1670, 195, 235]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Plasticware", "headerX": 220, "headerY": 1965, "headerW": 520, "boxes": [[55, 2050, 195, 245], [290, 2050, 195, 245], [510, 2050, 195, 245], [730, 2050, 195, 245], [945, 2050, 195, 245]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Electric Fan", "headerX": 1460, "headerY": 235, "headerW": 770, "headerH": 100, "boxes": [[1210, 405, 340, 495], [1585, 405, 335, 495], [1955, 405, 340, 495], [1290, 945, 440, 405], [1775, 945, 445, 405]], "photoHeights": [325, 325, 325, 270, 270]}, {"name": "Cookware, Kitchenware & More", "headerX": 1450, "headerY": 1430, "headerW": 810, "headerH": 125, "boxes": [[1210, 1620, 345, 340], [1585, 1620, 335, 340], [1960, 1620, 330, 340], [1310, 2005, 420, 350], [1775, 2005, 425, 350]], "photoHeights": [200, 200, 200, 215, 215]}].map((group,index)=>({...group,items:catmonV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let catmonV2FrontArtwork=null;
function catmonV2FrontState(){
 if(!state.catmonV2Front)state.catmonV2Front={slots:catmonV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.catmonV2Front.groupNames))state.catmonV2Front.groupNames=catmonV2FrontGroups.map(g=>g.name);
 return state.catmonV2Front;
}

function seedCatmonV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of catmonV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 catmonV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[CATMON_V2_FRONT_ID] ||= 'Template #2 - MANDARIN CATMON - FRONT';
 if(!state.templateSettings[CATMON_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[CATMON_V2_FRONT_ID]={poster:{...defaults.poster,store:'MANDARIN CATMON',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function catmonV2FrontCard(index){
 const slots=catmonV2FrontState().slots,slot=slots[index],group=catmonV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function catmonV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!catmonV2FrontArtwork)catmonV2FrontArtwork=await loadCanvasImage(CATMON_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(catmonV2FrontArtwork,0,0,3508,2480);
 const slots=catmonV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 catmonV2FrontGroups.forEach((group,groupIndex)=>{
  drawCatmonV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=catmonV2FrontCard(index),large=groupIndex>=4;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===catmonV2FrontSeeds[index]?.name){
     const seed=catmonV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(catmonV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function catmonV2FrontLabel(index){return catmonV2FrontState().groupNames[index]?.trim()||catmonV2FrontGroups[index].name}
function drawCatmonV2FrontHeader(ctx,group,index){
 if(catmonV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#003b85';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(catmonV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncCatmonV2FrontControls(){
 let panel=$('catmonV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='catmonV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  catmonV2FrontGroups.slice(0,6).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='catmonV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{catmonV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{catmonV2FrontState().groupNames=catmonV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==CATMON_V2_FRONT_ID;
 if(!panel.hidden)catmonV2FrontGroups.slice(0,6).forEach((group,index)=>{const input=$('catmonV2FrontLabel-'+index);if(document.activeElement!==input)input.value=catmonV2FrontState().groupNames[index]??group.name});
}
