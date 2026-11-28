// Editable product cards over the supplied Ginsey Sibonga artwork.
const SIBONGA_V2_FRONT_ID='ginsey-sibonga-v2-front';
const SIBONGA_V2_FRONT_ART=__SIBONGA_V2_FRONT_ART__;
const sibongaV2FrontSeeds=__SIBONGA_V2_FRONT_SEEDS__;
const sibongaV2FrontGroups=[{"name": "Storage Units", "headerX": 40, "headerY": 615, "headerW": 700, "boxes": [[55, 715, 200, 320], [285, 715, 200, 320], [510, 715, 200, 320], [735, 715, 200, 320], [945, 715, 200, 320]], "photoHeights": [165, 165, 165, 165, 165]}, {"name": "Houseware", "headerX": 40, "headerY": 1085, "headerW": 700, "boxes": [[55, 1180, 200, 285], [285, 1180, 200, 285], [510, 1180, 200, 285], [735, 1180, 200, 285], [945, 1180, 200, 285]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Kitchenware & Tableware", "headerX": 40, "headerY": 1520, "headerW": 1010, "boxes": [[55, 1615, 200, 270], [285, 1615, 200, 270], [510, 1615, 200, 270], [735, 1615, 200, 270], [945, 1615, 200, 270]], "photoHeights": [135, 135, 135, 135, 135]}, {"name": "Plasticware", "headerX": 40, "headerY": 1940, "headerW": 700, "boxes": [[55, 2030, 200, 275], [285, 2030, 200, 275], [510, 2030, 200, 275], [735, 2030, 200, 275], [945, 2030, 200, 275]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Storage Units", "headerX": 1210, "headerY": 615, "headerW": 700, "boxes": [[1225, 715, 200, 320], [1455, 715, 200, 320], [1680, 715, 200, 320], [1905, 715, 200, 320], [2115, 715, 200, 320]], "photoHeights": [165, 165, 165, 165, 165]}, {"name": "Houseware", "headerX": 1210, "headerY": 1085, "headerW": 700, "boxes": [[1225, 1180, 200, 285], [1455, 1180, 200, 285], [1680, 1180, 200, 285], [1905, 1180, 200, 285], [2115, 1180, 200, 285]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Kitchenware & Tableware", "headerX": 1210, "headerY": 1520, "headerW": 1010, "boxes": [[1225, 1615, 200, 270], [1455, 1615, 200, 270], [1680, 1615, 200, 270], [1905, 1615, 200, 270], [2115, 1615, 200, 270]], "photoHeights": [135, 135, 135, 135, 135]}, {"name": "Electric Fan", "headerX": 1210, "headerY": 1940, "headerW": 700, "boxes": [[1225, 2030, 200, 275], [1455, 2030, 200, 275], [1680, 2030, 200, 275], [1905, 2030, 200, 275], [2115, 2030, 200, 275]], "photoHeights": [140, 140, 140, 140, 140]}].map((group,index)=>({...group,items:sibongaV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let sibongaV2FrontArtwork=null;
function sibongaV2FrontState(){
 if(!state.sibongaV2Front)state.sibongaV2Front={slots:sibongaV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.sibongaV2Front.groupNames))state.sibongaV2Front.groupNames=sibongaV2FrontGroups.map(g=>g.name);
 return state.sibongaV2Front;
}

function seedSibongaV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of sibongaV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 sibongaV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[SIBONGA_V2_FRONT_ID] ||= 'Template #2 - GINSEY SIBONGA - FRONT';
 if(!state.templateSettings[SIBONGA_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[SIBONGA_V2_FRONT_ID]={poster:{...defaults.poster,store:'GINSEY SIBONGA',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function sibongaV2FrontCard(index){
 const slots=sibongaV2FrontState().slots,slot=slots[index],group=sibongaV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function sibongaV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!sibongaV2FrontArtwork)sibongaV2FrontArtwork=await loadCanvasImage(SIBONGA_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(sibongaV2FrontArtwork,0,0,3508,2480);
 const slots=sibongaV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 sibongaV2FrontGroups.forEach((group,groupIndex)=>{
  drawSibongaV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=sibongaV2FrontCard(index),large=false;
   const seed=sibongaV2FrontSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===sibongaV2FrontSeeds[index]?.name){
     const seed=sibongaV2FrontSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(sibongaV2FrontArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function sibongaV2FrontLabel(index){return sibongaV2FrontState().groupNames[index]?.trim()||sibongaV2FrontGroups[index].name}
function drawSibongaV2FrontHeader(ctx,group,index){
 if(sibongaV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle=(index%2===0?'#c60014':'#003395');roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(sibongaV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncSibongaV2FrontControls(){
 let panel=$('sibongaV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='sibongaV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  sibongaV2FrontGroups.slice(0,8).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='sibongaV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{sibongaV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{sibongaV2FrontState().groupNames=sibongaV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==SIBONGA_V2_FRONT_ID;
 if(!panel.hidden)sibongaV2FrontGroups.slice(0,8).forEach((group,index)=>{const input=$('sibongaV2FrontLabel-'+index);if(document.activeElement!==input)input.value=sibongaV2FrontState().groupNames[index]??group.name});
}
