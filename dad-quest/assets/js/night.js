/* Dad on night duty: a dependency-free, real-time household simulation. */
(() => {
'use strict';
const $=s=>document.querySelector(s),canvas=$('#world'),ctx=canvas.getContext('2d');
const W=1000,H=620,GRID=20;
const walls=[{x:488,y:18,w:24,h:107},{x:488,y:205,w:24,h:230},{x:488,y:515,w:24,h:87},{x:18,y:298,w:182,h:20},{x:285,y:298,w:420,h:20},{x:790,y:298,w:192,h:20}];
const stations=[
 {id:'mother',name:'妈妈',x:137,y:106,ax:150,ay:194,color:'#ecd0aa'},
 {id:'crib',name:'婴儿床',x:357,y:100,ax:357,ay:179,color:'#dfb88c'},
 {id:'mat',name:'换护垫',x:362,y:240,ax:357,ay:263,color:'#abc8b3'},
 {id:'sofa',name:'休息沙发',x:664,y:103,ax:670,ay:184,color:'#9daf87'},
 {id:'phone',name:'电话',x:861,y:97,ax:850,ay:155,color:'#b7bca0'},
 {id:'door',name:'家门',x:960,y:226,ax:894,ay:229,color:'#b88c68'},
 {id:'sink',name:'饮水台',x:103,y:394,ax:104,ay:467,color:'#c0cbd1'},
 {id:'stove',name:'餐食台',x:257,y:394,ax:260,ay:467,color:'#dfc79c'},
 {id:'washer',name:'洗衣机',x:666,y:401,ax:660,ay:470,color:'#e4e4cc'},
 {id:'basket',name:'收纳篮',x:874,y:403,ax:870,ay:470,color:'#d1ac7d'},
 {id:'clothes',name:'待洗衣物',x:871,y:545,ax:810,ay:543,color:'#d2bbb5'}
];
const tasks=[
 {id:'sleep',title:'给宝宝一张安全的小床',tip:'把小熊和枕头分别搬到收纳篮，再检查空床。',lesson:'婴儿仰卧睡在同室独立、坚实平坦的睡眠空间，移走软物。'},
 {id:'water',title:'递上一杯水',tip:'到厨房饮水台接水，亲手送到妈妈身边。',lesson:'照护不是等指令。发现具体需求，然后把整件事接过来。'},
 {id:'diaper',title:'接手一次换护',tip:'接过宝宝，走到换护垫，完成照护再抱起。',lesson:'游戏省略实际护理细节。现实中请向医护学习换护与抱持方法。'},
 {id:'settle',title:'安顿宝宝入睡',tip:'换护后抱到准备好的婴儿床，轻声安抚。',lesson:'困倦时先把宝宝放回安全的婴儿床，不抱着在沙发上睡着。'},
 {id:'meal',title:'把热饭送到她身边',tip:'厨房餐食台准备餐食，再端给妈妈。',lesson:'吃饭、补水、安静休息，都需要有人认真安排。'},
 {id:'laundry',title:'让衣物也进入下一班',tip:'拿起衣物，放入洗衣机，启动后等洗完。',lesson:'家务包括发现、执行和收尾，不只是等待分配。'},
 {id:'boundary',title:'为家里的安静守门',tip:'亲友来访时，到门边沟通，把探望安排在休息之后。',lesson:'在尊重家人意愿的前提下，主动协调探望和消息。'},
 {id:'rest',title:'交接之后，给自己充电',tip:'打电话请帮手接班，门边完成交接，再到沙发休息。',lesson:'自己也需要休息。具体求助和清楚交接，让照护可以持续。'}
];
let state,player,path=[],keys=new Set(),running=false,paused=true,ended=false,action=null,last=0;
const music=window.NightMusic?new window.NightMusic():null;
if(music)music.onUnavailable=()=>{$('#music').textContent='配乐不可用';$('#music').setAttribute('aria-pressed','false');};
let speechUntil=0,toastUntil=0,sound=false,audio=null,hover=null,target=null,frame=0;
const itemNames={bear:'🧸 小熊',pillow:'▱ 枕头',water:'🥛 温水',meal:'🍲 餐食',clothes:'🧺 待洗衣物'};
function reset(){
 state={elapsed:0,energy:100,calm:75,held:null,baby:'mother',hazards:['bear','pillow'],done:{},change:0,visitor:false,visitorAt:0,phone:false,phoneHandled:false,helper:false,helperETA:null,helperArrived:false,washer:null,walked:0,breaks:0,interrupts:0};
 player={x:611,y:235,face:1,step:0};path=[];keys.clear();action=null;target=null;ended=false;running=true;last=performance.now();renderHUD();
}
function speak(text,duration=7){$('#speech').textContent=text;$('#speech').classList.add('show');speechUntil=performance.now()+duration*1000;}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');toastUntil=performance.now()+3300;}
function beep(type='good'){
 if(!sound)return;
 try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.type='sine';o.frequency.setValueAtTime(type==='good'?660:440,audio.currentTime);o.frequency.exponentialRampToValueAtTime(type==='good'?880:330,audio.currentTime+.15);g.gain.setValueAtTime(.055,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.25);o.start();o.stop(audio.currentTime+.26);}catch{}
}
function finishTask(id){if(state.done[id])return;state.done[id]=true;state.calm=Math.min(100,state.calm+8);beep();toast('✓ '+tasks.find(t=>t.id===id).title);renderHUD();if(Object.keys(state.done).length===tasks.length)setTimeout(()=>{if(!ended)endNight(true)},1000);}
function show(html){keys.clear();path=[];paused=true;music?.setPlaying(false);$('#pause').textContent='继续';$('#overlay-content').innerHTML=html;$('#overlay').showModal();}
function close(){ $('#overlay').close();if(!ended){paused=false;music?.setPlaying(running);last=performance.now();$('#pause').textContent='暂停';canvas.focus();} }
function intro(){show(`<div class="eyebrow">DAD ON NIGHT DUTY · 第一章</div><h1>宝宝回家了。<br>今晚，你来接一班。</h1><p>晚上九点，妈妈刚坐下来，宝宝还在她怀里。床边有没收好的物品，厨房还没收拾，亲友的消息也一个接一个。</p><p>走进房间，拿起东西，完成交接。没有选择题，只有你接下来要做的事。</p><div class="features"><div><b>⌨</b>方向键 / WASD 移动</div><div><b>✋</b>E / 空格互动</div><div><b>↗</b>点击物品自动走近</div></div><p>手机可点地面移动，也可用屏幕方向键。每晚约 6 分钟；可暂停、提前结束、重新挑战。节奏与状态都是虚构的，不模拟真实医疗风险。开始后播放轻柔夜曲，可在顶部关闭配乐或调整音量。</p><button class="primary" id="begin">好，今晚我来。 →</button>`);$('#begin').onclick=()=>{reset();close();speak('妈妈：「先帮宝宝把小床整理好吧。东西放在哪里，你来安排。」',9);};}
function blocked(x,y){return x<30||x>970||y<30||y>590||walls.some(r=>x>r.x-13&&x<r.x+r.w+13&&y>r.y-13&&y<r.y+r.h+13);}
function cell(x,y){return [Math.max(1,Math.min(48,Math.floor(x/GRID))),Math.max(1,Math.min(29,Math.floor(y/GRID)))];}
function findPath(x,y){
 let [sx,sy]=cell(player.x,player.y),[gx,gy]=cell(x,y);if(blocked(gx*20+10,gy*20+10))return [];
 const queue=[[sx,sy]],prev=new Map([[sx+','+sy,null]]);let at=0;
 while(at<queue.length){const [cx,cy]=queue[at++];if(cx===gx&&cy===gy)break;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy,k=nx+','+ny;if(prev.has(k)||blocked(nx*20+10,ny*20+10))continue;prev.set(k,[cx,cy]);queue.push([nx,ny]);}}
 if(!prev.has(gx+','+gy))return [];const out=[];let cur=[gx,gy];while(cur&&!(cur[0]===sx&&cur[1]===sy)){out.unshift({x:cur[0]*20+10,y:cur[1]*20+10});cur=prev.get(cur.join(','));}return out;
}
function walkTo(x,y,id=null){if(paused||ended)return;cancelAction();path=findPath(x,y);target=id;if(!path.length&&Math.hypot(player.x-x,player.y-y)>45)toast('从门口绕过去吧。点击房间内的物品可以自动找路。');}
function nearest(){return stations.map(s=>({s,d:Math.hypot(player.x-s.ax,player.y-s.ay)})).filter(v=>v.d<66).sort((a,b)=>a.d-b.d)[0]?.s;}
function cancelAction(){if(action){action=null;$('#action-progress').style.width='0';}}
function operation(s){
 if(!s)return null;
 const a=(label,duration,fn)=>({label,duration,fn});
 const no=label=>({label,blocked:true});
 if(s.id==='basket'){
  if(['bear','pillow'].includes(state.held))return a('把'+(state.held==='bear'?'小熊':'枕头')+'放入收纳篮',1,()=>{state.held=null;state.calm+=2;speak('收纳好啦。睡眠空间里不需要柔软的装饰。',4)});
  return no(state.held?'这件物品不放在这里':'小熊和枕头，都有自己的位置');
 }
 if(s.id==='crib'){
  if(state.baby==='carried'){
   if(!state.done.sleep)return no('先清空并检查婴儿床');
   if(!state.done.diaper)return no('宝宝需要先到换护垫');
   return a('把宝宝仰卧放下，轻声安抚',4,()=>{state.baby='crib';finishTask('settle');speak('宝宝慢慢安静下来。现在，换你照顾一下家里的其他事。',6)});
  }
  if(state.held)return no('先把手里的物品送到合适的位置');
  if(state.hazards.length)return a('拿走'+(state.hazards[0]==='bear'?'小熊':'枕头'),1,()=>{state.held=state.hazards.shift();speak('拿到杂物间的收纳篮，再回来继续整理。',4)});
  if(!state.done.sleep)return a('检查床面：坚实、平坦、无软物',2,()=>{finishTask('sleep');speak('小床准备好了。妈妈：「能给我倒杯水吗？」',6)});
  return no(state.baby==='crib'?'宝宝正在安全的小床里休息':'小床已经准备好了');
 }
 if(s.id==='mother'){
  if(state.baby==='carried')return a('和妈妈说明情况，暂时交回宝宝',2,()=>{state.baby='mother';speak('先安排好手里的事，准备好再来接班。',5)});
  if(state.held==='water')return a('把水递给妈妈，听听她的需要',2,()=>{state.held=null;finishTask('water');speak('妈妈：「谢谢。宝宝有点不舒服，你能接手换护吗？」',6)});
  if(state.held==='meal')return a('放好餐食，让她安心吃饭',2,()=>{state.held=null;finishTask('meal');speak('妈妈：「你把这些事接过去，我终于能好好吃一顿了。」',6)});
  if(state.held)return no('先放好手里的物品，再接过宝宝');
  if(state.baby==='mother')return a('和妈妈交接，稳稳接过宝宝',2,()=>{state.baby='carried';speak('抱着宝宝时，先专心照护。去房间里的换护垫吧。',6)});
  return a('坐近一点，听她说说今晚的感受',4,()=>{state.calm=Math.min(100,state.calm+5);speak('妈妈：「不需要你每一步都完美。一起面对，就好多了。」',6)});
 }
 if(s.id==='mat'){
  if(state.held)return no('先送走手里的物品');
  if(state.baby==='carried'&&!state.done.diaper)return a('把宝宝安稳放在低位换护垫上',2,()=>{state.baby='mat';state.change=0;speak('留在宝宝身边。用品就在手边，继续互动完成换护。',6)});
  if(state.baby==='mat'){
   const steps=['清洁双手，备好用品','轻柔清洁，换上干净尿布','收好用品，抱起宝宝'];
   return a(steps[state.change],3,()=>{state.change++;if(state.change===3){state.baby='carried';finishTask('diaper');speak('照护完成。抱宝宝到已经准备好的婴儿床吧。',6)}else beep();});
  }
  return no('宝宝和用品准备好后，在这里换护');
 }
 if(state.baby==='carried')return no('抱着宝宝时先专心照护，去换护垫或婴儿床');
 if(s.id==='sink'){
  if(state.held)return no('先把手里的物品送过去');
  if(state.done.water)return no('水已送到，看看还有什么需要接手');
  return a('洗手，接一杯温水',3,()=>{state.held='water';speak('拿好了。到卧室，把水递到她手边。',5)});
 }
 if(s.id==='stove'){
  if(state.held)return no('先送走手里的物品');
  if(state.done.meal)return no('今晚的餐食已经送好了');
  return a('准备一份餐食，确认方便食用',5,()=>{state.held='meal';speak('给她送过去吧。照护者的饭，也值得好好吃。',5)});
 }
 if(s.id==='clothes'){
  if(state.held)return no('双手腾出来再搬衣物');
  if(state.washer!==null||state.done.laundry)return no('衣物已经进入洗衣流程');
  return a('把待洗衣物收进篮子',2,()=>{state.held='clothes';toast('衣物拿好了，送到洗衣机。')});
 }
 if(s.id==='washer'){
  if(state.held==='clothes')return a('放入衣物，启动洗衣机',3,()=>{state.held=null;state.washer=14;speak('洗衣机运转中。你可以先去处理别的事。',5)});
  if(state.washer>0)return no('洗衣中 · 还剩 '+Math.ceil(state.washer)+' 秒');
  if(state.washer===0&&!state.done.laundry)return a('取出衣物，安排晾晒',3,()=>finishTask('laundry'));
  return no(state.done.laundry?'衣物已经收尾完成':'先把待洗衣物搬过来');
 }
 if(s.id==='phone'){
  if(state.held)return no('先把物品送到目的地，再打电话');
  if(!state.phoneHandled&&state.phone)return a('回复家人，静音非紧急消息',3,()=>{state.phone=false;state.phoneHandled=true;state.calm=Math.min(100,state.calm+6);speak('你：「我们都好，现在需要安静休息。明天再一起聊。」',6)});
  if(!state.helper&&state.helperETA===null)return a('请信任的家人来接一班，约定照护分工',4,()=>{state.helperETA=18;speak('帮手：「可以，稍后到。你先安顿好宝宝，我们到门口交接。」',7)});
  return no(state.helper?'帮手已经接班，你可以放心休息':'帮手正在路上，先把其他事安排好');
 }
 if(s.id==='door'){
  if(state.helperArrived&&!state.helper)return a('和帮手交接宝宝状态与照护安排',4,()=>{state.helper=true;state.helperArrived=false;speak('帮手：「这一班我来。你去休息一下，醒来我们再交接。」',7)});
  if(state.visitor&&!state.done.boundary)return a('礼貌说明休息需求，约好另一天探望',3,()=>{state.visitor=false;finishTask('boundary');speak('门外安静下来。你给这个小家留住了一点空间。',6)});
  return no('门外很安静。暂时没有人需要接待');
 }
 if(s.id==='sofa'){
  if(state.held)return no('先把手里的物品放到目的地');
  if(!state.done.settle)return no('先安顿好宝宝，再安排休息');
  if(!state.helper)return no('先打电话找帮手，再在门口完成交接');
  return a(state.done.rest?'喝口水，再喘口气':'坐下来休息，交出这一班',7,()=>{state.energy=Math.min(100,state.energy+35);state.breaks++;finishTask('rest');speak('你不用一直硬撑。交接清楚，休息也是照护的一部分。',6)});
 }
 return null;
}
function interact(){if(paused||ended||action)return;const station=nearest(),op=operation(station);if(!op||op.blocked){if(op)toast(op.label);return;}path=[];keys.clear();action={...op,station:station.id,elapsed:0};beep('tap');}
function nextDestination(){
 if(state.baby==='mat')return 'mat';
 if(state.held)return ['bear','pillow'].includes(state.held)?'basket':state.held==='clothes'?'washer':'mother';
 if(state.baby==='carried')return state.done.diaper?'crib':'mat';
 const t=tasks.find(t=>!state.done[t.id]);
 if(!t)return 'sofa';
 return {sleep:'crib',water:'sink',diaper:'mother',settle:state.baby==='mother'?'mother':'crib',meal:'stove',laundry:state.washer===null?'clothes':'washer',boundary:'door',rest:state.helper?'sofa':state.helperArrived?'door':'phone'}[t.id];
}
function renderHUD(){if(!state)return;
 const elapsed=Math.min(state.elapsed,360),mins=Math.floor(elapsed/2);$('#clock').textContent=String(21+Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0');
 $('#energy').style.width=state.energy+'%';$('#energy-num').textContent=Math.ceil(state.energy);$('#calm').style.width=state.calm+'%';$('#calm-num').textContent=Math.ceil(state.calm);
 const n=Object.keys(state.done).length;$('#task-count').textContent=n+' / '+tasks.length;
 $('#missions').innerHTML=tasks.map(t=>`<div class="mission ${state.done[t.id]?'done':t===tasks.find(t=>!state.done[t.id])?'active':''}"><span class="circle">${state.done[t.id]?'✓':''}</span><div><strong>${t.title}</strong><small>${state.done[t.id]?'已经接住这件小事':t.tip}</small></div></div>`).join('');
 const held=state.baby==='carried'?'👶 正抱着宝宝':state.held?itemNames[state.held]:'双手空闲';$('#carry').textContent=held;$('#inventory').textContent=held==='双手空闲'?'暂时没有携带物品':held;
 const destination=stations.find(s=>s.id===nextDestination());
 $('#hint-text').textContent=state.baby==='mat'?'换护进行中，请留在宝宝身边。继续互动完成接下来的步骤。':state.helperArrived?'帮手到门口了。把正在做的事收好，去交接吧。':state.visitor?'门铃响了。妈妈希望安静休息，你可以去门边协调探望。':state.held?'手里拿着'+itemNames[state.held]+'，下一站：'+destination.name+'。':state.baby==='carried'?'你正在抱着宝宝。下一站：'+destination.name+'。':tasks.find(t=>!state.done[t.id])?.tip||'这一晚，你们接住了彼此。';
}
function update(dt){
 if(!running||paused||ended)return;
 state.elapsed+=dt;
 state.energy=Math.max(12,state.energy-dt*(state.baby==='carried'?.1:.045));
 const pressure=(state.visitor?.06:0)+(state.phone?.035:0)+(!state.done.settle?.018:0);
 state.calm=Math.max(25,Math.min(100,state.calm-dt*pressure));
 if(state.elapsed>24&&!state.phoneHandled&&!state.phone){state.phone=true;beep('tap');speak('手机响了：家人正在问近况。可以去客厅回复，再把非紧急消息静音。',7);}
 if((state.elapsed>45||Object.keys(state.done).length>=3)&&!state.done.boundary&&!state.visitor){state.visitor=true;state.visitorAt=state.elapsed;beep('tap');speak('叮咚——亲友想来看看宝宝。妈妈：「今晚有点累，能不能改天？」',7);}
 if(state.helperETA!==null&&state.helperETA>0){state.helperETA-=dt;if(state.helperETA<=0){state.helperArrived=true;speak('帮手到了：「我在门口，和我说说现在的情况吧。」',7);beep();}}
 if(state.washer!==null&&state.washer>0){state.washer=Math.max(0,state.washer-dt);if(state.washer===0){speak('洗衣机停了。别忘了取出衣物，安排晾晒。',5);beep();}}
 let dx=(keys.has('right')?1:0)-(keys.has('left')?1:0),dy=(keys.has('down')?1:0)-(keys.has('up')?1:0);
 if(dx||dy){path=[];cancelAction();}else if(path.length){const p=path[0],d=Math.hypot(p.x-player.x,p.y-player.y);if(d<5)path.shift();else{dx=(p.x-player.x)/d;dy=(p.y-player.y)/d;}}
 if(state.baby==='mat'&&(dx||dy)){dx=dy=0;path=[];if(!state.warnedMat){toast('照护还没完成。请留在宝宝身边，继续互动。');state.warnedMat=true;}}
 if(dx||dy){const length=Math.hypot(dx,dy),speed=state.baby==='carried'?125:state.held==='water'||state.held==='meal'?150:190;dx=dx/length*speed*dt;dy=dy/length*speed*dt;if(!blocked(player.x+dx,player.y))player.x+=dx;if(!blocked(player.x,player.y+dy))player.y+=dy;player.face=dx<0?-1:dx>0?1:player.face;player.step+=dt*9;state.walked+=Math.hypot(dx,dy);}
 if(action){action.elapsed+=dt;$('#action-progress').style.width=Math.min(100,action.elapsed/action.duration*100)+'%';if(action.elapsed>=action.duration){const fn=action.fn;action=null;$('#action-progress').style.width='0';fn();renderHUD();}}
 const near=nearest(),op=operation(near);$('#location').textContent=near?.name||((player.y<310?'卧室 / 客厅':'厨房 / 杂物间'));$('#action-label').textContent=action?action.label+'…':op?.label||'走近物品，接手一件小事';$('#interact').disabled=!op||op.blocked||!!action;$('#interact').innerHTML=action?'进行中…':'互动 <kbd>E</kbd>';
 if(state.elapsed>=360)endNight(false);
 if(frame%15===0)renderHUD();
}
function endNight(complete){if(ended)return;ended=true;paused=true;action=null;path=[];const done=Object.keys(state.done).length;let best=done;try{best=Math.max(done,Number(localStorage.getItem('dad-night-best')||0));localStorage.setItem('dad-night-best',String(best));}catch{}
 show(`<div class="eyebrow">今晚的照护记录 · ${complete?'这一班顺利交接':'每次行动都算数'}</div><h1>${complete?'辛苦了，今晚的队友。':'今晚，先走到这里。'}</h1><p>${complete?'你没有变成无所不能的人。你把眼前的小事一件件接过来，也知道什么时候该请人接班。':'还有没做完的事也没关系。看看哪些环节让你分身乏术，下一晚试着换一种安排。'}</p><div class="features"><div><b>${done} / 8</b>已完成的小事</div><div><b>${Math.floor(state.elapsed/60)}:${String(Math.floor(state.elapsed%60)).padStart(2,'0')}</b>本次游戏用时</div><div><b>${best} / 8</b>本机最佳完成数</div></div>${tasks.map(t=>`<div class="summary-item">${state.done[t.id]?'✓':'○'} ${t.title}<br><span>${t.lesson}</span></div>`).join('')}<p>这些状态与记录是游戏反馈，不是育儿能力或健康风险评分。</p><button class="primary" id="again">再值一班 →</button><button class="secondary" id="learn">打开照护知识练习</button>`);$('#again').onclick=()=>{reset();close();speak('新的一晚开始。你也可以换个顺序，把等待时间用起来。',6);};$('#learn').onclick=()=>location.href='practice.html';
}
// Hand-drawn canvas room artwork and animation.
function round(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function text(t,x,y,size=14,color='#4e6251',align='center'){ctx.font=`${size>=17?'600 ':''}${size}px system-ui,sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(t,x,y);}
function circle(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function line(x,y,x2,y2,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();}
function baby(x,y){round(x-15,y-10,30,32,14,'#fff7d8','#d1b78e');circle(x,y-9,10,'#efc49e');line(x-5,y-10,x-2,y-10,'#765943');line(x+2,y-10,x+5,y-10,'#765943');}
function bear(x,y){circle(x-10,y-13,6,'#bd8d52');circle(x+10,y-13,6,'#bd8d52');circle(x,y-6,14,'#c99a62');circle(x,y+12,16,'#bd8d52');circle(x-5,y-8,2,'#574837');circle(x+5,y-8,2,'#574837');circle(x,y-2,4,'#ead3a9');}
function plant(x,y){round(x-15,y+2,30,27,4,'#b87e5e');line(x,y+3,x,y-37,'#6c8561',4);ctx.fillStyle='#91a979';ctx.beginPath();ctx.ellipse(x-9,y-22,9,19,-.7,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x+10,y-35,9,18,.7,0,Math.PI*2);ctx.fill();}
function draw(){
 ctx.clearRect(0,0,W,H);round(0,0,W,H,0,'#dddbc5');round(20,20,470,280,5,'#f0e5cb');round(510,20,470,280,5,'#e4e8cf');round(20,320,470,280,5,'#e9e4d5');round(510,320,470,280,5,'#dae5d7');
 ctx.globalAlpha=.25;for(let x=35;x<1000;x+=48){line(x,22,x,296,'#b8b596',1);line(x,325,x,598,'#b8b596',1)}ctx.globalAlpha=1;
 text('卧 室',255,49,11,'#a79d80');text('客 厅',740,49,11,'#92a080');text('厨 房',255,352,11,'#a29b86');text('家 务 角',740,352,11,'#8d9f8a');
 // rugs and wall windows
 round(555,181,222,74,34,'#c9d4b5');round(299,187,120,99,16,'#e4d5b9');round(320,451,126,103,14,'#d9d1b8');
 for(const x of [245,749]){round(x-32,20,64,13,3,'#8aada0');line(x,20,x,33,'#eaf4db',2)}
 // mother's bed
 round(61,68,154,100,12,'#b99472');round(67,73,142,83,10,'#faf4df');round(81,78,45,26,8,'#dfdabf');round(66,113,144,48,6,'#aebf9b');circle(143,95,21,'#534b3b');circle(143,101,16,'#edbb98');round(119,116,48,32,10,'#d9a87a');
 if(state?.baby==='mother')baby(171,119);
 // crib frame
 round(292,64,132,91,11,'#b79470');round(301,71,114,75,7,'#fbf7e5');for(let x=303;x<420;x+=17){line(x,68,x,77,'#95744f',3);line(x,140,x,153,'#95744f',3)}
 if(state?.hazards.includes('bear'))bear(330,104);if(state?.hazards.includes('pillow'))round(359,91,43,29,8,'#e0c4b8');if(state?.baby==='crib'){baby(355,105);text('z',389,84+Math.sin(frame/30)*3,15,'#8f9d80');}
 round(317,212,90,54,9,'#9db79d');round(325,218,73,40,7,'#eff2dc');if(state?.baby==='mat')baby(356,234);else{round(369,229,23,17,4,'#fff8e6');text('✚',339,244,18,'#9aa68b');}
 // sofa and rest corner
 round(578,72,178,78,15,'#6e8b69');round(587,83,160,55,10,'#a8bb8d');line(665,86,665,131,'#819a72',2);round(573,90,19,62,6,'#86a17b');round(742,90,19,62,6,'#86a17b');round(813,77,95,49,10,'#ba9b74');round(849,83,23,32,5,'#344c45');round(852,87,17,22,2,state?.phone?'#efbb79':'#a1c5a7');plant(929,79);
 // door
 round(943,181,37,93,5,'#ac8564');round(949,187,25,78,3,'#c09b74');circle(954,231,3,'#665b44');if(state?.visitor||state?.helperArrived){circle(928,204,13,'#efbe73');text('!',928,210,18,'#775038');}
 // kitchen counters and sink
 round(54,371,270,70,10,'#b6ae91');round(58,373,262,56,7,'#ebe8d9');round(69,382,71,36,7,'#abc0bc');round(78,389,53,23,4,'#738f8d');line(120,375,120,393,'#e9eee2',5);line(105,375,121,375,'#e9eee2',5);round(147,388,18,22,4,'#fffdf0');
 round(215,382,87,36,5,'#4e5f53');for(const x of [239,276]){circle(x,399,12,'#8a9d87');circle(x,399,7,'#596b5b')}round(239,383,29,19,7,'#d6b184');line(268,390,281,386,'#917b5b',4);round(345,473,75,56,12,'#b69b73');round(356,482,54,35,10,'#ebdfbd');plant(56,543);
 // washer and baskets
 round(628,373,76,68,9,'#b8c7b6');round(633,375,65,60,7,'#f3f0da');circle(665,411,20,'#9bb5ab');circle(665,411,13,'#5b7c76');if(state?.washer>0){const a=frame/12;line(665,411,665+12*Math.cos(a),411+12*Math.sin(a),'#d7e8d8',4)}circle(645,384,3,'#739182');round(683,380,9,5,2,state?.washer>0?'#e9b261':'#b0bda7');
 round(835,377,80,63,12,'#b89261');for(let y=388;y<434;y+=10)line(839,y,910,y,'#d8bb8c',2);if(state&&!state.hazards.includes('bear')&&state.held!=='bear')bear(862,398);if(state&&!state.hazards.includes('pillow')&&state.held!=='pillow')round(879,399,28,20,6,'#e0c4b8');
 if(state&&state.washer===null&&state.held!=='clothes'){round(844,522,56,33,8,'#be9a77');for(const [x,y,c]of[[854,520,'#d3a694'],[879,518,'#a6bac9'],[868,531,'#d8d0ac']])round(x-12,y-9,25,19,7,c);}
 if(state?.helper){circle(800,111,13,'#eac19e');round(786,124,28,34,10,'#a795bf');text('接班中',800,174,10,'#6a816b');}
 // walls, door openings, and labels
 for(const r of walls)round(r.x,r.y,r.w,r.h,3,'#aab298');
 const near=nearest();
 for(const s of stations){
  const active=near?.id===s.id||hover===s.id;
  if(active){ctx.setLineDash([4,4]);ctx.strokeStyle='#bc8250';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(s.ax,s.ay,26,12,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
  const ty=s.id==='mat'?286:s.id==='clothes'?574:s.id==='door'?284:s.y+69;
  text(s.name,s.x,ty,11,active?'#a16139':'#7b856d');
  if(target===s.id&&path.length){circle(s.ax,s.ay,5+Math.sin(frame/10)*2,'#dd9761');}
 }
 if(path.length){ctx.fillStyle='#c18d5880';for(let i=0;i<path.length;i+=3){circle(path[i].x,path[i].y,2,'#c18d5880');}}
 // player shadow and walking animation
 const p=player||{x:610,y:235,step:0,face:1};const bounce=path.length||keys.size?Math.sin(p.step)*2:0;
 ctx.globalAlpha=.17;ctx.beginPath();ctx.ellipse(p.x,p.y+10,18,7,0,0,Math.PI*2);ctx.fillStyle='#243e31';ctx.fill();ctx.globalAlpha=1;
 round(p.x-10,p.y+3,8,13+(Math.sin(p.step)*2),3,'#3e5c4b');round(p.x+3,p.y+3,8,13-(Math.sin(p.step)*2),3,'#3e5c4b');round(p.x-14,p.y-22+bounce,29,30,10,'#df895c');circle(p.x,p.y-32+bounce,15,'#e8b38b');ctx.beginPath();ctx.arc(p.x,p.y-36+bounce,15,Math.PI,Math.PI*2);ctx.fillStyle='#455447';ctx.fill();circle(p.x+p.face*5,p.y-31+bounce,1.5,'#3d4436');
 if(state?.baby==='carried')baby(p.x+p.face*13,p.y-4+bounce);
 else if(state?.held){const ix=p.x+p.face*20,iy=p.y-9+bounce;if(state.held==='bear')bear(ix,iy-3);else if(state.held==='pillow')round(ix-12,iy-10,26,19,6,'#e0c4b8');else if(state.held==='water')round(ix-7,iy-9,14,18,3,'#f9f7e7');else if(state.held==='meal'){ctx.beginPath();ctx.ellipse(ix,iy,16,8,0,0,Math.PI*2);ctx.fillStyle='#e5c289';ctx.fill();}else round(ix-13,iy-11,27,24,7,'#be9a77');}
 if(action){ctx.strokeStyle='#edac66';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y-31,22,-Math.PI/2,-Math.PI/2+2*Math.PI*action.elapsed/action.duration);ctx.stroke();}
 if(state?.phone){text('♪',892,79+Math.sin(frame/8)*3,18,'#b97c40');}
 if(paused&&running&&!ended){ctx.fillStyle='#1c372411';ctx.fillRect(0,0,W,H);}
}
function loop(now){const dt=Math.min(.04,(now-last)/1000||0);last=now;frame++;update(dt);draw();if(now>speechUntil)$('#speech').classList.remove('show');if(now>toastUntil)$('#toast').classList.remove('show');requestAnimationFrame(loop);}
const mappings={w:'up',ArrowUp:'up',s:'down',ArrowDown:'down',a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right'};
window.addEventListener('keydown',e=>{if(e.target.closest('dialog'))return;if(mappings[e.key]){e.preventDefault();keys.add(mappings[e.key]);}if((e.key.toLowerCase()==='e'||e.code==='Space')&&e.target===canvas){e.preventDefault();if(!e.repeat)interact();}});
window.addEventListener('keyup',e=>keys.delete(mappings[e.key]));window.addEventListener('blur',()=>keys.clear());
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!ended&&!paused)pauseGame();});
function coords(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
canvas.addEventListener('pointerdown',e=>{if(paused||ended)return;canvas.focus();const p=coords(e),s=stations.find(s=>Math.hypot(s.x-p.x,s.y-p.y)<58);if(s){if(Math.hypot(player.x-s.ax,player.y-s.ay)<50){interact();}else walkTo(s.ax,s.ay,s.id);}else walkTo(p.x,p.y);});
canvas.addEventListener('pointermove',e=>{const p=coords(e);hover=stations.find(s=>Math.hypot(s.x-p.x,s.y-p.y)<55)?.id;canvas.style.cursor=hover?'pointer':'crosshair';});
for(const b of document.querySelectorAll('[data-dir]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.dir);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.dir));}
$('#interact').onclick=interact;
$('#help-route').onclick=()=>{if(paused||ended)return;const s=stations.find(s=>s.id===nextDestination());walkTo(s.ax,s.ay,s.id);canvas.focus();canvas.scrollIntoView({block:'center',behavior:'smooth'});};
function pauseGame(){if(!running||ended)return;show('<div class="eyebrow">TAKE A BREATH</div><h1>先喘口气。</h1><p>游戏时间已暂停。准备好了，再回来接这一班。</p><button class="primary" id="resume">继续今晚 →</button>');$('#resume').onclick=close;}
$('#pause').onclick=pauseGame;
$('#finish').onclick=()=>{if(!running||ended)return;show('<h1>现在结束这一晚？</h1><p>会保留本次完成的小事并展示回顾。也可以继续挑战剩余任务。</p><button class="primary" id="end-confirm">结束并回顾</button><button class="secondary" id="resume">继续这一晚</button>');$('#end-confirm').onclick=()=>{$('#overlay').close();endNight(false)};$('#resume').onclick=close;};
$('#music').onclick=()=>{if(!music)return;music.setEnabled(!music.enabled);$('#music').textContent='配乐：'+(music.enabled?'开':'关');$('#music').setAttribute('aria-pressed',String(music.enabled));};
$('#music-volume').oninput=e=>music?.setVolume(Number(e.target.value)/100);
$('#sound').onclick=()=>{sound=!sound;$('#sound').textContent='音效：'+(sound?'开':'关');$('#sound').setAttribute('aria-pressed',String(sound));beep();};
$('#guide').onclick=()=>{show(`<div class="eyebrow">HOW TO PLAY</div><h1>你来决定下一步。</h1><p>方向键或 WASD 移动。靠近物品后按 E / 空格，或点「互动」。点击场景物品可以自动走近，再次点击可操作。手机也可以用屏幕方向键。</p><p>操作需要几秒；移动会取消操作。一次只携带一件物品，抱着宝宝时要专注照护。宝宝在换护垫上时，必须完成换护才能离开。点击「带我去当前任务」可查看路线。</p><p>电话、门铃、洗衣机和帮手会在过程中触发。等待洗衣或帮手时，可以先做其他事情。游戏最多六分钟，随时可暂停或结束回顾。</p><p>精力和安定度是叙事反馈，不是健康指标。不会因为操作慢而模拟伤害。安全睡眠要点参考 <a href="https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/" target="_blank" rel="noopener">NHS 安全睡眠指南</a>；其他资料见知识练习。</p><button class="primary" id="resume">${running?'返回游戏':'返回开场'} →</button>`);$('#resume').onclick=()=>{if(running)close();else{$('#overlay').close();intro();}};};
$('#overlay').addEventListener('cancel',e=>{e.preventDefault();if(running&&!ended)close();});
reset();running=false;intro();requestAnimationFrame(loop);
})();
