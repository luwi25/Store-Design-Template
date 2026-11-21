// Internal print contracts; version names are never user-facing labels.
const TEMPLATE_VERSION_1 = Object.freeze({version:1,name:'Template Version 1'});
const TEMPLATE_VERSION_2 = Object.freeze({version:2,name:'Template Version 2',paper:[297,210],width:3508,height:2480});
function templateVersion(id=state.templateId){return [UBEST_V2_FRONT_ID,UBEST_V2_BACK_ID,TISA_V2_FRONT_ID,TISA_V2_BACK_ID,KAZUMI_V2_BACK_ID,KAZUMI_V2_FRONT_ID,ONEPLUS_V2_BACK_ID,ONEPLUS_V2_FRONT_ID,GINSEY_V2_BACK_ID,UNICO_V2_FRONT_ID,WELMART_V2_BACK_ID,WELMART_V2_FRONT_ID,GINSEY_V2_FRONT_ID,BESTCO_V2_BACK_ID,BESTCO_V2_FRONT_ID,HOME_V2_BACK_ID,HOME_V2_FRONT_ID,ALKEIA_V2_FRONT_ID,ALKEIA_V2_BACK_ID].includes(id)?TEMPLATE_VERSION_2:TEMPLATE_VERSION_1}
function isTemplateVersion2(){return templateVersion().version===2}
function syncTemplateVersionUI(){
 const landscape=isTemplateVersion2();poster.classList.toggle('landscape-template',landscape);window.dispatchEvent(new Event('template-preview-layout'));
 const paper=$('paperSelect'),fit=$('fitSelect');paper.disabled=landscape;fit.disabled=landscape;
 let option=fit.querySelector('[data-full-page]');
 if(landscape){state.poster.paper='a4';state.poster.fit='full';paper.value='a4';if(!option){option=document.createElement('option');option.value='full';option.dataset.fullPage='true';option.textContent='One full page';fit.append(option)}fit.value='full'}else option?.remove();
 document.querySelector('.stage-top strong').textContent=landscape?'A4 landscape | One full page':'Sale design | 2 copies per sheet';
 for(const node of document.querySelectorAll('.helper')){
  if(!node.dataset.version1Help&&(/Prints two identical copies|PNG: 1650|Download a print-ready PDF/.test(node.textContent)))node.dataset.version1Help=node.textContent;
  if(node.dataset.version1Help)node.textContent=landscape?'One full A4 landscape page (297 × 210 mm). PDF and PNG: 3508 × 2480 pixels at 300 DPI. Direct print: A4 landscape, margins None, scale 100%; a centered 3 mm safe border is included. For downloaded files, use Fit to printable area.':node.dataset.version1Help;
 }
}
function prepareTemplateVersion2Page(art){
 let style=$('dynamicPageRule');if(!style){style=document.createElement('style');style.id='dynamicPageRule';document.head.append(style)}
 style.textContent='@page{size:297mm 210mm;margin:0}';
 const page=document.createElement('div');page.className='landscape-print-page';art.className='landscape-print-art';page.append(art);
 $('printSheet').replaceChildren(page);document.body.classList.remove('printing-top','poster-intended-size');document.body.classList.add('printing-landscape');return page;
}
async function printTemplateVersion2(){
 const btn=$('printBtn');if(btn.disabled)return;btn.disabled=true;
 try{const canvas=await exportPosterCanvas(TEMPLATE_VERSION_2),im=document.createElement('img');im.src=canvas.toDataURL('image/png');im.alt=templateName(state.templateId,'Store design');await im.decode();prepareTemplateVersion2Page(im);window.print()}
 catch(error){console.error(error);document.body.classList.remove('printing-landscape');$('printSheet').replaceChildren();showNotice('Could not prepare the design for printing. Try again.')}
 finally{btn.disabled=false;syncProductActions()}
}
async function exportTemplateVersion2(format='pdf',ready=true){
 if(!activeTemplateAvailable()){showNotice('No visible template is available. Contact Admin.');return}
 const btn=$(format==='pdf'?'pdfBtn':ready?'printPngBtn':'pngBtn');if(btn.disabled)return;
 const label=btn.querySelector('span'),previous=label.textContent;btn.disabled=true;btn.setAttribute('aria-busy','true');label.textContent='Preparing '+format.toUpperCase()+'…';
 try{
  const id=state.templateId,name=templateName(id,'Store design');await ensureTemplateArtwork(id);
  if(state.templateId!==id)throw Error('Template changed during export');
  const canvas=await exportPosterCanvas(TEMPLATE_VERSION_2);
  const blob=await(format==='pdf'?printSheetPDF(canvas,TEMPLATE_VERSION_2.paper):printQualityPNG(canvas));
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=(name.replace(/[<>:"/\\|?*\x00-\x1f]/g,'').trim()||'Store design')+(ready?' - print-ready':'')+'.'+format;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  showNotice('A4 landscape '+format.toUpperCase()+' downloaded. Direct print: A4 landscape, margins None, scale 100%; a centered 3 mm safe border is included. For downloaded files, use Fit to printable area.');
 }catch(error){console.error(error);showNotice('Could not create the file. Wait for the artwork to load and try again.')}
 finally{btn.disabled=false;btn.removeAttribute('aria-busy');label.textContent=previous;syncProductActions()}
}
