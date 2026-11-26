// Editable product cards over the supplied Mandarin Catmon artwork.
const CATMON_V2_BACK_ID='mandarin-catmon-v2-back';
const CATMON_V2_BACK_ART=__CATMON_V2_BACK_ART__;
const catmonV2BackSeeds=__CATMON_V2_BACK_SEEDS__;
const catmonV2BackGroups=[{"name": "Storage Units", "headerX": 220, "headerY": 465, "headerW": 530, "boxes": [[50, 555, 195, 265], [285, 555, 195, 265], [505, 555, 195, 265], [725, 555, 195, 265], [943, 555, 195, 265]], "photoHeights": [150, 150, 150, 150, 150]}, {"name": "Houseware", "headerX": 220, "headerY": 865, "headerW": 530, "boxes": [[50, 950, 195, 275], [285, 950, 195, 275], [505, 950, 195, 275], [725, 950, 195, 275], [943, 950, 195, 275]], "photoHeights": [160, 160, 160, 160, 160]}, {"name": "Kitchenware & Tableware", "headerX": 220, "headerY": 1270, "headerW": 780, "boxes": [[50, 1365, 195, 235], [285, 1365, 195, 235], [505, 1365, 195, 235], [725, 1365, 195, 235], [943, 1365, 195, 235]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Electric Fan", "headerX": 220, "headerY": 1640, "headerW": 530, "boxes": [[50, 1725, 195, 245], [285, 1725, 195, 245], [505, 1725, 195, 245], [725, 1725, 195, 245], [943, 1725, 195, 245]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Plasticware", "headerX": 220, "headerY": 2010, "headerW": 530, "boxes": [[50, 2090, 195, 210], [285, 2090, 195, 210], [505, 2090, 195, 210], [725, 2090, 195, 210], [943, 2090, 195, 210]], "photoHeights": [110, 110, 110, 110, 110]}, {"name": "Storage Units", "headerX": 1390, "headerY": 465, "headerW": 530, "boxes": [[1215, 555, 195, 265], [1445, 555, 195, 265], [1670, 555, 195, 265], [1890, 555, 195, 265], [2105, 555, 195, 265]], "photoHeights": [150, 150, 150, 150, 150]}, {"name": "Houseware", "headerX": 1390, "headerY": 865, "headerW": 530, "boxes": [[1215, 950, 195, 275], [1445, 950, 195, 275], [1670, 950, 195, 275], [1890, 950, 195, 275], [2105, 950, 195, 275]], "photoHeights": [160, 160, 160, 160, 160]}, {"name": "Kitchenware & Tableware", "headerX": 1390, "headerY": 1270, "headerW": 780, "boxes": [[1215, 1365, 195, 235], [1445, 1365, 195, 235], [1670, 1365, 195, 235], [1890, 1365, 195, 235], [2105, 1365, 195, 235]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Electric Fan", "headerX": 1390, "headerY": 1640, "headerW": 530, "boxes": [[1215, 1725, 195, 245], [1445, 1725, 195, 245], [1670, 1725, 195, 245], [1890, 1725, 195, 245], [2105, 1725, 195, 245]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Plasticware", "headerX": 1390, "headerY": 2010, "headerW": 530, "boxes": [[1215, 2090, 195, 210], [1445, 2090, 195, 210], [1670, 2090, 195, 210], [1890, 2090, 195, 210], [2105, 2090, 195, 210]], "photoHeights": [110, 110, 110, 110, 110]}].map((group,index)=>({...group,items:catmonV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let catmonV2BackArtwork=null;
function catmonV2BackState(){
 if(!state.catmonV2Back)state.catmonV2Back={slots:catmonV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.catmonV2Back.groupNames))state.catmonV2Back.groupNames=catmonV2BackGroups.map(g=>g.name);
 return state.catmonV2Back;
}

function seedCatmonV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of catmonV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 catmonV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[CATMON_V2_BACK_ID] ||= 'Template #2 - MANDARIN CATMON - BACK';
 if(!state.templateSettings[CATMON_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[CATMON_V2_BACK_ID]={poster:{...defaults.poster,store:'MANDARIN CATMON',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function catmonV2BackCard(index){
 const slots=catmonV2BackState().slots,slot=slots[index],group=catmonV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function catmonV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!catmonV2BackArtwork)catmonV2BackArtwork=await loadCanvasImage(CATMON_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(catmonV2BackArtwork,0,0,3508,2480);
 const slots=catmonV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 catmonV2BackGroups.forEach((group,groupIndex)=>{
  drawCatmonV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=catmonV2BackCard(index),large=false;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===catmonV2BackSeeds[index]?.name){
     const seed=catmonV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(catmonV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function catmonV2BackLabel(index){return catmonV2BackState().groupNames[index]?.trim()||catmonV2BackGroups[index].name}
function drawCatmonV2BackHeader(ctx,group,index){
 if(catmonV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#003b85';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(catmonV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncCatmonV2BackControls(){
 let panel=$('catmonV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='catmonV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  catmonV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='catmonV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{catmonV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{catmonV2BackState().groupNames=catmonV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==CATMON_V2_BACK_ID;
 if(!panel.hidden)catmonV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('catmonV2BackLabel-'+index);if(document.activeElement!==input)input.value=catmonV2BackState().groupNames[index]??group.name});
}
