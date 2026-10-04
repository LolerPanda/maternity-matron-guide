/* Original, geographically inspired arcade course; not navigational road geometry. */
(() => {'use strict';
const points=[[380,2920],[380,2760],[260,2660],[100,2640],[100,2400],[120,2040],[130,1680],[120,1320],[100,990],[70,720],[-40,530],[-210,430],[-390,350],[-540,235],[-630,125],[-640,0]];
const segments=[];let length=0;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.hypot(b[0]-a[0],b[1]-a[1]);segments.push({a,b,start:length,length:n,angle:Math.atan2(b[1]-a[1],b[0]-a[0])});length+=n;}
function sample(d){d=Math.max(0,Math.min(length,d));const q=segments.find(s=>d<=s.start+s.length)||segments.at(-1),t=(d-q.start)/q.length;return {x:q.a[0]+(q.b[0]-q.a[0])*t,y:q.a[1]+(q.b[1]-q.a[1])*t,angle:q.angle};}
const marks=[{at:0,name:'北京欢乐谷',road:'欢乐谷出发区',limit:30},{at:280,name:'四方桥片区',road:'驶入东四环 · 游戏化匝道',limit:40},{at:640,name:'窑洼湖桥片区',road:'东四环南路',limit:60},{at:1080,name:'大郊亭桥片区',road:'东四环中路',limit:60},{at:1470,name:'四惠桥片区',road:'东四环中路',limit:60},{at:1900,name:'红领巾桥片区',road:'东四环北路',limit:60},{at:2330,name:'东风北桥片区',road:'东四环北路',limit:60},{at:2750,name:'四元桥片区',road:'出口准备 · 靠右减速',limit:40},{at:3060,name:'京顺路片区',road:'往三元桥方向 · 游戏化连接',limit:30},{at:length-170,name:'北京宜和医院',road:'京顺路 111 号 · 模拟落客区',limit:20}];
const signals=[{at:160,period:18,red:7,offset:0},{at:length-230,period:20,red:8,offset:5}];
const traffic=[{start:720,lane:-22,speed:18,color:'#c49966'},{start:1240,lane:23,speed:13,color:'#869aa3'},{start:1860,lane:-22,speed:16,color:'#9dafa0'},{start:2410,lane:23,speed:14,color:'#b09aa8'}];
function offset(d,lane){const p=sample(d);return {...p,x:p.x-Math.sin(p.angle)*lane,y:p.y+Math.cos(p.angle)*lane};}
function wrap(a){return Math.atan2(Math.sin(a),Math.cos(a));}
function project(x,y){let best=null;for(const q of segments){const vx=q.b[0]-q.a[0],vy=q.b[1]-q.a[1],t=Math.max(0,Math.min(1,((x-q.a[0])*vx+(y-q.a[1])*vy)/(q.length*q.length))),px=q.a[0]+vx*t,py=q.a[1]+vy*t,dist=Math.hypot(x-px,y-py);if(!best||dist<best.distance)best={d:q.start+t*q.length,lane:-(x-px)*Math.sin(q.angle)+(y-py)*Math.cos(q.angle),distance:dist,angle:q.angle};}return best;}
function initial(){const p=offset(0,22);return {version:2,x:p.x,y:p.y,heading:p.angle,wheel:0,d:0,lane:22,speed:0,time:0,jerk:0,bumps:0,reds:0,over:0,parkTime:0,done:false,checkpoint:0,cooldown:0,passed:[],notice:'现在需要亲自转弯。低速起步，入弯前减速，松开方向键让前轮回正。'};}
function recover(s){const p=offset(s.d,22);return {...s,x:p.x,y:p.y,heading:p.angle,wheel:0,speed:0,lane:22,cooldown:2,notice:'已由你请求扶正。道路不会自动替你转弯。'};}
function zone(s){return marks.filter(m=>s.d>=m.at).at(-1)||marks[0];}
function red(light,time){return (time+light.offset)%light.period<light.red;}
function cars(s){return traffic.map((c,i)=>({...c,id:i,d:(c.start+c.speed*s.time)%(length-550)+300}));}
function step(s,input,dt){
 if(s.done)return {...s};dt=Math.min(.05,Math.max(0,dt));const n={...s,passed:[...s.passed],time:s.time+dt,cooldown:Math.max(0,s.cooldown-dt)};
 const target=Math.max(-1,Math.min(1,input.steer||0))*.55;
 n.wheel+=Math.max(-2.4*dt,Math.min(2.4*dt,target-s.wheel));
 if(input.brake){n.speed=Math.sign(s.speed)*Math.max(0,Math.abs(s.speed)-25*dt);}else if(input.gas){const desired=input.reverse?-5:76/3.6;n.speed=s.speed+Math.max(-10*dt,Math.min(10*dt,desired-s.speed));}else n.speed=Math.sign(s.speed)*Math.max(0,Math.abs(s.speed)-3*dt);
 // Bicycle kinematics: velocity follows the car heading, not the road tangent.
 const velocity=n.speed*2.5,yaw=velocity/30*Math.tan(n.wheel),mid=s.heading+yaw*dt/2;
 n.heading=wrap(s.heading+yaw*dt);n.x=s.x+Math.cos(mid)*velocity*dt;n.y=s.y+Math.sin(mid)*velocity*dt;
 let p=project(n.x,n.y);
 if(p.distance>43){n.x=s.x;n.y=s.y;n.speed=0;p=project(n.x,n.y);if(!n.cooldown){n.bumps++;n.cooldown=2;n.notice='碰到路肩了。可以倒车调整方向，或使用扶正按钮。';}}
 n.d=p.d;n.lane=p.lane;
 for(const l of signals){if(s.d<l.at&&n.d>=l.at&&red(l,n.time)&&!n.passed.includes(l.at)){n.reds++;n.passed.push(l.at);n.notice='刚才越过红灯停止线，下个路口提前制动。';}}
 for(const c of cars(n)){const q=offset(c.d,c.lane);if(Math.hypot(n.x-q.x,n.y-q.y)<26&&!n.cooldown){n.x=s.x;n.y=s.y;n.speed=0;n.bumps++;n.cooldown=2;const back=project(n.x,n.y);n.d=back.d;n.lane=back.lane;n.notice='与前车接触。刹车，留出距离再调整方向。';}}
 if(Math.abs(n.speed)*3.6>zone(n).limit+3)n.over+=dt;
 n.checkpoint=Math.max(s.checkpoint,n.d);
 const parking=n.d>=length-60&&n.d<=length-8&&n.lane>13&&n.lane<40&&Math.abs(wrap(n.heading-sample(length).angle))<.3;
 if(parking&&Math.abs(n.speed)<.3&&!input.gas){n.parkTime+=dt;if(n.parkTime>=2){n.done=true;n.notice='车身摆正，稳稳停好了。';}}else n.parkTime=0;
 return n;
}
window.BeijingDrive={points,segments,length,sample,offset,project,wrap,recover,marks,signals,traffic,initial,zone,red,cars,step};
})();
