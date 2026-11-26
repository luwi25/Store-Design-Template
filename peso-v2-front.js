// Editable product cards over the supplied Pesoplus Mambaling artwork.
const PESO_V2_FRONT_ID='peso-v2-front';
const PESO_V2_FRONT_ART=__PESO_V2_FRONT_ART__;
const pesoV2FrontSeeds=__PESO_V2_FRONT_SEEDS__;
const pesoV2FrontGroups=[{"name": "Storage Units", "headerX": 60, "headerY": 450, "headerW": 1050, "boxes": [[65, 538, 205, 325], [290, 538, 205, 325], [510, 538, 205, 325], [730, 538, 205, 325], [935, 538, 205, 325]], "photoHeights": [190, 190, 190, 190, 190]}, {"name": "Houseware", "headerX": 60, "headerY": 914, "headerW": 1050, "boxes": [[65, 996, 205, 307], [290, 996, 205, 307], [510, 996, 205, 307], [730, 996, 205, 307], [935, 996, 205, 307]], "photoHeights": [191, 191, 191, 191, 162]}, {"name": "Kitchenware & Tableware", "headerX": 60, "headerY": 1359, "headerW": 1050, "boxes": [[65, 1440, 205, 260], [290, 1440, 205, 260], [510, 1440, 205, 260], [730, 1440, 205, 260], [935, 1440, 205, 260]], "photoHeights": [143, 143, 143, 143, 143]}, {"name": "Electric Fan", "headerX": 60, "headerY": 1753, "headerW": 1050, "boxes": [[65, 1830, 205, 284], [290, 1830, 205, 284], [510, 1830, 205, 284], [730, 1830, 205, 284], [935, 1830, 205, 284]], "photoHeights": [168, 168, 168, 168, 168]}, {"name": "Plasticware", "headerX": 60, "headerY": 2163, "headerW": 1050, "boxes": [[65, 2240, 205, 211], [290, 2240, 205, 211], [510, 2240, 205, 211], [730, 2240, 205, 211], [935, 2240, 205, 211]], "photoHeights": [96, 96, 96, 96, 96]}, {"name": "Kitchenware", "headerX": 1220, "headerY": 511, "headerW": 1040, "boxes": [[1215, 620, 205, 455], [1430, 620, 205, 455], [1650, 620, 205, 455], [1867, 620, 205, 455], [2080, 620, 205, 455]], "photoHeights": [260, 260, 260, 260, 260]}, {"name": "Cookware", "headerX": 1220, "headerY": 1163, "headerW": 1040, "boxes": [[1215, 1264, 205, 423], [1430, 1264, 205, 423], [1650, 1264, 205, 423], [1867, 1264, 205, 423], [2080, 1264, 205, 423]], "photoHeights": [220, 220, 220, 220, 220]}, {"name": "Plasticware", "headerX": 1220, "headerY": 1768, "headerW": 1040, "boxes": [[1215, 1880, 205, 480], [1430, 1880, 205, 480], [1650, 1880, 205, 480], [1867, 1880, 205, 480], [2080, 1880, 205, 480]], "photoHeights": [267, 267, 267, 267, 267]}].map((group,index)=>({...group,items:pesoV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let pesoV2FrontArtwork=null;
function pesoV2FrontState(){
 if(!state.pesoV2Front)state.pesoV2Front={slots:pesoV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.pesoV2Front.groupNames))state.pesoV2Front.groupNames=pesoV2FrontGroups.map(g=>g.name);
 return state.pesoV2Front;
}

function seedPesoV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of pesoV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 pesoV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[PESO_V2_FRONT_ID] ||= 'Template #3 - PESOPLUS MAMBALING - FRONT';
 if(!state.templateSettings[PESO_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[PESO_V2_FRONT_ID]={poster:{...defaults.poster,store:'PESOPLUS MAMBALING',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function pesoV2FrontCard(index){
 const slots=pesoV2FrontState().slots,slot=slots[index],group=pesoV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function pesoV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!pesoV2FrontArtwork)pesoV2FrontArtwork=await loadCanvasImage(PESO_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(pesoV2FrontArtwork,0,0,3508,2480);
 const slots=pesoV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 pesoV2FrontGroups.forEach((group,groupIndex)=>{
  drawPesoV2FrontHeader(ctx,group,groupIndex);
  ctx.fillStyle='#fff';const first=group.boxes[0],last=group.boxes[group.boxes.length-1];ctx.fillRect(groupIndex<5?52:1207,first[1]-8,groupIndex<5?1069:1070,first[3]+16);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=pesoV2FrontCard(index),large=false;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===pesoV2FrontSeeds[index]?.name){
     const seed=pesoV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(pesoV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function pesoV2FrontLabel(index){return pesoV2FrontState().groupNames[index]?.trim()||pesoV2FrontGroups[index].name}
function drawPesoV2FrontHeader(ctx,group,index){
 if(pesoV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#003b91';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(pesoV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncPesoV2FrontControls(){
 let panel=$('pesoV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='pesoV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  pesoV2FrontGroups.slice(0,8).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='pesoV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{pesoV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{pesoV2FrontState().groupNames=pesoV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==PESO_V2_FRONT_ID;
 if(!panel.hidden)pesoV2FrontGroups.slice(0,8).forEach((group,index)=>{const input=$('pesoV2FrontLabel-'+index);if(document.activeElement!==input)input.value=pesoV2FrontState().groupNames[index]??group.name});
}
