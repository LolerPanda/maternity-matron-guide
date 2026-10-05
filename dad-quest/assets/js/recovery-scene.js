/* Original canvas scenes; narrative and controls live outside the scene. */
(() => {'use strict';
const R=window.RecoveryGames,colors={ink:'#29463f',floor:'#dde5d5',paper:'#fcfaed',wood:'#bd9d74',dad:'#d58b5d',helper:'#819b91',rose:'#d8b7a5'};
function draw(canvas,s){const d=Math.min(devicePixelRatio||1,2),w=Math.max(1,canvas.clientWidth);if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(w*d*560/960)){canvas.width=Math.round(w*d);canvas.height=Math.round(w*d*560/960);}const c=canvas.getContext('2d');c.setTransform(canvas.width/960,0,0,canvas.height/560,0,0);c.clearRect(0,0,960,560);
 const box=(x,y,w,h,color,r=12,stroke)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}};
 const circle=(x,y,r,color)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();};
 const line=(x,y,u,v,color,width=3)=>{c.beginPath();c.moveTo(x,y);c.lineTo(u,v);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();};
 const text=(t,x,y,size=14,color=colors.ink,align='center')=>{c.font=`${size}px system-ui, sans-serif`;c.fillStyle=color;c.textAlign=align;c.fillText(t,x,y);};
 const progress=(x,y,w,p)=>{box(x,y,w,6,'#cdd8c6',3);if(p>0)box(x,y,w*Math.min(1,p),6,'#658e76',3);};
 const person=(x,y,kind='dad',name)=>{c.save();c.translate(x,y);c.fillStyle='#3e5e4420';c.beginPath();c.ellipse(0,15,22,8,0,0,7);c.fill();box(-15,-2,11,22,'#597368',4);box(4,-2,11,22,'#597368',4);box(-20,-37,40,42,kind==='dad'?colors.dad:kind==='mom'?colors.rose:colors.helper,12);line(-20,-28,-25,-4,'#e7be98',7);line(20,-28,25,-4,'#e7be98',7);circle(0,-53,19,'#e7be98');c.beginPath();c.arc(-2,-58,18,Math.PI,Math.PI*2);c.fillStyle='#61574a';c.fill();circle(6,-51,1.5,colors.ink);if(name)text(name,0,39,12);c.restore();};
 const baby=(x,y)=>{c.save();c.translate(x,y);c.rotate(-.22);box(-13,-7,26,38,'#f7efcc',10);circle(0,-11,10,'#e8c5a0');line(-5,-11,-2,-11,'#94785e',1);line(2,-11,5,-11,'#94785e',1);c.restore();};
 const title=(t,sub)=>{box(24,20,912,76,colors.paper,16);text(t,47,51,21,colors.ink,'left');text(sub,47,77,12,'#819078','left');};
 const floor=()=>{box(0,0,960,560,colors.floor,0);for(let x=0;x<960;x+=100)line(x,110,x,560,'#d4decf',1);box(20,115,920,422,'#e9e8d420',14);};
 floor();
 if(s.id==='shifts'){
  title('一班，不靠一个人硬撑','协作调度 · 拖队友到工作区 / 下方也能安排');
  const places=R.shiftPlaces,names=['交接桌','联络台','收件口','陪伴区','休息区'];
  places.forEach((p,i)=>{box(p.x-80,p.y-67,160,100,i===4?'#c4d3bc':i===3?'#e4c4b1':'#e1d8bd',14);if(i===4){box(p.x-58,p.y-43,116,40,'#8ca782',10);line(p.x-52,p.y-5,p.x+52,p.y-5,'#f5f3e3',8);}else if(i===3){person(p.x+50,p.y-12,'mom');baby(p.x+67,p.y-27);}else{box(p.x-40,p.y-51,80,45,'#b99c72',8);box(p.x-16,p.y-44,34,30,colors.paper,3);}text(names[i],p.x,p.y+57,13);});
  line(550,120,550,510,'#b7c8b0',3);box(605,355,310,130,'#d3dfcf',18);text('两个人的当前安排',760,382,14);
  Object.entries(s.actors).forEach(([who,a],i)=>{if(who==='helper'&&!s.helperArrived){person(885,310,'helper','还在路上');return;}person(a.x,a.y,who==='dad'?'dad':'helper',who==='dad'?'爸爸':'帮手');if(a.job){const j=R.shiftJobs.find(j=>j.id===a.job);progress(a.x-40,a.y+45,80,a.progress/j.duration);text(j.name,760,414+i*34,12);}else text((who==='dad'?'爸爸':'帮手')+' · '+(who==='helper'&&s.done.includes('cover')?'正在陪伴':'可以接手'),760,414+i*34,12);});
  if(s.helperArrived&&!s.recovered){box(655,136,255,58,'#f2d2a5',10);text('帮手到了，先重新交接',782,171,15);}
 }
 if(s.id==='soothe'){
  title('哭声还在，你也需要被接住','环境声源可以移走 · 安置宝宝后，再给自己片刻');
  c.save();c.beginPath();c.rect(0,110,610,450);c.clip();circle(320,285,225,'#f7f5e440');c.save();c.setLineDash([8,8]);c.beginPath();c.arc(320,285,225,0,7);c.strokeStyle='#aabfa5';c.stroke();c.restore();c.restore();
  box(258,221,124,128,colors.wood,15);box(270,234,100,100,colors.paper,9);for(let x=276;x<370;x+=18)line(x,227,x,241,'#9c835e',4);if(s.baby==='cot')baby(320,282);text('独立婴儿床',320,212,13);
  box(630,168,260,355,'#cbd9c4',18);text('把额外声源移到这里',760,198,13);text('哭声不是通关分数',760,507,12,'#708565');
  s.sources.forEach(src=>{const names={tv:'电视',phone:'消息提示',speaker:'音箱'};for(let i=0;i<3;i++){c.beginPath();c.arc(src.x,src.y,30+i*18+(s.time*9)%18,0,7);c.strokeStyle='#b99d7440';c.lineWidth=2;c.stroke();}box(src.x-29,src.y-25,58,46,'#768f84',8);box(src.x-20,src.y-18,40,30,'#dfebd1',4);text(names[src.id],src.x,src.y+43,12);});
  person(s.player.x,s.player.y,'dad','爸爸');if(s.baby==='arms')baby(s.player.x+22,s.player.y-21);if(s.phase>=4&&s.wait>=14)person(838,465,'helper','接班家人');
  if(s.phase===3){box(74,455,180,58,'#fbf6df',12);text('留给自己的片刻',164,478,13);progress(91,493,146,s.steady/8);}
  c.fillStyle=`rgba(60,58,32,${s.light/100*.08})`;c.fillRect(0,110,610,450);
 }
 if(s.id==='visitors'){
  title('门口的好意，屋里的休息','先对讲确认 · 控制门与隐私屏 · 多位来访会同时出现');
  box(45,128,600,385,'#eee5d3',16);box(72,163,280,156,'#d2bd9c',16);box(87,178,250,123,'#efe8d0',10);person(180,285,'mom');text('卧室 · 她今天想休息',213,343,14);box(80,383,260,91,'#9eb28f',18);text('已约协助活动区',208,505,13);
  box(365,148,22,345,'#b1c4ac',4);box(365,148,22,345*s.screen/100,'#748f82',4);text('隐私屏 '+Math.round(s.screen)+'%',380,524,12);
  box(643,150,38,345,'#b69b78',4);line(660,320,660+(s.door/100)*100,320-(s.door/100)*110,'#f5f0d9',15);text('家门 '+Math.round(s.door)+'%',650,132,13);
  c.save();c.setLineDash([7,7]);box(750,390,150,110,'#dce6d1',10,'#97b18f');c.restore();text('门外交付区',825,520,12);box(673,409,64,46,'#aa8c66',8);box(682,416,44,28,'#eee0ba',5);text('托盘 ↔',705,478,12);
  R.visitors.forEach((p,i)=>{if(p.arrival>s.time||s.handled.includes(p.id))return;const pos=s.guestPositions[p.id];if(pos!==undefined){const t=pos;person(850-(850-460)*t,170+i*53+(440-(170+i*53))*t,'helper',p.name);}else{const y=169+i*58;box(738,y-37,183,56,s.active===p.id?'#f3d3ac':'#edf0de',9);c.save();c.translate(761,y+4);c.scale(.55,.55);person(0,0,'helper');c.restore();text(p.name,854,y-9,11);}});
  if(s.holding&&s.active)progress(700,548,205,s.talk/3);
 }
 if(s.id==='signal'){
  title('电话保持着，现场也有人协调','虚构通讯与引导地图 · 不模拟医疗处置');
  const cell=57,left=35,top=145;for(let y=0;y<6;y++)for(let x=0;x<10;x++){const k=y*10+x;box(left+x*cell,top+y*cell,cell-4,cell-4,R.grid.blocked.includes(k)?'#8d9e91':s.route.includes(k)?'#d6b78c':'#edf0de',5);if(k===R.grid.start)text('入口',left+x*cell+26,top+y*cell+31,12);if(k===R.grid.end)text('家门',left+x*cell+26,top+y*cell+31,12);}
  const point=k=>({x:left+(k%10)*cell+26,y:top+Math.floor(k/10)*cell+29});for(let i=1;i<s.route.length;i++){const a=point(s.route[i-1]),b=point(s.route[i]);line(a.x,a.y,b.x,b.y,'#9d7959',3);}
  if(s.obstacle){const p=point(34);box(p.x-22,p.y-17,44,32,'#bba98b',5);text('推车 ↔',p.x,p.y+33,10);}box(702,466,210,64,'#dbe5cd',12);text('推车停放区',807,503,13);
  if(s.dispatched){const a=point(s.route[Math.floor(s.crew)]),b=point(s.route[Math.min(s.route.length-1,Math.floor(s.crew)+1)]),f=s.crew%1;person(a.x+(b.x-a.x)*f,a.y+(b.y-a.y)*f,'helper','支援人员');}
  box(665,131,270,306,'#2e4b43',20);text(s.called?'● 联络已启动':'先启动模拟求助',800,167,17,'#f3eddb');text(s.sent.length+' / 4 条已知事实',800,202,14,'#c9d5c0');for(let i=0;i<15;i++){const h=s.speaking?10+Math.sin(s.time*7+i)*13:3;line(689+i*16,258-h,689+i*16,258+h,'#c6d3ae',4);}text(s.teamHere?'已到家门':s.dispatched?'正在走向家门':'等待引导路线',800,326,14,'#ecd7b2');text(s.backup?'宝宝照护已交接':'宝宝照护待协调',800,364,12,'#d6dec8');text(s.records?'个人资料已备好':'个人资料待整理',800,394,12,'#d6dec8');
 }
 if(s.id==='network'){
  title('让支持真正抵达，而不只是说“有事找我”','拖动支持者到需求 · 等回复、确认范围 · 途中会有变化');
  R.requests.forEach(r=>{const contract=s.contracts[r.id];if(contract){const p=R.supporters.find(p=>p.id===contract.person);c.save();c.setLineDash(contract.status==='asking'||contract.status==='reply'?[8,9]:[]);c.beginPath();c.moveTo(p.x+40,p.y);c.bezierCurveTo(180,p.y,r.x-100,r.y,r.x,r.y);c.strokeStyle=contract.status==='done'?'#7b9d74':'#b09a72';c.lineWidth=3;c.stroke();c.restore();if(contract.status==='working'){const f=Math.min(1,contract.progress/r.duration);circle(p.x+(r.x-p.x)*f,p.y+(r.y-p.y)*f,9,'#d79b64');}}
   box(r.x-88,r.y-55,176,111,s.done.includes(r.id)?'#c9ddbd':'#f9f4df',14,s.selected===r.id?'#c68c56':undefined);text(r.name,r.x,r.y-18,14);text(contract?({asking:'请求发出',reply:'回复待确认',working:'支持落实中',done:'已落实'})[contract.status]:'等待一位支持者',r.x,r.y+6,11,'#7b8b73');if(contract){text(R.supporters.find(p=>p.id===contract.person).name,r.x,r.y+26,11);progress(r.x-65,r.y+40,130,contract.status==='done'?1:contract.status==='working'?contract.progress/r.duration:0);}});
  R.supporters.forEach(p=>{box(p.x-48,p.y-31,117,65,p.id==='friend'&&s.disrupted?'#d6d5c9':'#c4d4bd',11);text(p.name,p.x+10,p.y-4,p.id==='clinic'?11:13);const used=Object.values(s.contracts).filter(c=>c.person===p.id&&c.status!=='done').length;text(p.id==='friend'&&s.disrupted?'今日无法协助':used+' / '+p.cap+' 正在接手',p.x+10,p.y+19,10);});
 }
 if(s.dragPreview){box(s.dragPreview.x-28,s.dragPreview.y-20,56,40,'#f2d8a9cc',8);text('移动中',s.dragPreview.x,s.dragPreview.y+5,11);}
}
function hit(s,p){if(s.id==='shifts'){for(const[who,a]of Object.entries(s.actors))if(Math.hypot(p.x-a.x,p.y-a.y)<45)return{kind:'actor',id:who};const station=R.shiftPlaces.findIndex(x=>Math.hypot(p.x-x.x,p.y-x.y)<85);if(station>=0)return{kind:'station',id:station};}
 if(s.id==='soothe'){const src=s.sources.find(x=>Math.hypot(p.x-x.x,p.y-x.y)<48);if(src&&s.phase===1)return{kind:'source',id:src.id};return{kind:'floor'};}
 if(s.id==='visitors'){const person=R.visitors.find((v,i)=>s.time>=v.arrival&&!s.handled.includes(v.id)&&!s.inside.includes(v.id)&&p.x>730&&Math.abs(p.y-(169+i*58))<29);if(person)return{kind:'visitor',id:person.id};if(p.x>663&&p.x<742&&p.y>398&&p.y<463)return{kind:'tray'};}
 if(s.id==='signal'){const x=Math.floor((p.x-35)/57),y=Math.floor((p.y-145)/57);if(x>=0&&x<10&&y>=0&&y<6){if(y*10+x===34&&s.obstacle)return{kind:'obstacle'};return{kind:'grid',id:y*10+x};}}
 if(s.id==='network'){const person=R.supporters.find(x=>Math.abs(p.x-x.x)<70&&Math.abs(p.y-x.y)<35);if(person)return{kind:'supporter',id:person.id};const need=R.requests.find(x=>Math.abs(p.x-x.x)<88&&Math.abs(p.y-x.y)<55);if(need)return{kind:'need',id:need.id};}
 return null;}
window.RecoveryScene={draw,hit};
})();
