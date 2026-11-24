const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage();await page.route('https://photo.test/',route=>route.fulfill({contentType:'text/html',body:'<!doctype html>'}));await page.goto('https://photo.test/');await page.addScriptTag({path:'shared-catalog.js'});
  const result=await page.evaluate(async()=>{
   const product={id:'test',name:'Test product',price:10,image:null,templateId:'home-back'};
   const project={version:1,sourceRevision:1,state:{products:[product],homeBack:{slots:[{productId:'test'}]}}};
   const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1sAAAAASUVORK5CYII=';
   const svg='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="10" height="10" fill="red"/></svg>');
   const large='data:image/png;base64,'+btoa(atob(png)+' '.repeat(5*1024*1024));
   const output=[];
   for(const photo of [svg,large]){
    const changes=[{identity:product,fields:{image:{before:null,after:photo}}}];
    const prepared=await SharedCatalog.prepare(project,changes);
    const content=[...prepared.images.values()][0];
    const im=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src='data:image/png;base64,'+content});
    const canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);
    output.push({mime:prepared.project.state.products[0].image.mime,size:atob(content).length,retry:(await SharedCatalog.prepare(prepared.project,changes)).count,alpha:ctx.getImageData(im.width-1,im.height-1,1,1).data[3]});
   }
   let invalid='';try{await SharedCatalog.prepare(project,[{identity:product,fields:{image:{before:null,after:'data:image/png;base64,YWJj'}}}])}catch(e){invalid=e.message}
   return {output,invalid,original:project.state.products[0].image};
  });
  for(const image of result.output){assert.equal(image.mime,'image/png');assert(image.size<=5*1024*1024);assert.equal(image.retry,0)}
  assert.equal(result.output[0].alpha,0);assert.equal(result.original,null);assert.match(result.invalid,/Test product:.*valid PNG/);
  console.log('PASS: oversized photos and SVG images publish as PNG, preserve transparency, retry safely, and invalid photos identify the product.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
