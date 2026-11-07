const assert=require('node:assert/strict');
const {layersFromTSV}=require('./core.js');
const header='level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext\n';
const tsv=header+'5\t1\t1\t1\t1\t1\t10\t20\t50\t15\t95\tRice\n5\t1\t1\t1\t1\t2\t65\t20\t70\t15\t90\tCooker\n';
const layers=layersFromTSV(tsv,200,300);
assert.equal(layers.length,1);assert.equal(layers[0].text,'Rice Cooker');assert.equal(layers[0].w,125);assert.equal(layers[0].x,10);
assert.deepEqual(layersFromTSV('',200,300),[]);assert.equal(layers[0].changed,false);
console.log('PASS: OCR groups words by line and preserves source geometry.');
