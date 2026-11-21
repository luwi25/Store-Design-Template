// Editable product cards over the supplied UBEST Opon artwork.
const UBEST_V2_BACK_ID='ubest-opon-v2-back';
const UBEST_V2_BACK_ART=__UBEST_V2_BACK_ART__;
const ubestV2BackSeeds=__UBEST_V2_BACK_SEEDS__;
const ubestV2BackGroups=[{"name": "Storage Units", "headerX": 38, "headerY": 625, "headerW": 1000, "boxes": [[60, 720, 190, 220], [282, 720, 190, 220], [501, 720, 190, 220], [720, 720, 190, 220], [940, 720, 190, 220]], "photoHeights": [155, 155, 155, 155, 155]}, {"name": "Houseware", "headerX": 38, "headerY": 977, "headerW": 1000, "boxes": [[60, 1075, 190, 215], [282, 1075, 190, 215], [501, 1075, 190, 215], [720, 1075, 190, 215], [940, 1075, 190, 215]], "photoHeights": [155, 155, 155, 155, 155]}, {"name": "Kitchenware & Tableware", "headerX": 38, "headerY": 1338, "headerW": 1000, "boxes": [[60, 1438, 190, 210], [282, 1438, 190, 210], [501, 1438, 190, 210], [720, 1438, 190, 210], [940, 1438, 190, 210]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Electric Fan", "headerX": 38, "headerY": 1688, "headerW": 1000, "boxes": [[60, 1785, 190, 195], [282, 1785, 190, 195], [501, 1785, 190, 195], [720, 1785, 190, 195], [940, 1785, 190, 195]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Plasticware", "headerX": 38, "headerY": 2010, "headerW": 1000, "boxes": [[60, 2105, 190, 210], [282, 2105, 190, 210], [501, 2105, 190, 210], [720, 2105, 190, 210], [940, 2105, 190, 210]], "photoHeights": [145, 145, 145, 145, 145]}, {"name": "Storage Units", "headerX": 1208, "headerY": 625, "headerW": 1000, "boxes": [[1224, 720, 190, 220], [1444, 720, 190, 220], [1663, 720, 190, 220], [1882, 720, 190, 220], [2102, 720, 190, 220]], "photoHeights": [155, 155, 155, 155, 155]}, {"name": "Houseware", "headerX": 1208, "headerY": 977, "headerW": 1000, "boxes": [[1224, 1075, 190, 215], [1444, 1075, 190, 215], [1663, 1075, 190, 215], [1882, 1075, 190, 215], [2102, 1075, 190, 215]], "photoHeights": [155, 155, 155, 155, 155]}, {"name": "Kitchenware & Tableware", "headerX": 1208, "headerY": 1338, "headerW": 1000, "boxes": [[1224, 1438, 190, 210], [1444, 1438, 190, 210], [1663, 1438, 190, 210], [1882, 1438, 190, 210], [2102, 1438, 190, 210]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Electric Fan", "headerX": 1208, "headerY": 1688, "headerW": 1000, "boxes": [[1224, 1785, 190, 195], [1444, 1785, 190, 195], [1663, 1785, 190, 195], [1882, 1785, 190, 195], [2102, 1785, 190, 195]], "photoHeights": [140, 140, 140, 140, 140]}, {"name": "Plasticware", "headerX": 1208, "headerY": 2010, "headerW": 1000, "boxes": [[1224, 2105, 190, 210], [1444, 2105, 190, 210], [1663, 2105, 190, 210], [1882, 2105, 190, 210], [2102, 2105, 190, 210]], "photoHeights": [145, 145, 145, 145, 145]}].map((group,index)=>({...group,items:ubestV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let ubestV2BackArtwork=null;
function ubestV2BackState(){
 if(!state.ubestV2Back)state.ubestV2Back={slots:ubestV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.ubestV2Back.groupNames))state.ubestV2Back.groupNames=ubestV2BackGroups.map(g=>g.name);
 return state.ubestV2Back;
}

function seedUbestV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of ubestV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 ubestV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[UBEST_V2_BACK_ID] ||= 'Template #2 - UBEST OPON - BACK';
 if(!state.templateSettings[UBEST_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[UBEST_V2_BACK_ID]={poster:{...defaults.poster,store:'UBEST OPON',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function ubestV2BackCard(index){
 const slots=ubestV2BackState().slots,slot=slots[index],group=ubestV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function ubestV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!ubestV2BackArtwork)ubestV2BackArtwork=await loadCanvasImage(UBEST_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(ubestV2BackArtwork,0,0,3508,2480);
 const slots=ubestV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 ubestV2BackGroups.forEach((group,groupIndex)=>{
  drawUbestV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=ubestV2BackCard(index),large=false;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(Number(product?.price)>0?(large?60:36):0)*textScale('sale',slot),priceBaseline=b.y+b.h-12;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===ubestV2BackSeeds[index]?.name){
     const seed=ubestV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(ubestV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
    }
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#080808';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product&&Number(product.price)>0){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#ff0000';ctx.fillText(Number(product.price)>0?money(salePrice(product,slot)):'\u20b10.00',b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function ubestV2BackLabel(index){return ubestV2BackState().groupNames[index]?.trim()||ubestV2BackGroups[index].name}
function drawUbestV2BackHeader(ctx,group,index){
 if(ubestV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#003395';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(ubestV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncUbestV2BackControls(){
 let panel=$('ubestV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='ubestV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  ubestV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='ubestV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{ubestV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{ubestV2BackState().groupNames=ubestV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==UBEST_V2_BACK_ID;
 if(!panel.hidden)ubestV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('ubestV2BackLabel-'+index);if(document.activeElement!==input)input.value=ubestV2BackState().groupNames[index]??group.name});
}
