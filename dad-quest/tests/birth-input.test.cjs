const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function setup(){
 const nodes=new Map(),events={};let raf,now=0;const buttons=[];
 function element(id){const handlers={};const e={id,open:false,disabled:false,dataset:{},textContent:'',style:{},classList:{toggle(){}},setAttribute(k,v){this[k]=v;},focus(options){this.focusOptions=options;},scrollIntoView(){},showModal(){this.open=true;},close(){this.open=false;},querySelector(){return{append(){}};},addEventListener(k,f){handlers[k]=f;},fire(k,event){handlers[k]?.(event);},getBoundingClientRect(){return{left:0,top:0,width:960,height:560};},setPointerCapture(id){this.capture=id;},hasPointerCapture(id){return this.capture===id;},releasePointerCapture(){this.capture=null;}};
 Object.defineProperty(e,'innerHTML',{get(){return this.html||'';},set(html){this.html=html;for(const m of html.matchAll(/id="([^"]+)"/g))nodes.set(m[1],element(m[1]));if(id==='tools'){buttons.length=0;for(const m of html.matchAll(/data-chair="([^"]+)"/g)){const b=element(m[1]);b.dataset.chair=m[1];buttons.push(b);}}}});return e;}
 for(const id of ['scene','music','pause','restart','next','phase','counter','moment-title','tip','detail','chapters','speech','feedback','tools','dialog','dialog-content','save-status'])nodes.set(id,element(id));
 class Music{constructor(){this.enabled=true;this.playing=false;}setEnabled(v){this.enabled=v;}setPlaying(v){this.playing=v;}}
 const env={window:{addEventListener:(k,f)=>events[k]=f},NightMusic:Music,BirthScene:{draw(){}},document:{hidden:false,getElementById:id=>nodes.get(id)||null,querySelector:()=>element('game'),querySelectorAll:()=>buttons,addEventListener(){},createElement:()=>element('new')},performance:{now:()=>now},requestAnimationFrame:fn=>raf=fn};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/js/birth-core.js'),'utf8'),env);const seed={...env.window.BirthJourney.initial(),stage:3,hand:4,rest:3};env.localStorage={getItem:()=>JSON.stringify(seed),setItem(){}};
 let code=fs.readFileSync(path.join(__dirname,'../assets/js/birth.js'),'utf8');code=code.replace('hud();if(s.complete)finish();','globalThis.inspect=()=>({s,target,route,drag,keys,music,paused});globalThis.walk=walkTo;hud();if(s.complete)finish();');vm.runInNewContext(code,env);nodes.get('resume').onclick();
 return {env,nodes,buttons,events,canvas:nodes.get('scene'),inspect:env.inspect,tick(seconds){for(let i=0;i<seconds*20;i++){now+=50;raf(now);}},event(x,y,id=1){return{clientX:x,clientY:y,pointerId:id,preventDefault(){}};}};
}
test('chair drag cancels stale walking, preserves grab offset and stays after release',()=>{
 const g=setup();g.env.walk({x:760,y:435});const start=g.inspect().s.chair;
 g.canvas.onpointerdown(g.event(start.x+20,start.y+10));assert.equal(g.canvas.focusOptions.preventScroll,true);assert.equal(g.inspect().target,null);assert.equal(g.inspect().route.length,0);
 g.canvas.onpointermove(g.event(260,460));assert.equal(g.inspect().s.chair.x,240);assert.equal(g.inspect().s.chair.y,450);
 const pos=JSON.stringify(g.inspect().s.player);g.tick(2);assert.equal(JSON.stringify(g.inspect().s.player),pos);
 g.canvas.fire('pointerup',g.event(260,460));g.tick(3);assert.equal(JSON.stringify(g.inspect().s.player),pos);assert.equal(g.inspect().drag,null);
});
test('chair buttons and keyboard nudge the chair without retaining a walking command',()=>{
 const g=setup();g.env.walk({x:760,y:435});g.buttons.find(b=>b.dataset.chair==='left').onclick();const after=JSON.stringify(g.inspect().s.player);g.tick(2);assert.equal(JSON.stringify(g.inspect().s.player),after);
 const x=g.inspect().s.chair.x;g.events.keydown({key:'ArrowLeft',target:g.canvas,preventDefault(){}});assert.equal(g.inspect().s.chair.x,x-15);assert.equal(g.inspect().keys.size,0);const afterKey=JSON.stringify(g.inspect().s.player);g.tick(2);assert.equal(JSON.stringify(g.inspect().s.player),afterKey);
});
test('stray floor taps and second pointers cannot send dad away while positioning chair',()=>{
 const g=setup();g.canvas.onpointerdown(g.event(850,480));assert.equal(g.inspect().target,null);
 const c=g.inspect().s.chair;g.canvas.onpointerdown(g.event(c.x,c.y));g.canvas.onpointerdown(g.event(80,480,2));g.canvas.onpointermove(g.event(80,480,2));assert.equal(g.inspect().s.chair.x,c.x);assert.equal(g.inspect().target,null);
 g.canvas.fire('pointercancel',g.event(c.x,c.y));assert.equal(g.inspect().drag,null);g.tick(1);assert.equal(g.inspect().target,null);
});
test('default music starts on entering, pauses, and preserves a manual mute',()=>{
 const g=setup(),m=g.inspect().music;assert.equal(m.enabled,true);assert.equal(m.playing,true);g.nodes.get('pause').onclick();assert.equal(m.playing,false);g.nodes.get('resume').onclick();assert.equal(m.playing,true);
 g.nodes.get('music').onclick();assert.equal(m.enabled,false);g.nodes.get('pause').onclick();g.nodes.get('resume').onclick();assert.equal(m.playing,false);
});
