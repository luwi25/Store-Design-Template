// Editable product cards over the supplied Kazumi Linao artwork.
const KAZUMI_V2_FRONT_ID='kazumi-linao-v2-front';
const KAZUMI_V2_FRONT_ART=__KAZUMI_V2_FRONT_ART__;
const kazumiV2FrontSeeds=__KAZUMI_V2_FRONT_SEEDS__;
const kazumiV2FrontGroups=[{"name": "Storage Units", "headerX": 43, "headerY": 554, "headerW": 1080, "boxes": [[49, 663, 195, 196], [272, 663, 195, 196], [496, 663, 195, 196], [719, 663, 195, 196], [940, 663, 195, 196]]}, {"name": "Houseware", "headerX": 43, "headerY": 896, "headerW": 1080, "boxes": [[49, 1007, 195, 179], [272, 1007, 195, 179], [496, 1007, 195, 179], [719, 1007, 195, 179], [940, 1007, 195, 179]]}, {"name": "Kitchenware & Tableware", "headerX": 43, "headerY": 1224, "headerW": 1080, "boxes": [[49, 1333, 195, 173], [272, 1333, 195, 173], [496, 1333, 195, 173], [719, 1333, 195, 173], [940, 1333, 195, 173]]}, {"name": "Electric Fan", "headerX": 43, "headerY": 1545, "headerW": 1080, "boxes": [[49, 1649, 195, 166], [272, 1649, 195, 166], [496, 1649, 195, 166], [719, 1649, 195, 166], [940, 1649, 195, 166]]}, {"name": "Plasticware", "headerX": 43, "headerY": 1860, "headerW": 1080, "boxes": [[49, 1966, 195, 171], [272, 1966, 195, 171], [496, 1966, 195, 171], [719, 1966, 195, 171], [940, 1966, 195, 171]]}, {"name": "Electric Fan", "headerX": 1235, "headerY": 163, "headerW": 1040, "boxes": [[1227, 372, 309, 416], [1598, 372, 310, 416], [1965, 372, 310, 416], [1317, 850, 399, 371], [1786, 850, 397, 371]]}, {"name": "Plasticware", "headerX": 1230, "headerY": 1287, "headerW": 1040, "boxes": [[1227, 1483, 309, 362], [1598, 1483, 310, 362], [1965, 1483, 310, 362], [1320, 1905, 396, 350], [1786, 1905, 397, 350]]}].map((group,index)=>({...group,items:kazumiV2FrontSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let kazumiV2FrontArtwork=null;
function kazumiV2FrontState(){
 if(!state.kazumiV2Front)state.kazumiV2Front={slots:kazumiV2FrontSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.kazumiV2Front.groupNames))state.kazumiV2Front.groupNames=kazumiV2FrontGroups.map(g=>g.name);
 return state.kazumiV2Front;
}

function seedKazumiV2Front(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of kazumiV2FrontSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 kazumiV2FrontState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[KAZUMI_V2_FRONT_ID] ||= 'Template #2 - KAZUMI LINAO - FRONT';
 if(!state.templateSettings[KAZUMI_V2_FRONT_ID]){
  const defaults=starter();
  state.templateSettings[KAZUMI_V2_FRONT_ID]={poster:{...defaults.poster,store:'KAZUMI LINAO',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function kazumiV2FrontCard(index){
 const slots=kazumiV2FrontState().slots,slot=slots[index],group=kazumiV2FrontGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function kazumiV2FrontCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!kazumiV2FrontArtwork)kazumiV2FrontArtwork=await loadCanvasImage(KAZUMI_V2_FRONT_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(kazumiV2FrontArtwork,0,0,3508,2480);
 const slots=kazumiV2FrontState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 kazumiV2FrontGroups.forEach((group,groupIndex)=>{
  drawKazumiV2FrontHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=kazumiV2FrontCard(index),large=groupIndex>=5&&groupIndex<=7;
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

function kazumiV2FrontLabel(index){return kazumiV2FrontState().groupNames[index]?.trim()||kazumiV2FrontGroups[index].name}
function drawKazumiV2FrontHeader(ctx,group,index){
 if(kazumiV2FrontLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#b00000';roundRect(ctx,group.headerX,group.headerY,group.headerW,index>=5?106:90,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${index>=5?74:52}px Outfit, Arial, sans-serif`;ctx.fillText(kazumiV2FrontLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(index>=5?53:45),group.headerW-30);ctx.restore();
}
function syncKazumiV2FrontControls(){
 let panel=$('kazumiV2FrontCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='kazumiV2FrontCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  kazumiV2FrontGroups.slice(0,7).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='kazumiV2FrontLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{kazumiV2FrontState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{kazumiV2FrontState().groupNames=kazumiV2FrontGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==KAZUMI_V2_FRONT_ID;
 if(!panel.hidden)kazumiV2FrontGroups.slice(0,7).forEach((group,index)=>{const input=$('kazumiV2FrontLabel-'+index);if(document.activeElement!==input)input.value=kazumiV2FrontState().groupNames[index]??group.name});
}
