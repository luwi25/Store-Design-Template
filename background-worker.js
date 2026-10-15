importScripts('./vendor/ort.wasm.min.js');
ort.env.wasm.numThreads=1;
ort.env.wasm.wasmPaths=new URL('./vendor/',self.location.href).href;
let sessionPromise;
self.onmessage=async ({data:{id,source}})=>{
 try{
  if(typeof source!=='string'||!source.startsWith('data:image/')||source.length>28*1024*1024)throw Error('Choose a product photo smaller than 20 MB.');
  const image=await createImageBitmap(await (await fetch(source)).blob());
  if(image.width*image.height>24000000){image.close();throw Error('Choose a photo smaller than 24 megapixels.')}
  const canvas=new OffscreenCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
  const small=new OffscreenCanvas(320,320),sc=small.getContext('2d');sc.drawImage(image,0,0,320,320);image.close();
  const pixels=sc.getImageData(0,0,320,320).data,input=new Float32Array(3*320*320),mean=[.485,.456,.406],std=[.229,.224,.225];let max=1;
  for(let i=0;i<pixels.length;i+=4)max=Math.max(max,pixels[i],pixels[i+1],pixels[i+2]);
  for(let i=0;i<320*320;i++)for(let c=0;c<3;c++)input[c*320*320+i]=(pixels[i*4+c]/max-mean[c])/std[c];
  if(!sessionPromise)sessionPromise=ort.InferenceSession.create(new URL('./vendor/u2netp.onnx',self.location.href).href,{executionProviders:['wasm']}).catch(error=>{sessionPromise=null;throw error});
  const session=await sessionPromise,outputs=await session.run({[session.inputNames[0]]:new ort.Tensor('float32',input,[1,3,320,320])}),mask=outputs[session.outputNames[0]].data;
  let lo=Infinity,hi=-Infinity;for(const v of mask){lo=Math.min(lo,v);hi=Math.max(hi,v)}
  if(hi-lo<1e-6)throw Error('No clear foreground was detected. Try a photo with a simpler background.');
  const maskPixels=sc.createImageData(320,320);for(let i=0;i<mask.length;i++){maskPixels.data[i*4]=255;maskPixels.data[i*4+1]=255;maskPixels.data[i*4+2]=255;maskPixels.data[i*4+3]=Math.round((mask[i]-lo)/(hi-lo)*255)}
  sc.putImageData(maskPixels,0,0);ctx.globalCompositeOperation='destination-in';ctx.drawImage(small,0,0,canvas.width,canvas.height);
  const blob=await canvas.convertToBlob({type:'image/png'}),url=new FileReaderSync().readAsDataURL(blob);
  self.postMessage({id,result:{image:url,width:canvas.width,height:canvas.height}});
 }catch(error){self.postMessage({id,error:error.message||'Could not remove this background. Your original photo is unchanged.'})}
};
