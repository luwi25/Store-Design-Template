// Lossless, self-contained PDF download using the same geometry as printing.
async function printSheetPDF(canvas,paper){
 const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
 const rgb=new Uint8Array(canvas.width*canvas.height*3);
 for(let s=0,d=0;s<pixels.length;s+=4){rgb[d++]=pixels[s];rgb[d++]=pixels[s+1];rgb[d++]=pixels[s+2]}
 let bytes=rgb,filter='';
 if(typeof CompressionStream==='function'){
  bytes=new Uint8Array(await new Response(new Blob([rgb]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer());
  filter=' /Filter /FlateDecode';
 }
 const encode=value=>new TextEncoder().encode(value),parts=[],offsets=[0];let length=0;
 const push=value=>{const data=typeof value==='string'?encode(value):value;parts.push(data);length+=data.length};
 const object=(id,content)=>{offsets[id]=length;push(`${id} 0 obj\n${content}\nendobj\n`)};
 const w=(paper[0]/25.4*72).toFixed(5),h=(paper[1]/25.4*72).toFixed(5);
 push('%PDF-1.4\n');
 object(1,'<< /Type /Catalog /Pages 2 0 R >>');
 object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 object(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Sheet 5 0 R >> >> /Contents 4 0 R >>`);
 const commands=`q\n${w} 0 0 ${h} 0 0 cm\n/Sheet Do\nQ\n`;
 object(4,`<< /Length ${encode(commands).length} >>\nstream\n${commands}endstream`);
 offsets[5]=length;
 push(`5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Interpolate false${filter} /Length ${bytes.length} >>\nstream\n`);
 push(bytes);push('\nendstream\nendobj\n');
 const xref=length;push('xref\n0 6\n0000000000 65535 f \n');
 for(let id=1;id<=5;id++)push(`${String(offsets[id]).padStart(10,'0')} 00000 n \n`);
 push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
 return new Blob(parts,{type:'application/pdf'});
}
async function exportPDF(){
 const btn=$('pdfBtn');if(btn.disabled)return;
 if(usesCanvasTemplate()&&!activeSlots().length){showNotice('Add a product before downloading.');return}
 const label=btn.querySelector('span'),previous=label.textContent;
 btn.disabled=true;btn.setAttribute('aria-busy','true');label.textContent='Preparing PDF…';
 try{
  const templateId=state.templateId,name=templateName(templateId,'Store design');
  const {paper,half,rotatedWidth,artWidth}=printGeometry(),scale=300/25.4;
  const artwork=await exportPosterCanvas({width:Math.round(artWidth*scale),height:Math.round(rotatedWidth*scale)});
  const sheet=document.createElement('canvas');sheet.width=Math.round(paper[0]*scale);sheet.height=Math.round(paper[1]*scale);
  const ctx=sheet.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,sheet.width,sheet.height);ctx.imageSmoothingQuality='high';
  ctx.scale(sheet.width/paper[0],sheet.height/paper[1]);
  for(let i=0;i<2;i++){
   const top=i*paper[1]/2+(paper[1]/2-artWidth)/2;
   ctx.save();ctx.translate(half?0:5,top+artWidth);ctx.rotate(-Math.PI/2);ctx.drawImage(artwork,0,0,artWidth,rotatedWidth);ctx.restore();
  }
  ctx.strokeStyle='#888';ctx.lineWidth=.2;ctx.setLineDash([1.4,1.4]);ctx.beginPath();ctx.moveTo(0,paper[1]/2);ctx.lineTo(paper[0],paper[1]/2);ctx.stroke();
  const blob=await printSheetPDF(sheet,paper),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=(name.replace(/[<>:"/\\|?*\x00-\x1f]/g,'').trim()||'Store design')+' - print-ready.pdf';
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  showNotice('Print-ready PDF downloaded. Print at Actual size / 100%.');
 }catch(error){console.error(error);showNotice('Could not create the PDF. Wait for the artwork to load and try again.')}
 finally{btn.disabled=false;btn.removeAttribute('aria-busy');label.textContent=previous;syncProductActions()}
}
