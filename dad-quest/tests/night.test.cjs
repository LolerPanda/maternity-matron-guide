// Deterministic game-loop tests without a browser or rendering dependencies.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function game(){
 let clock=0,raf;const elements=new Map();const events={};
 const context2d=new Proxy({}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 function element(id){if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',style:{},disabled:false,classList:{add(){},remove(){}},addEventListener(){},showModal(){},close(){},focus(){},scrollIntoView(){},getContext:()=>context2d});return elements.get(id);}
 const sandbox={console,Map,Set,Math,performance:{now:()=>clock},requestAnimationFrame:fn=>{raf=fn;},setTimeout:fn=>{fn();},localStorage:{getItem:()=>null,setItem(){}},location:{href:''},document:{querySelector:element,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener:(name,fn)=>events[name]=fn}};
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../assets/js/night.js'),'utf8').replace('reset();running=false;', 'globalThis.inspect=()=>({player,path,state});reset();running=false;'),sandbox);
 element('#begin').onclick();
 function tick(seconds){for(let i=0;i<seconds*50;i++){clock+=20;raf(clock);}}
 function click(id){assert.ok(element(id).onclick,id+' has a click handler');element(id).onclick();}
 function goAndDo(label){click('#help-route');for(let n=0;n<800;n++){tick(.02);if(element('#action-label').textContent.includes(label)&&!element('#interact').disabled)break;}assert.ok(element('#action-label').textContent.includes(label),`expected ${label}, got ${element('#action-label').textContent}: ${JSON.stringify(sandbox.inspect())}`);assert.equal(element('#interact').disabled,false);click('#interact');for(let n=0;n<450;n++){tick(.02);if(element('#interact').innerHTML.includes('互动'))break;}}
 return {element,tick,click,goAndDo,events,inspect:sandbox.inspect};
}
test('a complete night is reachable through movement, carrying, care, waiting, and handoff',()=>{
 const g=game(),d=g.goAndDo;
 d('拿走小熊');d('放入收纳篮');d('拿走枕头');d('放入收纳篮');d('检查床面');
 d('接一杯温水');d('把水递给妈妈');d('接过宝宝');d('低位换护垫');
 const position={...g.inspect().player};g.events.keydown({key:'d',target:{closest:()=>null},preventDefault(){}});g.tick(1);g.events.keyup({key:'d'});assert.equal(g.inspect().player.x,position.x);assert.equal(g.inspect().player.y,position.y);
 d('清洁双手');d('轻柔清洁');d('收好用品');d('仰卧放下');
 d('准备一份餐食');d('放好餐食');d('收进篮子');d('启动洗衣机');
 // Pausing must stop simulated time, without deleting ongoing laundry progress.
 const before=g.element('#clock').textContent;g.click('#pause');g.tick(20);assert.equal(g.element('#clock').textContent,before);g.click('#resume');
 g.tick(15);d('取出衣物');d('礼貌说明');d('回复家人');d('请信任的家人');g.tick(20);d('交接宝宝');d('坐下来休息');
 assert.ok(g.element('#overlay-content').innerHTML.includes('辛苦了，今晚的队友'));
 assert.equal(g.element('#task-count').textContent,'8 / 8');
 assertExitLinks(g);
});
test('ending early produces an honest partial summary and supports replay',()=>{
 const g=game();g.tick(2);g.click('#finish');g.click('#end-confirm');
 assert.ok(g.element('#overlay-content').innerHTML.includes('0 / 8'));
 assertExitLinks(g);
 g.click('#again');g.tick(1);assert.equal(g.element('#task-count').textContent,'0 / 8');
});

test('the night ends at the time limit with an accurate incomplete result',()=>{const g=game();g.tick(361);assert.ok(g.element('#overlay-content').innerHTML.includes('今晚，先走到这里'));assert.ok(g.element('#overlay-content').innerHTML.includes('0 / 8'));assertExitLinks(g);});

function assertExitLinks(g){const html=g.element('#overlay-content').innerHTML;assert.match(html,/href="adventure\.html\?chapter=shifts"/);assert.match(html,/href="series\.html"/);assert.ok(html.indexOf('recap-actions')<html.indexOf('features'),'exit links are above the lengthy recap');}
