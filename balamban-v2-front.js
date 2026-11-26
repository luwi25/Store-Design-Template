// Editable product cards over the supplied Unico Balamban artwork.
const BALAMBAN_V2_FRONT_ID='unico-balamban-v2-front';
const BALAMBAN_V2_FRONT_ART=__BALAMBAN_V2_FRONT_ART__;
const balambanV2FrontSeeds=__BALAMBAN_V2_FRONT_SEEDS__;
const balambanV2FrontGroups=[{"name": "Storage Units", "headerX": 55, "headerY": 620, "headerW": 650, "boxes": [[40, 720, 218, 320], [280, 720, 198, 320], [498, 720, 201, 320], [716, 720, 200, 320], [935, 720, 200, 320]], "photoHeights": [175, 175, 175, 175, 175]}, {"name": "Houseware", "headerX": 55, "headerY": 1090, "headerW": 650, "boxes": [[40, 1185, 218, 290], [280, 1185, 198, 290], [498, 1185, 201, 290], [716, 1185, 200, 290], [935, 1185, 200, 290]], "photoHeights": [155, 155, 155, 155, 155]}, {"name": "Kitchenware & Tableware", "headerX": 55, "headerY": 1525, "headerW": 970, "boxes": [[40, 1620, 218, 265], [280, 1620, 198, 265], [498, 1620, 201, 265], [716, 1620, 200, 265], [935, 1620, 200, 265]], "photoHeights": [125, 125, 125, 125, 125]}, {"name": "Plasticware", "headerX": 55, "headerY": 1940, "headerW": 650, "boxes": [[40, 2025, 218, 265], [280, 2025, 198, 265], [498, 2025, 201, 265], [716, 2025, 200, 265], [935, 2025, 200, 265]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Electric Fan", "headerX": 1270, "headerY": 210, "headerW": 950, "headerH": 100, "boxes": [[1205, 370, 340, 480], [1585, 370, 335, 480], [1960, 370, 340, 480], [1290, 895, 440, 405], [1770, 895, 445, 405]], "photoHeights": [310, 310, 310, 260, 260]}, {"name": "Cookware, Kitchenware & More", "headerX": 1230, "headerY": 1390, "headerW": 1030, "headerH": 125, "boxes": [[1210, 1575, 335, 330], [1590, 1575, 330, 330], [1960, 1575, 340, 330], [1295, 1950, 440, 370], [1780, 1950, 440, 370]], "photoHeights": [180, 180, 180, 230, 230]}].map((group,index)=>({...group,items:balambanV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let balambanV2FrontArtwork=null;
function balambanV2FrontState(){
 if(!state.balambanV2Front)state.balambanV2Front={slots:balambanV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.balambanV2Front.groupNames))state.balambanV2Front.groupNames=balambanV2FrontGroups.map(g=>g.name);
 return state.balambanV2Front;
}

function seedBalambanV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of balambanV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 balambanV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[BALAMBAN_V2_FRONT_ID] ||= 'Template #2 - UNICO BALAMBAN - FRONT';
 if(!state.templateSettings[BALAMBAN_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[BALAMBAN_V2_FRONT_ID]={poster:{...defaults.poster,store:'UNICO BALAMBAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function balambanV2FrontCard(index){
 const slots=balambanV2FrontState().slots,slot=slots[index],group=balambanV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function balambanV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!balambanV2FrontArtwork)balambanV2FrontArtwork=await loadCanvasImage(BALAMBAN_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(balambanV2FrontArtwork,0,0,3508,2480);
 const slots=balambanV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 balambanV2FrontGroups.forEach((group,groupIndex)=>{
  drawBalambanV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=balambanV2FrontCard(index),large=groupIndex>=4;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===balambanV2FrontSeeds[index]?.name){
     const seed=balambanV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(balambanV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function balambanV2FrontLabel(index){return balambanV2FrontState().groupNames[index]?.trim()||balambanV2FrontGroups[index].name}
function drawBalambanV2FrontHeader(ctx,group,index){
 if(balambanV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#151515';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(balambanV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncBalambanV2FrontControls(){
 let panel=$('balambanV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='balambanV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  balambanV2FrontGroups.slice(0,6).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='balambanV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{balambanV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{balambanV2FrontState().groupNames=balambanV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==BALAMBAN_V2_FRONT_ID;
 if(!panel.hidden)balambanV2FrontGroups.slice(0,6).forEach((group,index)=>{const input=$('balambanV2FrontLabel-'+index);if(document.activeElement!==input)input.value=balambanV2FrontState().groupNames[index]??group.name});
}
