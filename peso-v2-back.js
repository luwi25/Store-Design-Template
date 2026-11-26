// Editable product cards over the supplied Pesoplus Mambaling artwork.
const PESO_V2_BACK_ID='peso-v2-back';
const PESO_V2_BACK_ART=__PESO_V2_BACK_ART__;
const pesoV2BackSeeds=__PESO_V2_BACK_SEEDS__;
const pesoV2BackGroups=[{"name": "Storage Units", "headerX": 60, "headerY": 537, "headerW": 1050, "boxes": [[62, 619, 200, 340], [285, 619, 200, 340], [505, 619, 200, 340], [725, 619, 200, 340], [937, 619, 200, 340]], "photoHeights": [180, 180, 180, 180, 180]}, {"name": "Houseware", "headerX": 60, "headerY": 1006, "headerW": 1050, "boxes": [[62, 1082, 200, 322], [285, 1082, 200, 322], [505, 1082, 200, 322], [725, 1082, 200, 322], [937, 1082, 200, 322]], "photoHeights": [175, 175, 175, 175, 175]}, {"name": "Kitchenware & Tableware", "headerX": 60, "headerY": 1444, "headerW": 1050, "boxes": [[62, 1520, 200, 245], [285, 1520, 200, 245], [505, 1520, 200, 245], [725, 1520, 200, 245], [937, 1520, 200, 245]], "photoHeights": [125, 125, 125, 125, 125]}, {"name": "Electric Fan", "headerX": 60, "headerY": 1805, "headerW": 1050, "boxes": [[62, 1874, 200, 252], [285, 1874, 200, 252], [505, 1874, 200, 252], [725, 1874, 200, 252], [937, 1874, 200, 252]], "photoHeights": [142, 142, 142, 142, 142]}, {"name": "Plasticware", "headerX": 60, "headerY": 2162, "headerW": 1050, "boxes": [[62, 2236, 200, 213], [285, 2236, 200, 213], [505, 2236, 200, 213], [725, 2236, 200, 213], [937, 2236, 200, 213]], "photoHeights": [108, 108, 108, 108, 108]}, {"name": "Storage Units", "headerX": 1230, "headerY": 427, "headerW": 1050, "boxes": [[1214, 508, 200, 369], [1440, 508, 200, 369], [1660, 508, 200, 369], [1883, 508, 200, 369], [2100, 508, 200, 369]], "photoHeights": [197, 197, 197, 197, 197]}, {"name": "Houseware", "headerX": 1230, "headerY": 925, "headerW": 1050, "boxes": [[1214, 1005, 200, 329], [1440, 1005, 200, 329], [1660, 1005, 200, 329], [1883, 1005, 200, 329], [2100, 1005, 200, 329]], "photoHeights": [196, 196, 196, 196, 196]}, {"name": "Kitchenware & Tableware", "headerX": 1230, "headerY": 1386, "headerW": 1050, "boxes": [[1214, 1458, 200, 303], [1440, 1458, 200, 303], [1660, 1458, 200, 303], [1883, 1458, 200, 303], [2100, 1458, 200, 303]], "photoHeights": [174, 174, 174, 174, 174]}, {"name": "Electric Fan", "headerX": 1230, "headerY": 1804, "headerW": 1050, "boxes": [[1214, 1869, 200, 259], [1440, 1869, 200, 259], [1660, 1869, 200, 259], [1883, 1869, 200, 259], [2100, 1869, 200, 259]], "photoHeights": [142, 142, 142, 142, 142]}, {"name": "Plasticware", "headerX": 1230, "headerY": 2163, "headerW": 1050, "boxes": [[1214, 2233, 200, 215], [1440, 2233, 200, 215], [1660, 2233, 200, 215], [1883, 2233, 200, 215], [2100, 2233, 200, 215]], "photoHeights": [111, 111, 111, 111, 111]}].map((group,index)=>({...group,items:pesoV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let pesoV2BackArtwork=null;
function pesoV2BackState(){
 if(!state.pesoV2Back)state.pesoV2Back={slots:pesoV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.pesoV2Back.groupNames))state.pesoV2Back.groupNames=pesoV2BackGroups.map(g=>g.name);
 return state.pesoV2Back;
}

function seedPesoV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of pesoV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 pesoV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[PESO_V2_BACK_ID] ||= 'Template #3 - PESOPLUS MAMBALING - BACK';
 if(!state.templateSettings[PESO_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[PESO_V2_BACK_ID]={poster:{...defaults.poster,store:'PESOPLUS MAMBALING',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function pesoV2BackCard(index){
 const slots=pesoV2BackState().slots,slot=slots[index],group=pesoV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function pesoV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!pesoV2BackArtwork)pesoV2BackArtwork=await loadCanvasImage(PESO_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(pesoV2BackArtwork,0,0,3508,2480);
 const slots=pesoV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 pesoV2BackGroups.forEach((group,groupIndex)=>{
  drawPesoV2BackHeader(ctx,group,groupIndex);
  ctx.fillStyle='#fff';const first=group.boxes[0];ctx.fillRect(groupIndex<5?52:1207,first[1]-5,groupIndex<5?1069:1095,first[3]+10);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=pesoV2BackCard(index),large=false;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===pesoV2BackSeeds[index]?.name){
     const seed=pesoV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(pesoV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function pesoV2BackLabel(index){return pesoV2BackState().groupNames[index]?.trim()||pesoV2BackGroups[index].name}
function drawPesoV2BackHeader(ctx,group,index){
 if(pesoV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#003b91';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(pesoV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncPesoV2BackControls(){
 let panel=$('pesoV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='pesoV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  pesoV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='pesoV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{pesoV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{pesoV2BackState().groupNames=pesoV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==PESO_V2_BACK_ID;
 if(!panel.hidden)pesoV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('pesoV2BackLabel-'+index);if(document.activeElement!==input)input.value=pesoV2BackState().groupNames[index]??group.name});
}
