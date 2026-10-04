/* Original, geographically inspired arcade course; not navigational road geometry. */
(() => {'use strict';
const points=[[380,2920],[380,2760],[260,2660],[100,2640],[100,2400],[120,2040],[130,1680],[120,1320],[100,990],[70,720],[-40,530],[-210,430],[-390,350],[-540,235],[-630,125],[-640,0]];
const segments=[];let length=0;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.hypot(b[0]-a[0],b[1]-a[1]);segments.push({a,b,start:length,length:n,angle:Math.atan2(b[1]-a[1],b[0]-a[0])});length+=n;}
function sample(d){d=Math.max(0,Math.min(length,d));const q=segments.find(s=>d<=s.start+s.length)||segments.at(-1),t=(d-q.start)/q.length;return {x:q.a[0]+(q.b[0]-q.a[0])*t,y:q.a[1]+(q.b[1]-q.a[1])*t,angle:q.angle};}
const marks=[{at:0,name:'北京欢乐谷',road:'欢乐谷出发区',limit:30},{at:280,name:'四方桥片区',road:'驶入东四环 · 游戏化匝道',limit:40},{at:640,name:'窑洼湖桥片区',road:'东四环南路',limit:60},{at:1080,name:'大郊亭桥片区',road:'东四环中路',limit:60},{at:1470,name:'四惠桥片区',road:'东四环中路',limit:60},{at:1900,name:'红领巾桥片区',road:'东四环北路',limit:60},{at:2330,name:'东风北桥片区',road:'东四环北路',limit:60},{at:2750,name:'四元桥片区',road:'出口准备 · 靠右减速',limit:40},{at:3060,name:'京顺路片区',road:'往三元桥方向 · 游戏化连接',limit:30},{at:length-170,name:'北京宜和医院',road:'京顺路 111 号 · 模拟落客区',limit:20}];
const signals=[{at:160,period:18,red:7,offset:0},{at:length-230,period:20,red:8,offset:5}];
const traffic=[{start:720,lane:-22,speed:18,color:'#c49966'},{start:1240,lane:23,speed:13,color:'#869aa3'},{start:1860,lane:-22,speed:16,color:'#9dafa0'},{start:2410,lane:23,speed:14,color:'#b09aa8'}];
function initial(){return {d:0,lane:22,speed:0,time:0,jerk:0,bumps:0,reds:0,over:0,parkTime:0,done:false,checkpoint:0,cooldown:0,passed:[],notice:'从欢乐谷出发。踩下油门，先在低速路段熟悉转向和刹车。'};}
function zone(s){return marks.filter(m=>s.d>=m.at).at(-1)||marks[0];}
function red(light,time){return (time+light.offset)%light.period<light.red;}
function cars(s){return traffic.map((c,i)=>({...c,id:i,d:(c.start+c.speed*s.time)%(length-550)+300}));}
function step(s,input,dt){
 if(s.done)return {...s};dt=Math.min(.05,Math.max(0,dt));const n={...s,passed:[...s.passed],time:s.time+dt,cooldown:Math.max(0,s.cooldown-dt)},oldSpeed=s.speed;
 const accel=input.brake?-30:input.gas?14:-4;n.speed=Math.max(0,Math.min(76/3.6,s.speed+accel*dt));
 // Arcade steering controls lateral motion; route curvature is represented by the course.
 n.lane+=Math.max(-1,Math.min(1,input.steer||0))*(13+n.speed*1.1)*dt;
 if(Math.abs(n.lane)>49){n.lane=Math.sign(n.lane)*49;n.speed=Math.min(n.speed,3);if(!n.cooldown){n.bumps++;n.cooldown=2;n.notice='擦到路肩了。减速，向道路中间调整；不必重来。';}}
 n.d=Math.min(length,n.d+n.speed*dt*2.5);
 for(const l of signals){if(s.d<l.at&&n.d>=l.at&&red(l,n.time)&&!n.passed.includes(l.at)){n.reds++;n.passed.push(l.at);n.notice='刚才越过了红灯停止线。后面的路口提前减速，等灯转绿。';}}
 for(const c of cars(n)){if(Math.abs(c.d-n.d)<22&&Math.abs(c.lane-n.lane)<19&&!n.cooldown){n.speed=0;n.bumps++;n.cooldown=2;n.notice='和前车距离过近。先制动，观察另一车道再超越。';}}
 if(oldSpeed>8&&input.brake)n.jerk+=dt;
 if(n.speed*3.6>zone(n).limit+3)n.over+=dt;
 if(n.d>2750&&n.d<2880&&n.lane<2)n.notice='四元桥出口就在前方：向右调整到出口侧车道。';
 if(s.d<2880&&n.d>=2880&&n.lane<2){n.d=2879;n.speed=0;n.notice='你还在直行侧车道。先向右调整，再驶入游戏中的出口。';}
 n.checkpoint=Math.max(s.checkpoint,...marks.filter(m=>m.at<=n.d).map(m=>m.at));
 if(n.d>=length-65&&n.lane>13&&n.lane<43&&n.speed<.7&&!input.gas){n.parkTime+=dt;if(n.parkTime>=2){n.done=true;n.notice='稳稳停好了。你们已抵达美中宜和·北京宜和医院。';}}else n.parkTime=0;
 if(n.d===length&&!n.done){n.speed=0;n.notice='已到落客区。向右调整进停车框，松开油门，停稳两秒。';}
 return n;
}
window.BeijingDrive={points,segments,length,sample,marks,signals,traffic,initial,zone,red,cars,step};
})();
