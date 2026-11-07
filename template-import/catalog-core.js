(function(root){
 function search(products,query){const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);return products.filter(p=>terms.every(t=>(String(p.name||'')+' '+String(p.code||'')).toLowerCase().includes(t))).slice(0,30)}
 function imageURL(image){if(image&&typeof image==='object'&&/^images\/[a-f0-9]{64}\.(png|jpg|webp|svg)$/.test(image.__defaultImage))return '../defaults/'+image.__defaultImage;if(typeof image==='string'){if(/^data:image\/(png|jpeg|webp);base64,/.test(image))return image;const m=image.match(/^(?:defaults\/)?(images\/[a-f0-9]{64}\.(?:png|jpg|webp|svg))$/);if(m)return '../defaults/'+m[1]}return null}
 const api={search,imageURL};if(typeof module==='object')module.exports=api;else root.ImportCatalog=api;
})(globalThis);
