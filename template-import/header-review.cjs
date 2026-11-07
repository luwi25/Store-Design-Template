const assert=require('node:assert/strict'),{mergeTextLayers}=require('./core.js');
const first=[{id:'a',text:'Kitchenware',x:10,y:20,w:120,h:30}];
const merged=mergeTextLayers(first,[{text:'KITCHENWARE',x:12,y:21,w:118,h:29},{text:'SCHOOL SUPPLIES',x:10,y:100,w:150,h:30}]);
assert.equal(merged.length,2);assert.equal(merged[0].text,'Kitchenware');assert.equal(new Set(merged.map(x=>x.id)).size,2);console.log('PASS: second OCR adds missed headers without duplicating existing regions');
