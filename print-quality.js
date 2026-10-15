// Canvas PNG export with explicit physical resolution metadata.
const PRINT_DPI=300;
async function printQualityPNG(canvas){
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
 if(!blob)throw Error('PNG export failed');
 const bytes=new Uint8Array(await blob.arrayBuffer()),view=new DataView(bytes.buffer);
 const physical=new Uint8Array(21),data=new DataView(physical.buffer),pixelsPerMetre=Math.round(PRINT_DPI/0.0254);
 data.setUint32(0,9);physical.set([112,72,89,115],4);
 data.setUint32(8,pixelsPerMetre);data.setUint32(12,pixelsPerMetre);physical[16]=1;
 let crc=0xffffffff;
 for(const byte of physical.subarray(4,17)){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}
 data.setUint32(17,(crc^0xffffffff)>>>0);
 const chunks=[bytes.subarray(0,8)];
 for(let offset=8;offset<bytes.length;){const length=view.getUint32(offset),end=offset+length+12,type=String.fromCharCode(...bytes.subarray(offset+4,offset+8));if(type!=='pHYs')chunks.push(bytes.subarray(offset,end));if(type==='IHDR')chunks.push(physical);offset=end}
 return new Blob(chunks,{type:'image/png'});
}
function printArtworkPixels(){const {artWidth,rotatedWidth}=printGeometry();return {width:Math.round(artWidth/25.4*PRINT_DPI),height:Math.round(rotatedWidth/25.4*PRINT_DPI)}}
