// Photo pixels stay in this browser. The worker only downloads static model files.
window.removeBackgroundLocally = (() => {
 let worker, pending, sequence=0;
 return async source => {
  if(pending)throw Error('Another image is being processed. Please wait.');
  if(!worker)worker=new Worker('./background-worker.js');
  const current=++sequence;
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{worker.terminate();worker=null;pending=null;reject(Error('Background removal took too long on this device. Try a smaller image.'))},180000);
   pending=true;
   worker.onmessage=event=>{if(event.data.id!==current)return;clearTimeout(timer);pending=null;event.data.error?reject(Error(event.data.error)):resolve(event.data.result)};
   worker.onerror=()=>{clearTimeout(timer);pending=null;worker.terminate();worker=null;reject(Error('Could not load the background remover. Check your connection and try again.'))};
   worker.postMessage({id:current,source});
  });
 };
})();
