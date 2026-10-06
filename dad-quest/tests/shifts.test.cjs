const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function game(){const env={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/js/shifts-core.js'),'utf8'),env);const G=env.window.DadShift;let s=G.initial();return{G,get s(){return s;},act(t,v){s=G.act(s,t,v);assert.ok(G.valid(s),JSON.stringify(s));return this;},tick(sec,keys){for(let i=0;i<sec*10;i++){s=G.tick(s,.1,keys);assert.ok(G.valid(s),JSON.stringify(s));}return this;},go(id){const p=id==='helper'?s.helper:G.stations.find(p=>p.id===id),way=G.path(s,p.x,p.y);assert.ok(way.length,'route to '+id);for(const w of way){let i=0;while(Math.hypot(w.x-s.player.x,w.y-s.player.y)>6&&i++<100){const dx=w.x-s.player.x,dy=w.y-s.player.y;const len=Math.hypot(dx,dy);s=G.tick(s,.025,{x:dx/len,y:dy/len});assert.ok(G.valid(s));}assert.ok(i<100,'movement blocked toward '+JSON.stringify(w));}assert.equal(G.nearest(s).id,id,'wrong nearby at '+JSON.stringify(s.player));assert.ok(G.nearest(s).d<=68);return this;}};}
const e=g=>g.act('interact');
test('complete room chapter using real directional movement, carrying, in-person handoff, interrupted rest and return records',()=>{
 const g=game();g.go('desk');e(g);e(g);e(g);e(g);assert.equal(g.s.review,true);g.go('phone');e(g);g.act('slot',-1);e(g);assert.equal(g.s.followup,false);g.act('slot',1);e(g);assert.equal(g.s.followup,true);e(g);assert.equal(g.s.muted,true);
 g.go('door');e(g);assert.equal(g.s.carried,'supplies');g.go('shelf');e(g);g.tick(1.6);assert.equal(g.s.delivery,true);g.go('door');e(g);assert.equal(g.s.sign,true);g.go('tv');e(g);g.go('lamp');e(g);g.tick(40);g.go('helper');e(g);e(g);e(g);e(g);assert.equal(g.s.covered,false);g.tick(4);assert.equal(g.s.covered,true);g.go('bed');e(g);g.tick(7);assert.equal(g.s.interrupt,true);assert.ok(g.s.rest<6);e(g);g.tick(10);assert.equal(g.s.rest,14);assert.equal(g.s.complete,false);g.go('desk');e(g);e(g);e(g);assert.equal(g.s.complete,true);
});
test('walking is manual and stops at furniture; diagonals have the same speed and carrying slows travel',()=>{
 const g=game(),start={...g.s.player};g.tick(2);assert.equal(g.s.player.x,start.x);g.tick(.5,{x:1,y:0});assert.ok(g.s.player.x>start.x);const a=game(),b=game();a.tick(.4,{x:1,y:0});b.tick(.4,{x:1,y:1});assert.ok(Math.abs(Math.hypot(a.s.player.x-430,a.s.player.y-355)-Math.hypot(b.s.player.x-430,b.s.player.y-355))<1);g.tick(1,{x:0,y:-1});g.tick(10,{x:1,y:0});assert.ok(g.s.player.x<=922);assert.ok(g.G.walkable(g.s.player.x,g.s.player.y));
 const c=game();c.go('door');e(c);const x=c.s.player.x;c.tick(.5,{x:-1,y:0});assert.ok(Math.abs(c.s.player.x-x)<60);
 const wall=game();wall.tick(2,{x:0,y:-1});assert.ok(wall.s.player.y>=227,'desk blocks body');
});
test('remote interaction cannot complete work and rest requires real coverage and all preparations',()=>{
 const g=game();e(g);assert.equal(g.s.review,false);g.go('bed');e(g);assert.equal(g.s.resting,false);g.tick(60);assert.equal(g.s.covered,false);assert.equal(g.s.briefing,0);assert.equal(g.s.rest,0);g.go('shelf');e(g);assert.equal(g.s.delivery,false);
});
test('mouse routes avoid walls and furniture, keyboard input cancels autopilot and unfinished actions',()=>{
 const g=game();for(const p of g.G.stations){const route=g.G.path(g.s,p.x,p.y);assert.ok(route.length);for(const q of route)assert.ok(g.G.walkable(q.x,q.y));}g.act('target',{x:875,y:320});assert.ok(g.s.path.length);g.tick(.1,{x:-1,y:0});assert.equal(g.s.path.length,0);g.go('door');e(g);g.go('shelf');e(g);assert.ok(g.s.action);g.tick(.1,{x:-1,y:0});assert.equal(g.s.action,null);assert.equal(g.s.delivery,false);assert.equal(g.s.carried,'supplies');
});
test('resume clears transient movement and active actions but keeps completed work; corrupt saves recover',()=>{
 const g=game();g.go('desk');e(g);e(g);e(g);e(g);g.act('target',{x:875,y:320});const saved=g.G.restore(g.s);assert.equal(saved.path.length,0);assert.equal(saved.resting,false);assert.equal(saved.review,true);assert.equal(g.G.restore({version:1}).time,0);assert.equal(g.G.valid({...g.s,player:{...g.s.player,x:360,y:170}}),false);
});
test('new room entry is default and old shift URLs redirect while other chapters retain their entry',()=>{
 const root=path.resolve(__dirname,'..'),env={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/series-data.js'),'utf8'),env);assert.equal(env.window.DAD_CHAPTERS.find(c=>c.id==='shifts').href,'shifts.html');assert.match(fs.readFileSync(path.join(root,'assets/js/recovery.js'),'utf8'),/location.replace\('shifts.html'\)/);for(const m of fs.readFileSync(path.join(root,'shifts.html'),'utf8').matchAll(/(?:src|href)="([^"#]+)"/g))assert.ok(fs.existsSync(path.join(root,m[1].split('?')[0])),m[1]);
});

test('dad cannot walk through an arrived teammate, and each click route leaves room around her',()=>{
 const g=game();g.tick(40).go('helper');assert.ok(Math.hypot(g.s.player.x-g.s.helper.x,g.s.player.y-g.s.helper.y)>=36);g.tick(2,{x:0,y:1});assert.ok(Math.hypot(g.s.player.x-g.s.helper.x,g.s.player.y-g.s.helper.y)>=35.99);const route=g.G.path(g.s,g.s.helper.x,g.s.helper.y);for(const p of route)assert.ok(Math.hypot(p.x-g.s.helper.x,p.y-g.s.helper.y)>=38);
});
