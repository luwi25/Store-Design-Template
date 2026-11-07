(function(root){
function layersFromTSV(tsv,width,height){
 const groups=new Map();
 for(const row of tsv.trim().split('\n').slice(1)){
  const c=row.split('\t');if(c[0]!=='5'||!c[11]?.trim()||Number(c[10])<25)continue;
  const x=+c[6],y=+c[7],w=+c[8],h=+c[9];if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)continue;
  const key=c.slice(1,5).join('/');let g=groups.get(key);if(!g){g={x,y,right:x+w,bottom:y+h,words:[],confidence:100};groups.set(key,g)}
  g.x=Math.min(g.x,x);g.y=Math.min(g.y,y);g.right=Math.max(g.right,x+w);g.bottom=Math.max(g.bottom,y+h);g.words.push(c.slice(11).join('\t').trim());g.confidence=Math.min(g.confidence,+c[10]);
 }
 return [...groups.values()].filter(g=>g.x>=0&&g.y>=0&&g.right<=width&&g.bottom<=height).map((g,i)=>({id:'text-'+i,type:'text',text:g.words.join(' '),x:g.x,y:g.y,w:g.right-g.x,h:g.bottom-g.y,size:g.bottom-g.y,color:'#163b65',background:'#ffffff',confidence:g.confidence,changed:false}));
}
function mergeTextLayers(first,second){
 const result=first.map(l=>({...l}));
 for(const candidate of second){const duplicate=result.some(l=>{const overlap=Math.max(0,Math.min(l.x+l.w,candidate.x+candidate.w)-Math.max(l.x,candidate.x))*Math.max(0,Math.min(l.y+l.h,candidate.y+candidate.h)-Math.max(l.y,candidate.y));return overlap>Math.min(l.w*l.h,candidate.w*candidate.h)*.45});if(!duplicate)result.push({...candidate,id:'header-'+result.length})}
 return result;
}
const api={layersFromTSV,mergeTextLayers};if(typeof module==='object')module.exports=api;else root.TemplateImportCore=api;
})(globalThis);
