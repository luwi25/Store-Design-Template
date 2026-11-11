'use strict';

const $=id=>document.getElementById(id),ctx=$('canvas').getContext('2d');

let project=null,original=null,selected=null,dirty=false,worker=null,job=0,mode=null,busy=false;

const images=new Map();
const storeNames={'home-express':'Home Express Basak',pesoplus:'Pesoplus Mambaling','alkeia-talamban':'Alkeia Talamban','alkeia-tayud':'Alkeia Tayud','kazumi-linao':'Kazumi Linao','oneplus-pardo':'Oneplus Pardo','welmart-inayawan':'Welmart Inayawan','ginsey-oslob':'Ginsey Oslob','felcon-bato':'Felcon Bato'};

const status=s=>$('status').textContent=s;

const read=file=>new Promise((resolve,reject)=>{if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>20*1024*1024)return reject(Error('Choose a PNG, JPG or WebP under 20 MB.'));const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Could not read image.'));r.readAsDataURL(file)});

const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('This image could not be opened.'));im.src=src});

const db=new Promise((resolve,reject)=>{const r=indexedDB.open('store-template-import-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('drafts',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});

async function storage(action,value){const d=await db;return new Promise((resolve,reject)=>{const t=d.transaction('drafts',action==='put'?'readwrite':'readonly'),r=t.objectStore('drafts')[action](...(value===undefined?[]:[value]));t.oncomplete=()=>resolve(r.result);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error)})}

function controls(){for(const id of ['save','export','detect','findHeaders','addText','addImage'])$(id).disabled=!project||busy;$('file').disabled=busy;$('cancel').hidden=!busy;$('progress').hidden=!busy;$('editor').inert=busy;$('templateDetails').inert=busy}

function mark(){dirty=true;$('save').textContent='Save draft •';render()}

function render(){if(!project)return;ctx.clearRect(0,0,project.width,project.height);ctx.drawImage(original,0,0);for(const l of project.layers){if(!l.changed)continue;const b=l.source||l;ctx.fillStyle=l.background;if(l.type==='text'||l.coverImage!==false){ctx.fillRect(b.x-2,b.y-2,b.w+4,b.h+4);ctx.fillRect(l.x-2,l.y-2,l.w+4,l.h+4);}if(l.type==='text'){ctx.fillStyle=l.color;ctx.font=`700 ${l.size}px Arial`;ctx.textBaseline='top';l.text.split('\n').forEach((line,i)=>ctx.fillText(line,l.x,l.y+i*l.size*1.15,l.w))}else if(images.has(l.image)){const im=images.get(l.image),scale=Math.min(l.w/im.width,l.h/im.height);ctx.drawImage(im,l.x+(l.w-im.width*scale)/2,l.y+(l.h-im.height*scale)/2,im.width*scale,im.height*scale)}}

 $('regions').replaceChildren();$('layers').replaceChildren();$('count').textContent=project.layers.length;

 for(const l of project.layers){const name=l.type==='text'?l.text:'Product image';const button=document.createElement('button');button.type='button';button.className=l.id===selected?'active':'';button.textContent=name+(l.confidence<65?' · Check text':'');button.onclick=()=>select(l.id);$('layers').append(button);if($('outlines').checked){const r=document.createElement('button');r.type='button';r.className='region'+(l.id===selected?' active':'');r.style.cssText=`left:${l.x/project.width*100}%;top:${l.y/project.height*100}%;width:${l.w/project.width*100}%;height:${l.h/project.height*100}%`;r.setAttribute('aria-label','Edit '+name);r.onclick=()=>select(l.id);$('regions').append(r)}}}

function select(id){selected=id;const l=project.layers.find(x=>x.id===id);$('editor').hidden=!l;$('hint').hidden=!!l;window.refreshImportCatalog?.(l);window.refreshImportBackground?.(l);if(!l)return render();for(const k of ['text','x','y','w','h','size','background','color'])$(k).value=l[k]??'';for(const k of ['textLabel','sizeLabel','colorLabel'])$(k).hidden=l.type!=='text';$('replacementLabel').hidden=l.type!=='image';render()}

async function open(p){project=p;project.storeId ||= '';project.format='store-editable-template';$('templateDetails').hidden=false;$('title').value=project.name;$('assignedStore').value=project.storeId;original=await load(p.source);images.clear();for(const l of p.layers)if(l.image)images.set(l.image,await load(l.image));$('canvas').width=p.width;$('canvas').height=p.height;$('empty').hidden=true;$('sheet').hidden=false;$('dimensions').textContent=p.width+' × '+p.height;selected=null;dirty=false;$('save').textContent='Save draft';select(null);controls()}

async function library(){try{const list=await storage('getAll');$('library').replaceChildren();for(const p of list.sort((a,b)=>b.updated-a.updated)){const b=document.createElement('button');b.textContent=(storeNames[p.storeId]||'Unassigned')+' ? '+p.name;b.disabled=busy;b.onclick=async()=>{if(busy||dirty&&!confirm('Discard unsaved changes and open this draft?'))return;try{await open(p);status('Saved draft opened.')}catch(e){status(e.message)}};$('library').append(b)}}catch(e){status('Draft storage unavailable: '+e.message)}}

function background(l){const c=document.createElement('canvas');c.width=project.width;c.height=project.height;const x=c.getContext('2d');x.drawImage(original,0,0);const points=[[l.x-3,l.y-3],[l.x+l.w+3,l.y-3],[l.x-3,l.y+l.h+3]];const values=points.map(([a,b])=>[...x.getImageData(Math.max(0,Math.min(c.width-1,a)),Math.max(0,Math.min(c.height-1,b)),1,1).data].slice(0,3));return '#'+[0,1,2].map(i=>values.map(v=>v[i]).sort((a,b)=>a-b)[1].toString(16).padStart(2,'0')).join('')}

function detectCards(){

 const c=document.createElement('canvas'),scale=Math.min(1,600/project.width);c.width=Math.round(project.width*scale);c.height=Math.round(project.height*scale);const g=c.getContext('2d');g.drawImage(original,0,0,c.width,c.height);const data=g.getImageData(0,0,c.width,c.height).data,seen=new Uint8Array(c.width*c.height),cards=[];

 const white=i=>data[i*4]>225&&data[i*4+1]>225&&data[i*4+2]>220;

 for(let i=0;i<seen.length;i++){

  if(seen[i]||!white(i))continue;const queue=[i];seen[i]=1;let minX=c.width,minY=c.height,maxX=0,maxY=0;

  for(let q=0;q<queue.length;q++){const at=queue[q],x=at%c.width,y=Math.floor(at/c.width);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);for(const n of [x>0?at-1:-1,x<c.width-1?at+1:-1,at-c.width,at+c.width])if(n>=0&&n<seen.length&&!seen[n]&&white(n)){seen[n]=1;queue.push(n)}}

  const w=maxX-minX,h=maxY-minY;

  if(w<c.width*.09||w>c.width*.42||h<c.height*.045||h>c.height*.36||queue.length<w*h*.25)continue;

  const x=minX/scale,y=minY/scale,right=maxX/scale,bottom=maxY/scale;

  const texts=project.layers.filter(l=>l.type==='text'&&l.x>=x&&l.x+l.w<=right&&l.y>y+h/scale*.5&&l.y<bottom);

  const end=texts.length?Math.min(...texts.map(t=>t.y))-5:bottom;

  cards.push({id:crypto.randomUUID(),type:'image',x:Math.round(x+3),y:Math.round(y+3),w:Math.round(w/scale-6),h:Math.round(end-y-6),background:'#ffffff',changed:false,confidence:60});

 }

 return cards.filter(l=>l.h>15).sort((a,b)=>b.w*b.h-a.w*a.h).filter((l,i,all)=>!all.slice(0,i).some(b=>Math.max(0,Math.min(l.x+l.w,b.x+b.w)-Math.max(l.x,b.x))*Math.max(0,Math.min(l.y+l.h,b.y+b.h)-Math.max(l.y,b.y))>l.w*l.h*.8)).sort((a,b)=>a.y-b.y||a.x-b.x).slice(0,80);

}

async function detectHeaders(ticket){
 const scan=document.createElement('canvas'),ratio=Math.min(1,800/project.width);scan.width=Math.round(project.width*ratio);scan.height=Math.round(project.height*ratio);const context=scan.getContext('2d');context.drawImage(original,0,0,scan.width,scan.height);const pixels=context.getImageData(0,0,scan.width,scan.height).data;
 const bands=[];let start=-1;
 for(let y=0;y<=scan.height;y++){let colored=0;for(let x=0;y<scan.height&&x<scan.width;x++){const i=(y*scan.width+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];if((b>r*1.4&&b>g*1.15&&r<150)||(r>g*1.6&&r>b*1.4&&g<140))colored++}const yes=colored>scan.width*.30;if(yes&&start<0)start=y;if(!yes&&start>=0){const h=y-start;if(h>=8&&h<scan.height*.085)bands.push({y:Math.max(0,(start-8)/ratio),h:(h+16)/ratio});start=-1}}
 const layers=[];await worker.setParameters({tessedit_pageseg_mode:'7'});
 const mergedBands=[];for(const band of bands){const last=mergedBands.at(-1);if(last&&band.y<=last.y+last.h){last.h=Math.max(last.y+last.h,band.y+band.h)-last.y}else mergedBands.push({...band})}
 for(const band of mergedBands.slice(0,16)){
  if(ticket!==job)return [];
  status('Second OCR pass: checking category headers?');const c=document.createElement('canvas'),scale=Math.min(2,3000/project.width);c.width=Math.round(project.width*scale);c.height=Math.round(band.h*scale);const g=c.getContext('2d');g.drawImage(original,0,band.y,project.width,band.h,0,0,c.width,c.height);const data=g.getImageData(0,0,c.width,c.height);
  for(let i=0;i<data.data.length;i+=4){const r=data.data[i],green=data.data[i+1],b=data.data[i+2];const ink=(r>160&&green>150)||(r>185&&green>185&&b>185);const v=ink?0:255;data.data[i]=data.data[i+1]=data.data[i+2]=v}// Remove long decorative rules before recognizing a single header line.
  for(let y=0;y<c.height;y++){let begin=-1;for(let x=0;x<=c.width;x++){const black=x<c.width&&data.data[(y*c.width+x)*4]===0;if(black&&begin<0)begin=x;if(!black&&begin>=0){if(x-begin>c.width*.25)for(let z=begin;z<x;z++){const at=(y*c.width+z)*4;data.data[at]=data.data[at+1]=data.data[at+2]=255}begin=-1}}}
  g.putImageData(data,0,0);
  const found=await worker.recognize(c,{}, {tsv:true});for(const l of TemplateImportCore.layersFromTSV(found.data.tsv,c.width,c.height)){if(!/[a-z]{3}/i.test(l.text))continue;layers.push({...l,x:l.x/scale,y:band.y+l.y/scale,w:l.w/scale,h:l.h/scale,size:l.size/scale})}
 }
 return layers;
}
async function detect(headersOnly=false){if(!project||busy)return;if(!headersOnly&&project.layers.length&&!confirm('Replace detected regions? Your original image is preserved.'))return;const ticket=++job;busy=true;controls();status('Loading text recognition. First use downloads the recognition model.');try{if(!window.Tesseract)throw Error('Text recognition could not load. Connect to the internet and reload. Your draft is kept.');worker=await Tesseract.createWorker('eng',1,{logger:m=>{if(ticket===job){status(m.status+' '+Math.round((m.progress||0)*100)+'%');$('progress').value=m.progress||0}}});if(ticket!==job)return;await worker.setParameters({tessedit_pageseg_mode:'11'});const result=headersOnly?null:await worker.recognize(project.source,{}, {tsv:true});if(ticket!==job)return;const firstPass=headersOnly?project.layers:TemplateImportCore.layersFromTSV(result.data.tsv,project.width,project.height);let headers=[];try{headers=await detectHeaders(ticket)}catch(error){if(ticket===job)console.warn('Header OCR unavailable',error.message)}if(ticket!==job)return;project.layers=TemplateImportCore.mergeTextLayers(firstPass,headers);for(const l of project.layers){if(headersOnly&&firstPass.some(old=>old.id===l.id))continue;l.background=background(l);const hex=l.background.slice(1);l.color=parseInt(hex.slice(0,2),16)+parseInt(hex.slice(2,4),16)+parseInt(hex.slice(4,6),16)>380?'#163b65':'#ffffff'}const textCount=project.layers.filter(l=>l.type==='text').length, cards=headersOnly?[]:detectCards();project.layers.push(...cards);selected=null;mark();select(null);status(textCount+' text regions and '+cards.length+' possible product image regions detected. Review the outlines; add or correct any missed regions.');}catch(e){if(ticket===job)status(e.message+' You can still mark regions manually.')}finally{if(worker){await worker.terminate();worker=null}busy=false;$('cancel').disabled=false;controls();library();if(ticket!==job)status('Detection cancelled. The original image is kept.')}}

$('file').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(dirty&&!confirm('Discard unsaved changes and upload a new poster?')){e.target.value='';return}try{const source=await read(file),im=await load(source);if(im.width*im.height>24000000)throw Error('Choose an image under 24 megapixels.');await open({id:crypto.randomUUID(),name:file.name.replace(/\.[^.]+$/,''),source,width:im.width,height:im.height,layers:[],version:1});dirty=true;await detect()}catch(e){status(e.message)}e.target.value=''};

$('detect').onclick=()=>detect();$('findHeaders').onclick=()=>detect(true);$('cancel').onclick=async()=>{job++;$('cancel').disabled=true;status('Cancelling detection?');if(worker)await worker.terminate();};

$('assignedStore').onchange=()=>{if(project){project.storeId=$('assignedStore').value;mark()}};
$('editor').onsubmit=e=>e.preventDefault();$('title').oninput=()=>{project.name=$('title').value.trim();mark()};

for(const key of ['text','x','y','w','h','size','background','color'])$(key).oninput=()=>{const l=project.layers.find(x=>x.id===selected);if(!l||!$(key).checkValidity())return;l.source||={x:l.x,y:l.y,w:l.w,h:l.h};l[key]=['x','y','w','h','size'].includes(key)?Number($(key).value):$(key).value;l.x=Math.max(0,Math.min(project.width-1,l.x));l.y=Math.max(0,Math.min(project.height-1,l.y));l.w=Math.max(1,Math.min(project.width-l.x,l.w));l.h=Math.max(1,Math.min(project.height-l.y,l.h));l.changed=true;mark()};

$('replacement').onchange=async e=>{const file=e.target.files[0];if(!file)return;const l=project.layers.find(x=>x.id===selected);try{const src=await read(file),im=await load(src);images.set(src,im);l.image=src;delete l.imageBeforeRemoval;delete l.catalogProduct;window.refreshImportBackground?.(l);l.source||={x:l.x,y:l.y,w:l.w,h:l.h};l.changed=true;mark()}catch(e){status(e.message)}e.target.value=''};

$('reset').onclick=()=>{const l=project.layers.find(x=>x.id===selected);if(l.source)Object.assign(l,l.source);l.changed=false;select(l.id);mark()};$('remove').onclick=()=>{project.layers=project.layers.filter(l=>l.id!==selected);select(null);mark()};

for(const [id,type] of [['addText','text'],['addImage','image']])$(id).onclick=()=>{mode=type;status('Drag a rectangle on the poster for the '+type+' region.');$('regions').style.display='none'};

let start=null;function point(e){const r=$('sheet').getBoundingClientRect();return {x:Math.round((e.clientX-r.left)/r.width*project.width),y:Math.round((e.clientY-r.top)/r.height*project.height)}}

$('sheet').onpointerdown=e=>{if(!mode)return;e.preventDefault();start=point(e);$('sheet').setPointerCapture(e.pointerId)};

$('sheet').onpointerup=e=>{if(!mode||!start)return;const end=point(e),l={id:crypto.randomUUID(),type:mode,x:Math.max(0,Math.min(start.x,end.x)),y:Math.max(0,Math.min(start.y,end.y)),w:Math.abs(end.x-start.x),h:Math.abs(end.y-start.y),text:'Edit text',size:24,color:'#163b65',background:'#ffffff',changed:false};l.w=Math.min(l.w,project.width-l.x);l.h=Math.min(l.h,project.height-l.y);if(l.w>5&&l.h>5){l.background=background(l);project.layers.push(l);mark();select(l.id)}mode=null;start=null;$('regions').style.display='';status('Region added. Edit its fields or choose a replacement image.')};

$('outlines').onchange=render;$('save').onclick=async()=>{if(!project)return;if(!project.name?.trim()||project.name.length>120){$('title').reportValidity();$('title').focus();status('Enter a template name before saving.');return}if(!Object.hasOwn(storeNames,project.storeId)){$('assignedStore').reportValidity();$('assignedStore').focus();status('Choose a store before saving.');return}try{project.updated=Date.now();await storage('put',structuredClone(project));dirty=false;$('save').textContent='Save draft';status('Editable template saved for '+storeNames[project.storeId]+'. Background, regions and styling are preserved.');await library()}catch(e){status('Could not save. Your edits remain open: '+e.message)}};

$('export').onclick=()=>{render();$('canvas').toBlob(blob=>{if(!blob)return status('Export failed. Please retry.');const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=project.name+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)},'image/png')};

window.addEventListener('beforeunload',e=>{if(dirty||busy){e.preventDefault();e.returnValue=''}});library();controls();
