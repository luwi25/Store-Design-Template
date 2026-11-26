// Editable product cards over the supplied UBest Danao artwork.
const DANAO_V2_FRONT_ID='ubest-danao-v2-front';
const DANAO_V2_FRONT_ART=__DANAO_V2_FRONT_ART__;
const danaoV2FrontSeeds=__DANAO_V2_FRONT_SEEDS__;
const danaoV2FrontGroups=[{"name": "Storage Units", "headerX": 55, "headerY": 710, "headerW": 680, "boxes": [[40, 810, 220, 340], [280, 810, 205, 340], [502, 810, 205, 340], [722, 810, 210, 340], [945, 810, 200, 340]], "photoHeights": [170, 170, 170, 170, 170]}, {"name": "Houseware", "headerX": 55, "headerY": 1200, "headerW": 680, "boxes": [[40, 1295, 220, 300], [280, 1295, 205, 300], [502, 1295, 205, 300], [722, 1295, 210, 300], [945, 1295, 200, 300]], "photoHeights": [160, 160, 160, 160, 160]}, {"name": "Kitchenware & Tableware", "headerX": 55, "headerY": 1645, "headerW": 960, "boxes": [[40, 1745, 220, 250], [280, 1745, 205, 250], [502, 1745, 205, 250], [722, 1745, 210, 250], [945, 1745, 200, 250]], "photoHeights": [125, 125, 125, 125, 125]}, {"name": "Plasticware", "headerX": 55, "headerY": 2045, "headerW": 680, "boxes": [[40, 2140, 220, 265], [280, 2140, 205, 265], [502, 2140, 205, 265], [722, 2140, 210, 265], [945, 2140, 200, 265]], "photoHeights": [125, 125, 125, 125, 125]}, {"name": "Electric Fan", "headerX": 1260, "headerY": 200, "headerW": 960, "headerH": 120, "boxes": [[1230, 385, 330, 505], [1595, 385, 320, 505], [1945, 385, 330, 505], [1270, 940, 450, 425], [1780, 940, 460, 425]], "photoHeights": [325, 325, 325, 260, 260]}, {"name": "Cookware, Kitchenware & More", "headerX": 1230, "headerY": 1440, "headerW": 1040, "headerH": 125, "boxes": [[1230, 1620, 340, 335], [1600, 1620, 320, 335], [1950, 1620, 325, 335], [1305, 2000, 420, 350], [1775, 2000, 425, 350]], "photoHeights": [185, 185, 185, 190, 190]}].map((group,index)=>({...group,items:danaoV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let danaoV2FrontArtwork=null;
function danaoV2FrontState(){
 if(!state.danaoV2Front)state.danaoV2Front={slots:danaoV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.danaoV2Front.groupNames))state.danaoV2Front.groupNames=danaoV2FrontGroups.map(g=>g.name);
 return state.danaoV2Front;
}

function seedDanaoV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of danaoV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 danaoV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[DANAO_V2_FRONT_ID] ||= 'Template #2 - UBEST DANAO - FRONT';
 if(!state.templateSettings[DANAO_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[DANAO_V2_FRONT_ID]={poster:{...defaults.poster,store:'UBEST DANAO',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function danaoV2FrontCard(index){
 const slots=danaoV2FrontState().slots,slot=slots[index],group=danaoV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function danaoV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!danaoV2FrontArtwork)danaoV2FrontArtwork=await loadCanvasImage(DANAO_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(danaoV2FrontArtwork,0,0,3508,2480);
 const slots=danaoV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 danaoV2FrontGroups.forEach((group,groupIndex)=>{
  drawDanaoV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=danaoV2FrontCard(index),large=groupIndex>=4;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===danaoV2FrontSeeds[index]?.name){
     const seed=danaoV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(danaoV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
    }
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.fillStyle='#ef5900';roundRect(ctx,b.x+12,priceBaseline-priceSize+2,b.w-24,priceSize+10,24);ctx.fill();ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#fff';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b10.00',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function danaoV2FrontLabel(index){return danaoV2FrontState().groupNames[index]?.trim()||danaoV2FrontGroups[index].name}
function drawDanaoV2FrontHeader(ctx,group,index){
 if(danaoV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#003b85';roundRect(ctx,group.headerX,group.headerY,group.headerW,group.headerH||70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(danaoV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(group.headerH||70)/2,group.headerW-30);ctx.restore();
}
function syncDanaoV2FrontControls(){
 let panel=$('danaoV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='danaoV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  danaoV2FrontGroups.slice(0,6).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='danaoV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{danaoV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{danaoV2FrontState().groupNames=danaoV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==DANAO_V2_FRONT_ID;
 if(!panel.hidden)danaoV2FrontGroups.slice(0,6).forEach((group,index)=>{const input=$('danaoV2FrontLabel-'+index);if(document.activeElement!==input)input.value=danaoV2FrontState().groupNames[index]??group.name});
}
