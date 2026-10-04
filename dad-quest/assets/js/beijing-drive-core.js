/* Original, geographically inspired arcade course; not navigational road geometry. */
(() => {'use strict';
const points=[[380,2920],[380,2760],[260,2660],[100,2640],[100,2400],[120,2040],[130,1680],[120,1320],[100,990],[70,720],[-40,530],[-210,430],[-390,350],[-540,235],[-630,125],[-640,0]];
const segments=[];let length=0;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.hypot(b[0]-a[0],b[1]-a[1]);segments.push({a,b,start:length,length:n,angle:Math.atan2(b[1]-a[1],b[0]-a[0])});length+=n;}
function sample(d){d=Math.max(0,Math.min(length,d));const q=segments.find(s=>d<=s.start+s.length)||segments.at(-1),t=(d-q.start)/q.length;return {x:q.a[0]+(q.b[0]-q.a[0])*t,y:q.a[1]+(q.b[1]-q.a[1])*t,angle:q.angle};}
const marks=[{at:0,name:'北京欢乐谷',road:'欢乐谷出发区',limit:30},{at:280,name:'四方桥片区',road:'驶入东四环 · 游戏化匝道',limit:40},{at:640,name:'窑洼湖桥片区',road:'东四环南路',limit:60},{at:1080,name:'大郊亭桥片区',road:'东四环中路',limit:60},{at:1470,name:'四惠桥片区',road:'东四环中路',limit:60},{at:1900,name:'红领巾桥片区',road:'东四环北路',limit:60},{at:2330,name:'东风北桥片区',road:'东四环北路',limit:60},{at:2750,name:'四元桥片区',road:'出口准备 · 靠右减速',limit:40},{at:3060,name:'京顺路片区',road:'往三元桥方向 · 游戏化连接',limit:30},{at:length-170,name:'北京宜和医院',road:'京顺路 111 号 · 模拟落客区',limit:20}];
// Original gameplay sections, not surveyed Beijing lane counts or legal limits.
const roadTypes=[
 {lanes:2,surface:'园区铺装',color:'#777c70',safe:30,grip:1},
 {lanes:2,surface:'连接匝道',color:'#68716a',safe:30,grip:1},
 {lanes:3,surface:'平整沥青',color:'#596762',safe:60,grip:1},
 {lanes:3,surface:'接缝路面',color:'#777568',safe:30,grip:.95},
 {lanes:2,surface:'施工路段',color:'#777367',safe:30,grip:1},
 {lanes:3,surface:'雨后湿滑',color:'#526e75',safe:40,grip:.65},
 {lanes:2,surface:'行人通道',color:'#68736b',safe:30,grip:1},
 {lanes:1,surface:'弯曲出口',color:'#69706c',safe:30,grip:.9},
 {lanes:2,surface:'城市支路',color:'#757a70',safe:30,grip:1},
 {lanes:2,surface:'医院落客区',color:'#7c8375',safe:20,grip:1}
];
marks.forEach((m,i)=>Object.assign(m,roadTypes[i],{limit:roadTypes[i].safe}));
function roadAt(d){const i=Math.max(0,marks.findLastIndex(m=>d>=m.at)),m=marks[i],prev=marks[Math.max(0,i-1)],t=Math.min(1,Math.max(0,(d-m.at)/160));
 const bounds=n=>({left:n===1?0:-54,right:n===3?98:54});const a=bounds(prev.lanes),b=bounds(m.lanes);
 return {...m,left:a.left+(b.left-a.left)*t,right:a.right+(b.right-a.right)*t,centers:m.lanes===1?[22]:m.lanes===3?[-22,22,66]:[-22,22]};
}
function roadAhead(s){return marks.find(m=>m.at>s.d&&m.at-s.d<200)||null;}
const signals=[{at:160,period:18,red:7,offset:0},{at:length-230,period:20,red:8,offset:5}];
const traffic=[{start:720,lane:-22,speed:18,color:'#c49966'},{start:1240,lane:23,speed:13,color:'#869aa3'},{start:1860,lane:-22,speed:16,color:'#9dafa0'},{start:2410,lane:23,speed:14,color:'#b09aa8'}];
function offset(d,lane){const p=sample(d);return {...p,x:p.x-Math.sin(p.angle)*lane,y:p.y+Math.cos(p.angle)*lane};}
function wrap(a){return Math.atan2(Math.sin(a),Math.cos(a));}
function project(x,y){let best=null;for(const q of segments){const vx=q.b[0]-q.a[0],vy=q.b[1]-q.a[1],t=Math.max(0,Math.min(1,((x-q.a[0])*vx+(y-q.a[1])*vy)/(q.length*q.length))),px=q.a[0]+vx*t,py=q.a[1]+vy*t,dist=Math.hypot(x-px,y-py);if(!best||dist<best.distance)best={d:q.start+t*q.length,lane:-(x-px)*Math.sin(q.angle)+(y-py)*Math.cos(q.angle),distance:dist,angle:q.angle};}return best;}
function initial(){const p=offset(0,22);return {version:3,mode:'challenge',comfort:100,lateral:0,failed:null,eventStart:null,events:[],x:p.x,y:p.y,heading:p.angle,wheel:0,d:0,lane:22,speed:0,time:0,jerk:0,bumps:0,reds:0,over:0,parkTime:0,done:false,checkpoint:0,cooldown:0,passed:[],notice:'现在需要亲自转弯。低速起步，入弯前减速，松开方向键让前轮回正。'};}
function recover(s){const p=offset(s.d,22);return {...s,x:p.x,y:p.y,heading:p.angle,wheel:0,speed:0,lane:22,cooldown:2,notice:'已由你请求扶正。道路不会自动替你转弯。'};}
function zone(s){return roadAt(s.d);}
function red(light,time){return (time+light.offset)%light.period<light.red;}
// Persist traffic positions: stopping must not be undone by the global clock.
function cars(s){return traffic.map((c,i)=>({...c,id:i,...(s.vehicles?.[i]||{d:c.start+300,velocity:c.speed})}));}
function advanceTraffic(s,n,dt){
 const current=cars(s), crossing=2400, stop=crossing-36;
 const waiting=n.d>=2170&&n.eventStart===null;
 const walking=n.eventStart!==null&&n.time-n.eventStart<12;
 const moved=new Map();
 for(const c of [...current].sort((a,b)=>b.d-a.d)){
  let barrier=Infinity;
  const road=roadAt(c.d),next=roadAhead({d:c.d}),targetLane=(road.lanes===1||next?.lanes===1)?22:traffic[c.id].lane;
  c.lane+=Math.max(-16*dt,Math.min(16*dt,targetLane-c.lane));
  if((waiting||walking)&&c.d<=stop)barrier=stop;
  for(const other of moved.values())if(Math.abs(other.lane-c.lane)<40&&other.d>=c.d)barrier=Math.min(barrier,other.d-48);
  if(n.d>c.d&&Math.abs(n.lane-c.lane)<20)barrier=Math.min(barrier,n.d-48);
  for(const light of signals)if(red(light,n.time)&&c.d<=light.at-30)barrier=Math.min(barrier,light.at-30);
  const gap=Math.max(0,barrier-c.d),desired=Math.min(c.speed,road.limit/3.6*2.5,Math.sqrt(2*12*gap));
  let velocity=Math.max(0,Math.min(desired,c.velocity+6*dt));
  let d=c.d+velocity*dt;
  if(d>=barrier){d=Math.max(c.d,barrier);velocity=0;}
  if(d>length+80&&!current.some(o=>o.id!==c.id&&Math.abs(o.lane-c.lane)<20&&o.d<380)&&!(n.d<380&&Math.abs(n.lane-c.lane)<20)){d=300;velocity=0;}
  moved.set(c.id,{...c,d,velocity});
 }
 n.vehicles=current.map(c=>{const next=moved.get(c.id);return {d:next.d,velocity:next.velocity,lane:next.lane};});
}
const challenge={seconds:480,lateral:2.8};
const hazards=[{id:'bump',at:700,end:730,title:'前方减速带',hint:'提前松油门，以游戏速度 12 km/h 以下通过。'},{id:'cones',at:1500,end:1580,title:'右侧临时施工',hint:'提前减速并向左绕过锥桶，驶过后再回正。'},{id:'crossing',at:2400,end:2415,title:'临时行人通道',hint:'停在停止线前，等待行人通过后再起步。'}];
function activeEvent(s){return hazards.find(h=>s.d>=h.at-230&&s.d<h.end+25)||null;}
function practice(s){return {...s,mode:'practice',failed:null,done:false,speed:0};}
function step(s,input,dt){
 if(s.done||s.failed)return {...s};dt=Math.min(.05,Math.max(0,dt));const n={...s,events:[...s.events],passed:[...s.passed],time:s.time+dt,cooldown:Math.max(0,s.cooldown-dt)};
 const target=Math.max(-1,Math.min(1,input.steer||0))*.55;
 n.wheel+=Math.max(-2.4*dt,Math.min(2.4*dt,target-s.wheel));
 if(input.brake){n.speed=Math.sign(s.speed)*Math.max(0,Math.abs(s.speed)-25*zone(s).grip*dt);}else if(input.gas){const desired=input.reverse?-5:76/3.6;n.speed=s.speed+Math.max(-10*dt,Math.min(10*dt,desired-s.speed));}else n.speed=Math.sign(s.speed)*Math.max(0,Math.abs(s.speed)-3*dt);
 // Bicycle kinematics: velocity follows the car heading, not the road tangent.
 const velocity=n.speed*2.5,yaw=velocity/30*Math.tan(n.wheel),mid=s.heading+yaw*dt/2;
 n.heading=wrap(s.heading+yaw*dt);n.x=s.x+Math.cos(mid)*velocity*dt;n.y=s.y+Math.sin(mid)*velocity*dt;
 let p=project(n.x,n.y);
 const edge=roadAt(p.d);
 if(p.lane<edge.left+10||p.lane>edge.right-10){n.x=s.x;n.y=s.y;n.speed=0;p=project(n.x,n.y);if(!n.cooldown){n.bumps++;n.cooldown=2;n.notice='碰到路肩了。可以倒车调整方向，或使用扶正按钮。';}}
 n.d=p.d;n.lane=p.lane;
 for(const l of signals){if(s.d<l.at&&n.d>=l.at&&red(l,n.time)&&!n.passed.includes(l.at)){n.reds++;n.passed.push(l.at);n.notice='刚才越过红灯停止线，下个路口提前制动。';}}
 // Let cars already on the crossing clear it before pedestrians enter.
 if(n.eventStart===null&&n.d>=2170&&!cars(s).some(c=>c.d>2364&&c.d<2450))n.eventStart=n.time;
 advanceTraffic(s,n,dt);
 for(const c of cars(n)){const q=offset(c.d,c.lane);if(Math.hypot(n.x-q.x,n.y-q.y)<26&&!n.cooldown){n.x=s.x;n.y=s.y;n.speed=0;n.bumps++;n.cooldown=2;const back=project(n.x,n.y);n.d=back.d;n.lane=back.lane;n.notice='与前车接触。刹车，留出距离再调整方向。';}}
 if(Math.abs(n.speed)*3.6>zone(n).limit+3)n.over+=dt;
 n.lateral=Math.abs(n.speed*yaw);
 let cost=Math.max(0,n.lateral-challenge.lateral*zone(n).grip)*dt*2;
 if(zone(n).surface==='接缝路面'&&Math.abs(n.speed)*3.6>30)cost+=(Math.abs(n.speed)*3.6-30)*dt*.08;
 if(input.brake&&Math.abs(s.speed)>8)cost+=dt*1.6;
 if(Math.abs(n.speed)*3.6>zone(n).limit+3)cost+=dt*.5;
 cost+=(n.bumps-s.bumps)*18+(n.reds-s.reds)*12;
 const cones=hazards[1];
 if(n.d>cones.at-15&&n.d<cones.end+15&&n.lane>1){n.x=s.x;n.y=s.y;n.speed=0;const q=project(n.x,n.y);n.d=q.d;n.lane=q.lane;if(!n.cooldown){n.cooldown=2;cost+=14;n.notice='右侧锥桶挡路。停车，倒车留出转向空间，再从左侧绕行。';}}
 if(s.d<2400&&n.d>=2400&&n.eventStart!==null&&n.time-n.eventStart<12){n.x=s.x;n.y=s.y;n.speed=0;const q=project(n.x,n.y);n.d=q.d;n.lane=q.lane;if(!n.cooldown){n.cooldown=2;cost+=10;n.notice='行人尚未通过。车辆已被游戏拦停，请在线前等待。';}}
 for(const h of hazards){if(n.d>=(h.id==='bump'?h.at:h.end)&&!n.events.some(e=>e.id===h.id)){const rough=h.id==='bump'&&Math.abs(n.speed)*3.6>12;if(rough)cost+=18;n.events.push({id:h.id,smooth:!rough});n.notice=rough?'过减速带时速度过快，平稳预算减少 18。':'已处理：'+h.title;}}
 n.comfort=Math.max(0,s.comfort-cost);
 if(n.mode==='challenge'){if(n.comfort<=0)n.failed='comfort';else if(n.time>=challenge.seconds)n.failed='time';}
 n.checkpoint=Math.max(s.checkpoint,n.d);
 const parking=n.d>=length-60&&n.d<=length-8&&n.lane>13&&n.lane<40&&Math.abs(wrap(n.heading-sample(length).angle))<.3;
 if(!n.failed&&parking&&Math.abs(n.speed)<.3&&!input.gas){n.parkTime+=dt;if(n.parkTime>=2){n.done=true;n.notice='车身摆正，稳稳停好了。';}}else n.parkTime=0;
 return n;
}
window.BeijingDrive={roadAt,roadAhead,challenge,hazards,activeEvent,practice,points,segments,length,sample,offset,project,wrap,recover,marks,signals,traffic,initial,zone,red,cars,step};
})();
