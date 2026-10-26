// Editable product cards over the supplied Pesoplus artwork.
const PESO_COLLECTION_BACK_ID='peso-collection-back';
const PESO_COLLECTION_BACK_ART=__PESO_COLLECTION_BACK_ART__;
const pesoCollectionBackSeeds=__PESO_COLLECTION_BACK_SEEDS__;
const pesoCollectionBackGroups=[
 {name:'School Supplies',headerY:144,y:180,h:216},
 {name:'Kitchenware & Tableware',headerY:401,y:438,h:199},
 {name:'Hardware & Electrical',headerY:643,y:678,h:199},
 {name:'Apparel',headerY:881,y:917,h:200},
 {name:'Fashion & Accessories',headerY:1123,y:1159,h:198}
].map((group,index)=>({...group,items:pesoCollectionBackSeeds.slice(index*5,index*5+5).map(p=>[p.name,p.price])}));
let pesoCollectionBackArtwork=null;
function pesoCollectionBackState(){
 if(!state.pesoCollectionBack)state.pesoCollectionBack={slots:pesoCollectionBackSeeds.map((p,index)=>({productId:state.catalogAliases?.[p.id]||p.id,group:Math.floor(index/5),discountPercent:0}))};
 if(!Array.isArray(state.pesoCollectionBack.groupNames))state.pesoCollectionBack.groupNames=pesoCollectionBackGroups.map(g=>g.name);
 const back=state.pesoCollectionBack;
 if(!back.rankedCategoriesVersion){
  if(/^christmas\s+(?:gift\s+)?bundles$/i.test(back.groupNames[0]?.trim()||'')){
   // Old saved projects keep four ranked rows. Replace only the retired bundle
   // row with the missing ranked category, preserving edits in all other rows.
   const existing=new Set(back.groupNames.slice(1).map(name=>name.trim().toLowerCase()));
   const replacement=pesoCollectionBackGroups.findIndex(group=>!existing.has(group.name.toLowerCase()));
   if(replacement>=0){
    const products=pesoCollectionBackSeeds.slice(replacement*5,replacement*5+5);
    let column=0;
    back.slots=back.slots.map(slot=>{
     if(slot.group!==0)return slot;
     const seedId=products[column++]?.id;
     const next={...slot,productId:state.catalogAliases?.[seedId]||seedId||null};
     delete next.details;delete next.image;
     return next;
    });
    back.groupNames[0]=pesoCollectionBackGroups[replacement].name;
   }
  }
  back.rankedCategoriesVersion=1;
 }
 return state.pesoCollectionBack;
}
function seedPesoCollectionBack(){
 const ids=new Set(state.products.map(p=>p.id));
 for(const seed of pesoCollectionBackSeeds)if(!ids.has(seed.id)&&!state.deletedProductIds?.includes(seed.id))state.products.push({...seed});
 pesoCollectionBackState();state.templateNames ||= {};state.templateSettings ||= {};
 state.templateNames[PESO_COLLECTION_BACK_ID] ||= 'Template #2 - PESOPLUS - BACK';
 if(!state.templateSettings[PESO_COLLECTION_BACK_ID]){
  const defaults=starter();
  state.templateSettings[PESO_COLLECTION_BACK_ID]={poster:{...defaults.poster,store:'PESOPLUS',paper:'letter',fit:'half'},textSizes:{name:100,discount:100,sale:100,original:100},discount:{mode:'percent',value:0},slots:[]};
 }
}
function pesoCollectionBackCard(index){
 const slots=pesoCollectionBackState().slots,slot=slots[index],group=pesoCollectionBackGroups[slot.group];
 const column=slots.filter(item=>item.group===slot.group).indexOf(slot);
 return {x:13+column*200,y:group.y,w:197,h:group.h};
}
async function pesoCollectionBackCanvas({width=1650,height=2550}={}){
 await document.fonts.load('800 20px Outfit');
 if(!pesoCollectionBackArtwork)pesoCollectionBackArtwork=await loadCanvasImage(PESO_COLLECTION_BACK_ART);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(width/1023,height/1537);
 ctx.drawImage(pesoCollectionBackArtwork,0,0,1023,1537);
 const slots=pesoCollectionBackState().slots;
 const photos=await Promise.all(slots.map(async slot=>{try{const src=slot.image||productFor(slot)?.image;return src?await loadCanvasImage(src):null}catch{return null}}));
 pesoCollectionBackGroups.forEach((group,groupIndex)=>{
  drawPesoCollectionBackHeader(ctx,group,groupIndex);
  const indices=slots.map((slot,index)=>slot.group===groupIndex?index:-1).filter(index=>index>=0);
  for(let column=0;column<5;column++){
   const index=indices[column],slot=slots[index],product=slot&&productFor(slot);
   const b={x:13+column*200,y:group.y,w:197,h:group.h};
   ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();
   ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,b.w,b.h);
   ctx.strokeStyle='#f6cb39';ctx.lineWidth=1.5;roundRect(ctx,b.x+1,b.y+1,b.w-2,b.h-2,16);ctx.fill();ctx.stroke();
   if(slot){
    const {size,lines,lineHeight}=homeCollectionNameLayout(ctx,product?.name||'Choose a product',b.w-24,18*textScale('name',slot));
    const priceSize=23*textScale('sale',slot),priceBaseline=b.y+b.h-10;
    const nameBaseline=priceBaseline-priceSize-5-(lines.length-1)*lineHeight;
    const photoH=Math.max(1,nameBaseline-size-b.y-12),im=photos[index];
    if(im){
     const scale=Math.min((b.w-16)/im.width,photoH/im.height);
     ctx.save();roundRect(ctx,b.x+8,b.y+7,b.w-16,photoH,10);ctx.clip();
     ctx.drawImage(im,b.x+(b.w-im.width*scale)/2,b.y+7+(photoH-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();
    }
    ctx.textAlign='center';ctx.fillStyle='#00358b';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
    lines.forEach((line,i)=>ctx.fillText(line,b.x+b.w/2,nameBaseline+i*lineHeight,b.w-20));
    if(product){ctx.font=`800 ${priceSize}px Outfit, Arial, sans-serif`;ctx.fillStyle='#00358b';ctx.fillText(money(salePrice(product,slot)),b.x+b.w/2,priceBaseline,b.w-20)}
   }
   ctx.restore();
  }
 });
 return canvas;
}

function pesoCollectionBackLabel(index){return pesoCollectionBackState().groupNames[index]?.trim()||pesoCollectionBackGroups[index].name}
function drawPesoCollectionBackHeader(ctx,group,index){
 ctx.save();ctx.fillStyle='#0039a6';roundRect(ctx,12,group.headerY,998,34,10);ctx.fill();
 const title=pesoCollectionBackLabel(index).toUpperCase();let size=27;
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`800 ${size}px Outfit, Arial, sans-serif`;
 while(ctx.measureText(title).width>950&&size>16){size--;ctx.font=`800 ${size}px Outfit, Arial, sans-serif`}
 ctx.fillStyle='#fff200';ctx.fillText(title,24,group.headerY+17,950);
 const start=24+ctx.measureText(title).width+18;
 if(start<975){ctx.strokeStyle='#fff200';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,group.headerY+18);ctx.lineTo(993,group.headerY+18);ctx.stroke()}
 ctx.restore();
}
function syncPesoCollectionBackControls(){
 let panel=$('pesoCollectionBackCategoryControls');
 if(!panel){
  panel=document.createElement('section');panel.id='pesoCollectionBackCategoryControls';panel.className='panel';panel.hidden=true;
  const title=document.createElement('h2');title.textContent='Section headings';panel.append(title);
  pesoCollectionBackGroups.forEach((group,index)=>{
   const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='pesoCollectionBackLabel-'+index;label.textContent='Section '+(index+1)+' heading';
   const input=document.createElement('input');input.id=label.htmlFor;input.type='text';input.maxLength=48;input.placeholder=group.name;
   input.addEventListener('input',()=>{pesoCollectionBackState().groupNames[index]=input.value;renderPoster();save()});field.append(label,input);panel.append(field);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='btn btn-sm';reset.textContent='Restore original headings';reset.onclick=()=>{pesoCollectionBackState().groupNames=pesoCollectionBackGroups.map(g=>g.name);renderPoster();save()};panel.append(reset);
  $('homeBackCategoryControls').after(panel);
 }
 panel.hidden=state.templateId!==PESO_COLLECTION_BACK_ID;
 if(!panel.hidden)pesoCollectionBackGroups.forEach((group,index)=>{const input=$('pesoCollectionBackLabel-'+index);if(document.activeElement!==input)input.value=pesoCollectionBackState().groupNames[index]??group.name});
}
