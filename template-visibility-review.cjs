const assert=require('node:assert/strict');
const core=require('./shared-catalog.js');
(async()=>{
 const project={version:1,sourceRevision:1,state:{products:[],templates:[],homeBack:{slots:[]},templateVisibility:{'peso-back':false}}};
 const change={kind:'visibility',templateId:'home-back',templateName:'Home Back',before:true,after:false};
 const result=await core.prepare(project,[change]);
 assert.equal(result.project.state.templateVisibility['home-back'],false);
 assert.equal(result.project.state.templateVisibility['peso-back'],false);
 assert.deepEqual(result.project.state.homeBack,project.state.homeBack);
 assert.equal(result.project.sourceRevision,2);
 assert.equal((await core.prepare(result.project,[change])).count,0);
 assert.equal((await core.prepare(result.project,[{...change,before:false,after:true}])).project.state.templateVisibility['home-back'],true);
 await assert.rejects(core.prepare(project,[{...change,templateId:'unknown'}]),/template/i);
 await assert.rejects(core.prepare(project,[{...change,after:'false'}]),/visibility/i);
 assert.equal(project.state.templateVisibility['home-back'],undefined);
 console.log('PASS: visibility publication, isolation, validation and idempotence');
})().catch(e=>{console.error(e);process.exitCode=1});
