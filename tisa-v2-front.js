// Editable product cards over the supplied Home Express Tisa artwork.
const TISA_V2_FRONT_ID='home-express-tisa-v2-front';
const TISA_V2_FRONT_ART=__TISA_V2_FRONT_ART__;
const tisaV2FrontSeeds=__TISA_V2_FRONT_SEEDS__;
const tisaV2FrontGroups=[{"name": "Storage Units", "headerX": 30, "headerY": 543, "headerW": 1090, "boxes": [[50, 640, 208, 293], [289, 640, 190, 293], [510, 640, 179, 293], [719, 640, 183, 293], [936, 640, 183, 293]], "photoHeights": [180, 180, 180, 180, 180]}, {"name": "Houseware", "headerX": 30, "headerY": 975, "headerW": 1090, "boxes": [[50, 1067, 208, 287], [289, 1067, 190, 287], [510, 1067, 179, 287], [719, 1067, 183, 287], [936, 1067, 183, 287]], "photoHeights": [170, 154, 170, 170, 170]}, {"name": "Kitchenware & Tableware", "headerX": 30, "headerY": 1405, "headerW": 1090, "boxes": [[44, 1502, 200, 269], [270, 1502, 197, 269], [487, 1502, 218, 269], [728, 1502, 187, 269], [948, 1502, 180, 269]], "photoHeights": [167, 167, 167, 167, 167]}, {"name": "Electric Fan", "headerX": 30, "headerY": 1810, "headerW": 1090, "boxes": [[43, 1897, 205, 220], [270, 1897, 195, 220], [489, 1897, 203, 220], [718, 1897, 178, 220], [928, 1897, 195, 220]], "photoHeights": [143, 143, 143, 143, 143]}, {"name": "Plasticware", "headerX": 30, "headerY": 2156, "headerW": 1090, "boxes": [[45, 2239, 218, 205], [292, 2239, 194, 205], [503, 2239, 190, 205], [718, 2239, 195, 205], [934, 2239, 191, 205]], "photoHeights": [120, 120, 120, 120, 120]}, {"name": "Electric Fan", "headerX": 1220, "headerY": 90, "headerW": 1020, "headerH": 115, "boxes": [[1221, 271, 317, 515], [1583, 271, 314, 515], [1940, 271, 310, 515], [1304, 846, 383, 461], [1742, 846, 430, 461]], "photoHeights": [350, 350, 350, 298, 298]}, {"name": "Plasticware, Kitchenware, Cookware & More!", "headerX": 1205, "headerY": 1380, "headerW": 1050, "headerH": 180, "boxes": [[1222, 1610, 299, 376], [1567, 1610, 336, 376], [1943, 1610, 306, 376], [1303, 2045, 390, 386], [1746, 2045, 427, 386]], "photoHeights": [230, 230, 230, 235, 235]}].map((group,index)=>({...group,items:tisaV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let tisaV2FrontArtwork=null;
function tisaV2FrontState(){
 if(!state.tisaV2Front)state.tisaV2Front={slots:tisaV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.tisaV2Front.groupNames))state.tisaV2Front.groupNames=tisaV2FrontGroups.map(g=>g.name);
 return state.tisaV2Front;
}

function seedTisaV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of tisaV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 tisaV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[TISA_V2_FRONT_ID] ||= 'Template #2 - HOME EXPRESS TISA - FRONT';
 if(!state.templateSettings[TISA_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[TISA_V2_FRONT_ID]={poster:{...defaults.poster,store:'HOME EXPRESS TISA',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function tisaV2FrontCard(index){
 const slots=tisaV2FrontState().slots,slot=slots[index],group=tisaV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function tisaV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!tisaV2FrontArtwork)tisaV2FrontArtwork=await loadCanvasImage(TISA_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(tisaV2FrontArtwork,0,0,3508,2480);
 const slots=tisaV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 tisaV2FrontGroups.forEach((group,groupIndex)=>{
  drawTisaV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=tisaV2FrontCard(index),large=groupIndex>=5;
   ctx.save();roundRect(ctx,b.x-3,b.y-8,b.w+6,b.h+16,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x-3,b.y-8,b.w+6,b.h+16);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:36)*textScale('sale',slot),priceBaseline=b.y+b.h-12;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===tisaV2FrontSeeds[index]?.name){
     const seed=tisaV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(tisaV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function tisaV2FrontLabel(index){return tisaV2FrontState().groupNames[index]?.trim()||tisaV2FrontGroups[index].name}
function drawTisaV2FrontHeader(ctx,group,index){
 if(tisaV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#ffcf00';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#000';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(tisaV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncTisaV2FrontControls(){
 let panel=$('tisaV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='tisaV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  tisaV2FrontGroups.slice(0,7).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='tisaV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{tisaV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{tisaV2FrontState().groupNames=tisaV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==TISA_V2_FRONT_ID;
 if(!panel.hidden)tisaV2FrontGroups.slice(0,7).forEach((group,index)=>{const input=$('tisaV2FrontLabel-'+index);if(document.activeElement!==input)input.value=tisaV2FrontState().groupNames[index]??group.name});
}
