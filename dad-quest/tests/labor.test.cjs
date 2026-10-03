const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function episode(){
 let now=0,raf;const nodes=new Map(),events={};
 const ctx=new Proxy({}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 function el(id){if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',disabled:false,style:{},classList:{add(){},remove(){}},addEventListener(){},showModal(){},close(){},focus(){},scrollIntoView(){},getContext:()=>ctx});return nodes.get(id);}
 const env={Map,Set,Math,performance:{now:()=>now},requestAnimationFrame:fn=>raf=fn,document:{querySelector:el,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener:(name,fn)=>events[name]=fn},localStorage:{getItem:()=>null,setItem(){}}};
 let code=fs.readFileSync(path.join(__dirname,'../assets/js/labor.js'),'utf8');
 code=code.replace('reset();running=false;','globalThis.inspect=()=>({state,player,path,action,paused,ended});reset();running=false;');vm.runInNewContext(code,env);
 el('#begin').onclick();
 const tick=seconds=>{for(let i=0;i<seconds*50;i++){now+=20;raf(now)}};
 const click=id=>el(id).onclick();
 function doTask(label){click('#help-route');for(let n=0;n<1000;n++){tick(.02);if(el('#action-label').textContent.includes(label)&&!el('#interact').disabled)break;}assert.ok(el('#action-label').textContent.includes(label),`Expected ${label}, got ${el('#action-label').textContent}; ${JSON.stringify(env.inspect())}`);assert.equal(el('#interact').disabled,false);click('#interact');for(let n=0;n<300;n++){tick(.02);if(!env.inspect().action)break;}}
 return{el,tick,click,doTask,inspect:env.inspect};
}
function prepare(g){const d=g.doTask;d('取出入院资料');d('递交资料');d('取出陪产偏好');d('听她说需求');d('把她确认的');d('取出她需要的靠枕');d('问她是否需要');d('询问当前能否');d('取一杯水');d('把水递到');d('开始专注陪伴');}
function rhythm(g){for(let n=0;n<1000&&g.inspect().state.hits<3;n++){g.tick(.02);const s=g.inspect().state,p=(Math.sin(s.rhythmTime*1.8-Math.PI/2)+1)/2;if(p>.42&&p<.58&&s.cooldown===0)g.click('#interact');}assert.equal(g.inspect().state.hits,3);}
test('full birth-partner episode completes through objects, timing and clinical handoff',()=>{
 const g=episode();prepare(g);
 // An early tap is a retry, never a completed response.
 g.click('#interact');assert.equal(g.inspect().state.hits,0);
 const before=g.inspect().state.rhythmTime;g.click('#pause');g.tick(8);assert.equal(g.inspect().state.rhythmTime,before);g.click('#resume');
 rhythm(g);const d=g.doTask;d('呼叫医护');g.tick(7);d('陪她提问');d('按她的意愿回复');d('约好探望时机');g.tick(.1);assert.equal(g.inspect().state.postpartum,true);d('拿起后续');d('与护士确认');d('坐回她身边');assert.equal(g.el('#task-count').textContent,'8 / 8');assert.ok(g.el('#overlay-content').innerHTML.includes('这一程，你一直在'));assert.equal(g.inspect().ended,true);
});
test('early end and time limit give partial recaps, replay resets state',()=>{
 const g=episode();g.click('#finish');g.click('#end-confirm');assert.ok(g.el('#overlay-content').innerHTML.includes('0/8'));g.click('#again');g.tick(481);assert.ok(g.el('#overlay-content').innerHTML.includes('这一程，先到这里'));assert.equal(g.inspect().ended,true);
});
test('chapter links and resources stay available alongside the night game',()=>{
 const root=path.resolve(__dirname,'..');for(const file of ['labor.html','index.html']){const html=fs.readFileSync(path.join(root,file),'utf8');for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(!m[1].startsWith('http'))assert.ok(fs.existsSync(path.join(root,m[1].split('?')[0])),m[1]);}}
 assert.ok(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('href="labor.html"'));
});
