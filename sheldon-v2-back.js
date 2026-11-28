// Editable product cards over the supplied Sheldon Pinamungajan artwork.
const SHELDON_V2_BACK_ID='sheldon-pinamungajan-v2-back';
const SHELDON_V2_BACK_ART=__SHELDON_V2_BACK_ART__;
const sheldonV2BackSeeds=__SHELDON_V2_BACK_SEEDS__;
const sheldonV2BackGroups=[{"name": "Storage Units", "headerX": 40, "headerY": 480, "headerW": 740, "boxes": [[40, 565, 195, 350], [280, 565, 195, 350], [500, 565, 195, 350], [725, 565, 195, 350], [940, 565, 195, 350]], "photoHeights": [195, 195, 195, 195, 195]}, {"name": "Houseware", "headerX": 40, "headerY": 945, "headerW": 740, "boxes": [[40, 1025, 195, 315], [280, 1025, 195, 315], [500, 1025, 195, 315], [725, 1025, 195, 315], [940, 1025, 195, 315]], "photoHeights": [175, 175, 175, 175, 175]}, {"name": "Kitchenware & Tableware", "headerX": 40, "headerY": 1370, "headerW": 900, "boxes": [[40, 1450, 195, 265], [280, 1450, 195, 265], [500, 1450, 195, 265], [725, 1450, 195, 265], [940, 1450, 195, 265]], "photoHeights": [130, 130, 130, 130, 130]}, {"name": "Electric Fan", "headerX": 40, "headerY": 1740, "headerW": 740, "boxes": [[40, 1815, 195, 285], [280, 1815, 195, 285], [500, 1815, 195, 285], [725, 1815, 195, 285], [940, 1815, 195, 285]], "photoHeights": [170, 170, 170, 170, 170]}, {"name": "Plasticware", "headerX": 40, "headerY": 2125, "headerW": 740, "boxes": [[40, 2200, 195, 230], [280, 2200, 195, 230], [500, 2200, 195, 230], [725, 2200, 195, 230], [940, 2200, 195, 230]], "photoHeights": [120, 120, 120, 120, 120]}, {"name": "Bedding & Linen", "headerX": 1210, "headerY": 480, "headerW": 740, "boxes": [[1205, 565, 195, 350], [1440, 565, 195, 350], [1670, 565, 195, 350], [1890, 565, 195, 350], [2110, 565, 195, 350]], "photoHeights": [185, 185, 185, 185, 185]}, {"name": "Cleaning Essentials", "headerX": 1210, "headerY": 945, "headerW": 740, "boxes": [[1205, 1025, 195, 320], [1440, 1025, 195, 320], [1670, 1025, 195, 320], [1890, 1025, 195, 320], [2110, 1025, 195, 320]], "photoHeights": [180, 180, 180, 180, 180]}, {"name": "Bathroom Essentials", "headerX": 1210, "headerY": 1380, "headerW": 740, "boxes": [[1205, 1455, 195, 290], [1440, 1455, 195, 290], [1670, 1455, 195, 290], [1890, 1455, 195, 290], [2110, 1455, 195, 290]], "photoHeights": [160, 160, 160, 160, 160]}, {"name": "Organization & Utility", "headerX": 1210, "headerY": 1775, "headerW": 900, "boxes": [[1205, 1845, 195, 310], [1440, 1845, 195, 310], [1670, 1845, 195, 310], [1890, 1845, 195, 310], [2110, 1845, 195, 310]], "photoHeights": [170, 170, 170, 170, 170]}].map((group,index)=>({...group,items:sheldonV2BackSeeds.filter(p=>p.group===index).map(p=>[p.name,p.price])}));
let sheldonV2BackArtwork=null;
function sheldonV2BackState(){
 if(!state.sheldonV2Back)state.sheldonV2Back={slots:sheldonV2BackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:p.group,discountPercent:0}))};
 if(!Array.isArray(state.sheldonV2Back.groupNames))state.sheldonV2Back.groupNames=sheldonV2BackGroups.map(g=>g.name);
 return state.sheldonV2Back;
}

function seedSheldonV2Back(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of sheldonV2BackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 sheldonV2BackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[SHELDON_V2_BACK_ID] ||= 'Template #2 - SHELDON PINAMUNGAJAN - BACK';
 if(!state.templateSettings[SHELDON_V2_BACK_ID]){
  const defaults=starter();
  state.templateSettings[SHELDON_V2_BACK_ID]={poster:{...defaults.poster,store:'SHELDON PINAMUNGAJAN',paper:'a4',fit:'full'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function sheldonV2BackCard(index){
 const slots=sheldonV2BackState().slots,slot=slots[index],group=sheldonV2BackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 const [x,y,w,h]=group.boxes[column];return {x,y,w,h};
}
async function sheldonV2BackCanvas({width=3508,height=2480}={}){
 await document.fonts.load('800 20px Outfit');
 if(!sheldonV2BackArtwork)sheldonV2BackArtwork=await loadCanvasImage(SHELDON_V2_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/3508,height/2480);
 ctx.drawImage(sheldonV2BackArtwork,0,0,3508,2480);
 const slots=sheldonV2BackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 sheldonV2BackGroups.forEach((group,groupIndex)=>{
  drawSheldonV2BackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<indices.length;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b=sheldonV2BackCard(index),large=false;
   const seed=sheldonV2BackSeeds[index];
   if(product&&seed&&slot.productId===(state.catalogAliases?.[seed.id]||seed.id)&&product.name===seed.name&&Number(product.price)===Number(seed.price)&&!slot.image&&!product.image&&!slot.discountPercent&&textScale('name',slot)===1&&textScale('sale',slot)===1)continue;
   ctx.save();roundRect(ctx,b.x,b.y,b.w,b.h,24);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);

   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,(large?44:26)*textScale('name',slot));
    const priceSize=(large?60:43)*textScale('sale',slot),priceBaseline=b.y+b.h-30;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(!im&&product?.name===sheldonV2BackSeeds[index]?.name){
     const seed=sheldonV2BackSeeds[index],matches=slot.productId===(state.catalogAliases?.[seed.id]||seed.id);
     if(matches){const sourceH=group.photoHeights[column],scale=Math.min((b.w-16)/b.w,photoH/sourceH);ctx.drawImage(sheldonV2BackArtwork,b.x,b.y,b.w,sourceH,b.x+(b.w-b.w*scale)/2,b.y+7+(photoH-sourceH*scale)/2,b.w*scale,sourceH*scale)}
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

function sheldonV2BackLabel(index){return sheldonV2BackState().groupNames[index]?.trim()||sheldonV2BackGroups[index].name}
function drawSheldonV2BackHeader(ctx,group,index){
 if(sheldonV2BackLabel(index)===group.name)return;
 ctx.save();ctx.fillStyle='#a60000';roundRect(ctx,group.headerX,group.headerY,group.headerW,70,40);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic 800 ${52}px Outfit, Arial, sans-serif`;ctx.fillText(sheldonV2BackLabel(index).toUpperCase(),group.headerX+group.headerW/2,group.headerY+(35),group.headerW-30);ctx.restore();
}
function syncSheldonV2BackControls(){
 let panel=$('sheldonV2BackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='sheldonV2BackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  sheldonV2BackGroups.slice(0,9).forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='sheldonV2BackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{sheldonV2BackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{sheldonV2BackState().groupNames=sheldonV2BackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==SHELDON_V2_BACK_ID;
 if(!panel.hidden)sheldonV2BackGroups.slice(0,9).forEach((group,index)=>{const input=$('sheldonV2BackLabel-'+index);if(document.activeElement!==input)input.value=sheldonV2BackState().groupNames[index]??group.name});
}
