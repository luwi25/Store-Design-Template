// Editable product cards over the supplied Kazumi Linao artwork.
const KAZUMI_V2_BACK_ID='kazumi-linao-v2-back';
const KAZUMI_V2_BACK_ART=__KAZUMI_V2_BACK_ART__;
const kazumiV2BackSeeds=__KAZUMI_V2_BACK_SEEDS__;
const kazumiV2BackGroups=[{"name": "Storage Units", "headerX": 55, "headerY": 646, "headerW": 1060, "boxes": [[62, 754, 185, 202], [283, 754, 185, 202], [494, 754, 185, 202], [707, 754, 185, 202], [920, 754, 185, 202]]}, {"name": "Houseware", "headerX": 55, "headerY": 985, "headerW": 1060, "boxes": [[62, 1092, 185, 178], [283, 1092, 185, 178], [494, 1092, 185, 178], [707, 1092, 185, 178], [920, 1092, 185, 178]]}, {"name": "Kitchenware & Tableware", "headerX": 55, "headerY": 1298, "headerW": 1060, "boxes": [[62, 1408, 185, 174], [283, 1408, 185, 174], [494, 1408, 185, 174], [707, 1408, 185, 174], [920, 1408, 185, 174]]}, {"name": "Electric Fan", "headerX": 55, "headerY": 1610, "headerW": 1060, "boxes": [[62, 1716, 185, 159], [283, 1716, 185, 159], [494, 1716, 185, 159], [707, 1716, 185, 159], [920, 1716, 185, 159]]}, {"name": "Plasticware", "headerX": 55, "headerY": 1904, "headerW": 1060, "boxes": [[62, 2007, 185, 162], [283, 2007, 185, 162], [494, 2007, 185, 162], [707, 2007, 185, 162], [920, 2007, 185, 162]]}, {"name": "Storage Units", "headerX": 1225, "headerY": 646, "headerW": 1060, "boxes": [[1234, 754, 185, 202], [1452, 754, 185, 202], [1665, 754, 185, 202], [1877, 754, 185, 202], [2090, 754, 185, 202]]}, {"name": "Houseware", "headerX": 1225, "headerY": 985, "headerW": 1060, "boxes": [[1234, 1092, 185, 178], [1452, 1092, 185, 178], [1665, 1092, 185, 178], [1877, 1092, 185, 178], [2090, 1092, 185, 178]]}, {"name": "Kitchenware & Tableware", "headerX": 1225, "headerY": 1298, "headerW": 1060, "boxes": [[1234, 1408, 185, 174], [1452, 1408, 185, 174], [1665, 1408, 185, 174], [1877, 1408, 185, 174], [2090, 1408, 185, 174]]}, {"name": "Electric Fan", "headerX": 1225, "headerY": 1610, "headerW": 1060, "boxes": [[1234, 1716, 185, 159], [1452, 1716, 185, 159], [1665, 1716, 185, 159], [1877, 1716, 185, 159], [2090, 1716, 185, 159]]}, {"name": "Plasticware", "headerX": 1225, "headerY": 1904, "headerW": 1060, "boxes": [[1234, 2007, 185, 162], [1452, 2007, 185, 162], [1665, 2007, 185, 162], [1877, 2007, 185, 162], [2090, 2007, 185, 162]]}].map((group,index)=>({...group,items:kazumiV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let kazumiV2BackArtwork=null;
function kazumiV2BackState(){
 if(!state.kazumiV2Back)state.kazumiV2Back={slots:kazumiV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.kazumiV2Back.groupNames))state.kazumiV2Back.groupNames=kazumiV2BackGroups.map(g=>g.name);
 return state.kazumiV2Back;
}

function seedKazumiV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of kazumiV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 kazumiV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[KAZUMI_V2_BACK_ID] ||= 'Template #2 - KAZUMI LINAO - BACK';
 if(!state.templateSettings[KAZUMI_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[KAZUMI_V2_BACK_ID]={poster:{...defaults.poster,store:'KAZUMI LINAO',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function kazumiV2BackCard(index){
 const slots=kazumiV2BackState().slots,slot=slots[index],group=kazumiV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function kazumiV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!kazumiV2BackArtwork)kazumiV2BackArtwork=await loadCanvasImage(KAZUMI_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(kazumiV2BackArtwork,0,0,3508,2480);
 const slots=kazumiV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 kazumiV2BackGroups.forEach((group,groupIndex)=>{
  drawKazumiV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=kazumiV2BackCard(index),large=false;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:36)*textScale('sale',slot),priceBaseline=b.y+b.h-12;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
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

function kazumiV2BackLabel(index){return kazumiV2BackState().groupNames[index]?.trim()||kazumiV2BackGroups[index].name}
function drawKazumiV2BackHeader(ctx,group,index){
 if(kazumiV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#b00000';roundRect(ctx,group.headerX,group.headerY,group.headerW,80,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(kazumiV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(40),group.headerW-30);ctx.restore();
}
function syncKazumiV2BackControls(){
 let panel=$('kazumiV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='kazumiV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  kazumiV2BackGroups.slice(0,10).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='kazumiV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{kazumiV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{kazumiV2BackState().groupNames=kazumiV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==KAZUMI_V2_BACK_ID;
 if(!panel.hidden)kazumiV2BackGroups.slice(0,10).forEach((group,index)=>{const input=$('kazumiV2BackLabel-'+index);if(document.activeElement!==input)input.value=kazumiV2BackState().groupNames[index]??group.name});
}
