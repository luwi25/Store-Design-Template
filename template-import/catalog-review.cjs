const assert=require('node:assert/strict'),c=require('./catalog-core.js');
const products=[{id:'1',name:'Excellent Drawer',code:'ABC-123'},{id:'2',name:'Rice Cooker',code:'RC01'}];
assert.equal(c.search(products,'EXCELLENT')[0].id,'1');assert.equal(c.search(products,'abc-123')[0].id,'1');assert.equal(c.search(products,'rice rc01')[0].id,'2');assert.equal(c.search(products,'missing').length,0);
assert.equal(c.imageURL(null),null);assert.equal(c.imageURL({__defaultImage:'../../private'}),null);assert.equal(c.imageURL({__defaultImage:'images/'+'a'.repeat(64)+'.png'}),'../defaults/images/'+'a'.repeat(64)+'.png');console.log('PASS: catalog name/code search and image path validation');

