const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function setup(){const env={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/js/recovery-core.js'),'utf8'),env);const G=env.window.RecoveryGames;let s;return {G,start(id){s=G.initial(id);return this;},get s(){return s;},act(type,v){s=G.act(s,type,v);assert.ok(G.valid(s,s.id),type+': '+JSON.stringify(s));return this;},tick(seconds){for(let i=0;i<Math.ceil(seconds*10);i++){s=G.tick(s,.1);assert.ok(G.valid(s,s.id),'tick '+JSON.stringify(s));}return this;},until(check,max=180){for(let i=0;i<max*10&&!check(s);i++){s=G.tick(s,.1);assert.ok(G.valid(s,s.id));}assert.ok(check(s),'condition not reached '+JSON.stringify(s));return this;}};}
function assign(g,actor,job){g.act('assign',{actor,job});}
test('two actors complete the shift through delayed arrival, actual movement, protected rest and final handoff',()=>{
 const g=setup().start('shifts');assign(g,'helper','cover');assert.equal(g.s.actors.helper.job,null);assign(g,'dad','rest');assert.equal(g.s.actors.dad.job,null);
 assign(g,'dad','review');assert.equal(g.s.done.length,0);g.until(s=>s.done.includes('review'));assign(g,'dad','admin');g.until(s=>s.helperArrived);assert.equal(g.s.recovered,false);g.act('reconfirm');assign(g,'helper','delivery');g.until(s=>s.done.includes('admin'));g.until(s=>s.done.includes('delivery'));assign(g,'helper','cover');g.until(s=>s.done.includes('cover'));assign(g,'dad','rest');assign(g,'helper','delivery');assert.equal(g.s.actors.helper.job,null);g.until(s=>s.done.includes('rest'));assign(g,'dad','handoff');g.until(s=>s.complete);assert.equal(g.s.done.length,6);assert.ok(g.s.events.includes('delay'));assert.ok(g.s.events.includes('handover'));
});
test('shift cancellation preserves completed work and rest cannot progress without a real handover',()=>{
 const g=setup().start('shifts');assign(g,'dad','review');g.tick(5);g.act('cancel','dad');assert.equal(g.s.done.length,0);assert.equal(g.s.actors.dad.job,null);assign(g,'dad','review');g.until(s=>s.done.includes('review'));g.tick(45);assign(g,'helper','cover');g.tick(20);assert.equal(g.s.done.includes('cover'),false);g.act('reconfirm');g.until(s=>s.done.includes('cover'));assert.ok(g.s.done.includes('review'));
});
test('crying chapter needs spatial environment changes, bedside placement and a supported pause, not silence',()=>{
 const g=setup().start('soothe');g.act('hold',true).tick(12);assert.equal(g.s.phase,0);for(const k of ['needs','comfort','support'])g.act('observe',k);g.act('environment');assert.equal(g.s.phase,1);g.act('light',35);for(const [i,src]of g.s.sources.entries())g.act('source',{id:src.id,x:740+i*40,y:260+i*70});g.act('environment');assert.equal(g.s.phase,2);g.act('place');assert.equal(g.s.baby,'arms');g.act('move',{x:250,y:305});g.until(s=>!s.target);g.act('place');assert.equal(g.s.baby,'cot');g.act('help').act('hold',true).until(s=>s.phase===4);g.act('handoff');assert.equal(g.s.complete,false);g.until(s=>s.wait>=14);g.act('handoff');assert.equal(g.s.complete,true);assert.equal('cryStopped' in g.s,false);
});
test('visitor queue handles delivery, appointments, agreed entry, camera boundaries and a real three-part handoff',()=>{
 const g=setup().start('visitors');g.tick(66);const talk=id=>g.act('person',id).act('talk',true).tick(3.1).act('talk',false);
 talk('parcel');g.act('tray',{x:500,y:200});assert.equal(g.s.handled.length,0);g.act('tray',{x:820,y:450});
 talk('relative');g.act('appointment',11).act('book');assert.equal(g.s.handled.includes('relative'),false);g.act('appointment',18).act('book');
 talk('friend');g.act('door',80).act('tray',{x:820,y:450});assert.equal(g.s.handled.includes('friend'),false);g.act('door',20).act('tray',{x:820,y:450});
 talk('cleaner');g.act('door',90).act('invite');assert.equal(g.s.inside.length,0);g.act('screen',100).act('invite').tick(9);assert.ok(g.s.handled.includes('cleaner'));
 talk('camera');g.act('privacy');assert.equal(g.s.handled.includes('camera'),false);g.act('door',20).act('privacy');
 talk('cover');g.act('door',90).act('invite');g.act('handoff');assert.equal(g.s.handoff,0);g.tick(9);g.act('handoff').act('handoff').act('handoff');assert.equal(g.s.complete,true);assert.equal(g.s.handled.length,6);
});
function pathToDoor(G){const q=[[G.grid.start]],seen=new Set([G.grid.start]);while(q.length){const path=q.shift(),n=path.at(-1);if(n===G.grid.end)return path;for(const next of [n-10,n+10,n-1,n+1]){if(next<0||next>=60||G.grid.blocked.includes(next)||seen.has(next)||Math.abs(next-n)===1&&Math.floor(next/10)!==Math.floor(n/10))continue;seen.add(next);q.push([...path,next]);}}throw Error('no path');}
test('urgent call stays unconditional; facts, physical corridor and infant handoff proceed while connected',()=>{
 const g=setup().start('signal');g.act('observe','symptom').act('speak','symptom').tick(5);assert.equal(g.s.sent.length,0);g.act('call');assert.equal(g.s.called,true);assert.equal(g.s.observed.length,1);
 for(const f of g.G.facts){g.act('observe',f.id).act('speak',f.id).tick(3.1);}assert.equal(g.s.sent.length,4);
 const path=pathToDoor(g.G);for(const cell of path.slice(1))g.act('route',cell);g.act('dispatch').tick(30);assert.equal(g.s.teamHere,false);g.act('obstacle',{x:800,y:500}).tick(30);assert.equal(g.s.teamHere,false);g.act('door').until(s=>s.teamHere);g.act('handoff');assert.equal(g.s.complete,false);g.act('backup').act('records').act('handoff');assert.equal(g.s.complete,true);
});
test('corridor drawing rejects walls, jumps and wrap-around but allows backtracking before dispatch',()=>{
 const g=setup().start('signal');g.act('call').act('route',51).act('route',59);assert.equal(g.s.route.length,2);g.act('route',50);assert.equal(g.s.route.length,1);g.act('route',40);assert.equal(g.s.route.length,1);g.act('dispatch');assert.equal(g.s.dispatched,false);
});
test('support requests require consent, reply and mutual confirmation; disruption preserves finished support',()=>{
 const g=setup().start('network');g.act('assign',{need:'food',person:'friend'});assert.equal(Object.keys(g.s.contracts).length,0);g.act('consent').act('assign',{need:'recovery',person:'dad'});assert.equal(Object.keys(g.s.contracts).length,0);
 g.act('assign',{need:'food',person:'friend'}).tick(5.1);assert.equal(g.s.contracts.food.status,'reply');g.tick(7);assert.equal(g.s.done.length,0);g.act('confirm','food').tick(13);assert.equal(g.s.disrupted,true);assert.equal(g.s.contracts.food,undefined);
 const pairs={food:'family',shopping:'dad',calls:'dad',company:'family',recovery:'clinic',feeding:'clinic',mood:'counsel'};for(const[need,person]of Object.entries(pairs))g.act('assign',{need,person});g.tick(5.1);for(const k of Object.keys(pairs))g.act('confirm',k);g.until(s=>s.complete);assert.equal(g.s.done.length,7);for(const c of Object.values(g.s.contracts))assert.equal(c.status,'done');
});
test('support capacity frees only as actual work completes, and cancellation does not erase other work',()=>{
 const g=setup().start('network');g.act('consent');g.act('assign',{need:'food',person:'family'}).act('assign',{need:'shopping',person:'family'}).act('assign',{need:'company',person:'family'});assert.equal(g.s.contracts.company,undefined);g.act('cancel','shopping');assert.ok(g.s.contracts.food);g.act('assign',{need:'company',person:'family'});assert.ok(g.s.contracts.company);
});
test('new saves are isolated, resume transient controls safely and reject corrupted geometry and time',()=>{
 const {G}=setup();for(const id of G.ids){let s=G.initial(id);assert.ok(G.valid(s,id));for(let i=0;i<20;i++)s=G.tick(s,.1);assert.deepEqual(JSON.parse(JSON.stringify(G.restore(s,id))),JSON.parse(JSON.stringify(s)));assert.equal(G.valid({...s,time:NaN},id),false);assert.equal(G.valid(s,'wrong'),false);assert.equal(G.restore({assigned:{}},id).time,0);}
 const x=G.initial('signal');assert.equal(G.valid({...x,crew:59},'signal'),false);const n=G.initial('network');assert.equal(G.valid({...n,contracts:{food:null}},'network'),false);const p=G.initial('soothe');assert.equal(G.valid({...p,phase:3,baby:'arms'},'soothe'),false);
});
test('new public entry points, old URL redirects and completion exits exist for all five games',()=>{
 const root=path.resolve(__dirname,'..'),env={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/series-data.js'),'utf8'),env);for(const id of ['shifts','soothe','visitors','signal','network'])assert.equal(env.window.DAD_CHAPTERS.find(c=>c.id===id).href,['shifts','visitors','signal'].includes(id)?id+'.html':'recovery.html?chapter='+id);
 const html=fs.readFileSync(path.join(root,'recovery.html'),'utf8');for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g))if(!m[1].startsWith('http'))assert.ok(fs.existsSync(path.join(root,m[1].split('?')[0])),m[1]);
 assert.match(fs.readFileSync(path.join(root,'assets/js/episodes.js'),'utf8'),/location.replace\('recovery.html\?chapter='\+id\)/);
});

test('helper returns to the bedside after an errand before protected rest can advance',()=>{
 const g=setup().start('shifts');assign(g,'dad','review');g.until(s=>s.done.includes('review')).until(s=>s.helperArrived).act('reconfirm');assign(g,'helper','cover');g.until(s=>s.done.includes('cover'));assign(g,'helper','delivery');g.until(s=>s.done.includes('delivery'));assign(g,'dad','rest');g.tick(.1);assert.equal(g.s.actors.dad.progress,0);g.until(s=>s.done.includes('rest'));assert.equal(g.s.actors.helper.x,g.G.shiftPlaces[3].x);assert.equal(g.s.actors.helper.y,g.G.shiftPlaces[3].y);
});
