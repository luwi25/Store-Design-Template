// Editable product cards over the supplied Alkeia Balamban artwork.
const ALBAL_V2_FRONT_ID='alkeia-balamban-v2-front';
const ALBAL_V2_FRONT_ART=__ALBAL_V2_FRONT_ART__;
const albalV2FrontSeeds=__ALBAL_V2_FRONT_SEEDS__;
const albalV2FrontGroups=[{"name": "Storage Units", "headerX": 45, "headerY": 615, "headerW": 1080, "boxes": [[40, 710, 200, 410], [275, 710, 200, 410], [500, 710, 200, 410], [725, 710, 200, 410], [945, 710, 200, 410]], "photoHeights": [230, 230, 230, 230, 230]}, {"name": "Houseware", "headerX": 45, "headerY": 1175, "headerW": 1080, "boxes": [[40, 1260, 200, 370], [275, 1260, 200, 370], [500, 1260, 200, 370], [725, 1260, 200, 370], [945, 1260, 200, 370]], "photoHeights": [210, 210, 210, 210, 210]}, {"name": "Kitchenware & Tableware", "headerX": 45, "headerY": 1675, "headerW": 1080, "boxes": [[40, 1760, 200, 295], [275, 1760, 200, 295], [500, 1760, 200, 295], [725, 1760, 200, 295], [945, 1760, 200, 295]], "photoHeights": [155, 155, 155, 155, 155]}, {"name": "Plasticware", "headerX": 45, "headerY": 2100, "headerW": 1080, "boxes": [[40, 2160, 200, 270], [275, 2160, 200, 270], [500, 2160, 200, 270], [725, 2160, 200, 270], [945, 2160, 200, 270]], "photoHeights": [155, 155, 155, 155, 155]}, {"name": "Electric Fan", "headerX": 1220, "headerY": 75, "headerW": 1070, "headerH": 95, "boxes": [[1210, 220, 330, 555], [1585, 220, 340, 555], [1965, 220, 335, 555], [1225, 820, 500, 530], [1775, 820, 520, 530]], "photoHeights": [370, 370, 370, 350, 350]}, {"name": "Cookware, Kitchenware & More", "headerX": 1205, "headerY": 1415, "headerW": 1100, "headerH": 70, "boxes": [[1210, 1520, 345, 440], [1590, 1520, 335, 440], [1955, 1520, 345, 440], [1240, 2010, 490, 410], [1780, 2010, 515, 410]], "photoHeights": [260, 260, 260, 250, 250]}].map((group,index)=>({...group,items:albalV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let albalV2FrontArtwork=null;
function albalV2FrontState(){
 if(!state.albalV2Front)state.albalV2Front={slots:albalV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.albalV2Front.groupNames))state.albalV2Front.groupNames=albalV2FrontGroups.map(g=>g.name);
 return state.albalV2Front;
}

function seedAlbalV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of albalV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 albalV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[ALBAL_V2_FRONT_ID] ||= 'Template #2 - ALKEIA BALAMBAN - FRONT';
 if(!state.templateSettings[ALBAL_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[ALBAL_V2_FRONT_ID]={poster:{...defaults.poster,store:'ALKEIA BALAMBAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function albalV2FrontCard(index){
 const slots=albalV2FrontState().slots,slot=slots[index],group=albalV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function albalV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!albalV2FrontArtwork)albalV2FrontArtwork=await loadCanvasImage(ALBAL_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(albalV2FrontArtwork,0,0,3508,2480);
 const slots=albalV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 albalV2FrontGroups.forEach((group,groupIndex)=>{
  drawAlbalV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=albalV2FrontCard(index),large=groupIndex>=4;
   const seed=albalV2FrontSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff8e5';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===albalV2FrontSeeds[index]?.name){
     const seed=albalV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(albalV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
    }
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#a60000';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b1 ____',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function albalV2FrontLabel(index){return albalV2FrontState().groupNames[index]?.trim()||albalV2FrontGroups[index].name}
function drawAlbalV2FrontHeader(ctx,group,index){
 if(albalV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#b00013';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(albalV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncAlbalV2FrontControls(){
 let panel=$('albalV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='albalV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  albalV2FrontGroups.slice(0,6).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='albalV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{albalV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{albalV2FrontState().groupNames=albalV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==ALBAL_V2_FRONT_ID;
 if(!panel.hidden)albalV2FrontGroups.slice(0,6).forEach((group,index)=>{const input=$('albalV2FrontLabel-'+index);if(document.activeElement!==input)input.value=albalV2FrontState().groupNames[index]??group.name});
}
