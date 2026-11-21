// Editable product cards over the supplied Home Express Tisa artwork.
const TISA_V2_BACK_ID='home-express-tisa-v2-back';
const TISA_V2_BACK_ART=__TISA_V2_BACK_ART__;
const tisaV2BackSeeds=__TISA_V2_BACK_SEEDS__;
const tisaV2BackGroups=[{"name": "Storage Units", "headerX": 30, "headerY": 570, "headerW": 1100, "boxes": [[45, 668, 195, 303], [280, 668, 195, 303], [502, 668, 195, 303], [722, 668, 195, 303], [945, 668, 195, 303]], "photoHeights": [165, 165, 165, 165, 165]}, {"name": "Houseware", "headerX": 30, "headerY": 1017, "headerW": 1100, "boxes": [[45, 1114, 195, 293], [280, 1114, 195, 293], [502, 1114, 195, 293], [722, 1114, 195, 293], [945, 1114, 195, 293]], "photoHeights": [153, 153, 153, 153, 153]}, {"name": "Kitchenware & Tableware", "headerX": 30, "headerY": 1455, "headerW": 1100, "boxes": [[45, 1546, 195, 262], [280, 1546, 195, 262], [502, 1546, 195, 262], [722, 1546, 195, 262], [945, 1546, 195, 262]], "photoHeights": [151, 151, 137, 151, 151]}, {"name": "Electric Fan", "headerX": 30, "headerY": 1850, "headerW": 1100, "boxes": [[45, 1935, 195, 209], [280, 1935, 195, 209], [502, 1935, 195, 209], [722, 1935, 195, 209], [945, 1935, 195, 209]], "photoHeights": [122, 122, 122, 122, 105]}, {"name": "Plasticware", "headerX": 30, "headerY": 2178, "headerW": 1100, "boxes": [[45, 2253, 195, 183], [280, 2253, 195, 183], [502, 2253, 195, 183], [722, 2253, 195, 183], [945, 2253, 195, 183]], "photoHeights": [98, 98, 98, 98, 98]}, {"name": "Storage Units", "headerX": 1200, "headerY": 100, "headerW": 1100, "boxes": [[1214, 218, 195, 355], [1438, 218, 195, 355], [1660, 218, 195, 355], [1884, 218, 195, 355], [2107, 218, 195, 355]], "photoHeights": [194, 194, 194, 194, 194]}, {"name": "Houseware", "headerX": 1200, "headerY": 630, "headerW": 1100, "boxes": [[1214, 741, 195, 339], [1438, 741, 195, 339], [1660, 741, 195, 339], [1884, 741, 195, 339], [2107, 741, 195, 339]], "photoHeights": [193, 193, 193, 193, 193]}, {"name": "Kitchenware & Tableware", "headerX": 1200, "headerY": 1134, "headerW": 1100, "boxes": [[1214, 1238, 195, 286], [1438, 1238, 195, 286], [1660, 1238, 195, 286], [1884, 1238, 195, 286], [2107, 1238, 195, 286]], "photoHeights": [151, 151, 151, 151, 151]}, {"name": "Electric Fan", "headerX": 1200, "headerY": 1578, "headerW": 1100, "boxes": [[1214, 1680, 195, 306], [1438, 1680, 195, 306], [1660, 1680, 195, 306], [1884, 1680, 195, 306], [2107, 1680, 195, 306]], "photoHeights": [172, 172, 172, 172, 172]}, {"name": "Plasticware", "headerX": 1200, "headerY": 2032, "headerW": 1100, "boxes": [[1214, 2127, 195, 286], [1438, 2127, 195, 286], [1660, 2127, 195, 286], [1884, 2127, 195, 286], [2107, 2127, 195, 286]], "photoHeights": [151, 151, 151, 151, 135]}].map((group,index)=>({...group,items:tisaV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let tisaV2BackArtwork=null;
function tisaV2BackState(){
 if(!state.tisaV2Back)state.tisaV2Back={slots:tisaV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.tisaV2Back.groupNames))state.tisaV2Back.groupNames=tisaV2BackGroups.map(g=>g.name);
 return state.tisaV2Back;
}

function seedTisaV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of tisaV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 tisaV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[TISA_V2_BACK_ID] ||= 'Template #2 - HOME EXPRESS TISA - BACK';
 if(!state.templateSettings[TISA_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[TISA_V2_BACK_ID]={poster:{...defaults.poster,store:'HOME EXPRESS TISA',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function tisaV2BackCard(index){
 const slots=tisaV2BackState().slots,slot=slots[index],group=tisaV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function tisaV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!tisaV2BackArtwork)tisaV2BackArtwork=await loadCanvasImage(TISA_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(tisaV2BackArtwork,0,0,3508,2480);
 const slots=tisaV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 tisaV2BackGroups.forEach((group,groupIndex)=>{
  drawTisaV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=tisaV2BackCard(index),large=false;
   ctx.save();roundRect(ctx,b.x-3,b.y-8,b.w+6,b.h+16,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x-3,b.y-8,b.w+6,b.h+16);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:36)*textScale('sale',slot),priceBaseline=b.y+b.h-12;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===tisaV2BackSeeds[index]?.name){
     const seed=tisaV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(tisaV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function tisaV2BackLabel(index){return tisaV2BackState().groupNames[index]?.trim()||tisaV2BackGroups[index].name}
function drawTisaV2BackHeader(ctx,group,index){
 if(tisaV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#ffcf00';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#000';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(tisaV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncTisaV2BackControls(){
 let panel=$('tisaV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='tisaV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  tisaV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='tisaV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{tisaV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{tisaV2BackState().groupNames=tisaV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==TISA_V2_BACK_ID;
 if(!panel.hidden)tisaV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('tisaV2BackLabel-'+index);if(document.activeElement!==input)input.value=tisaV2BackState().groupNames[index]??group.name});
}
