/* Birth-partner episode. Fictional pacing; no clinical decisions or medical simulation. */
(() => {
'use strict';
const $=s=>document.querySelector(s),canvas=$('#world'),ctx=canvas.getContext('2d');
const music=window.NightMusic?new window.NightMusic():null;
if(music)music.onUnavailable=()=>{$('#music').textContent='配乐不可用';$('#music').setAttribute('aria-pressed','false');};
const stations=[
{id:'nurse',name:'护士站',x:165,y:105,ax:165,ay:196},
{id:'bag',name:'待产包',x:155,y:431,ax:155,ay:501},
{id:'phone',name:'家属联络处',x:248,y:246,ax:250,ay:307},
{id:'door',name:'陪产室门口',x:351,y:298,ax:306,ay:299},
{id:'partner',name:'伴侣',x:712,y:149,ax:704,ay:246},
{id:'chair',name:'陪伴座椅',x:501,y:128,ax:501,ay:202},
{id:'bell',name:'呼叫医护',x:883,y:147,ax:865,ay:222},
{id:'cart',name:'物品柜',x:488,y:426,ax:490,ay:498},
{id:'water',name:'饮水台',x:864,y:423,ax:850,ay:493},
{id:'notes',name:'交接记录台',x:692,y:450,ax:690,ay:517}
];
const walls=[{x:330,y:20,w:23,h:225},{x:330,y:356,w:23,h:244}];
const tasks=[
{id:'arrival',title:'把入院交接办稳',tip:'从待产包取出资料，带到护士站。',lesson:'让资料、联系方式和物品准备有序，减少来回奔忙。'},
{id:'plan',title:'先听清她的陪产偏好',tip:'拿到偏好记录，先和她确认，再交给护士。',lesson:'计划属于她。帮她表达，并允许她随时改变想法。'},
{id:'comfort',title:'把舒适物品送到手边',tip:'从物品柜取靠枕，询问她后放好。',lesson:'先问需要什么，再提供她愿意接受的支持。'},
{id:'water',title:'确认之后，再送一杯水',tip:'先向护士确认当前饮水安排，再取水送去。',lesson:'是否能饮水或进食，需要遵循当时医护的具体指导。'},
{id:'focus',title:'接住一段需要陪伴的时刻',tip:'回到她身边，跟随游戏光点完成三次握手回应。',lesson:'观察反馈、专注陪伴；小游戏节奏不对应宫缩或呼吸频率。'},
{id:'privacy',title:'把外界的打扰接过去',tip:'在联络处回复亲友，再到门口安排安静探望。',lesson:'以她的意愿为前提，协调消息、拍摄和来访。'},
{id:'advocate',title:'她改变主意时，帮她表达',tip:'听到镇痛咨询需求，按呼叫铃，再陪她与医护沟通。',lesson:'协助问清选择、表达意愿，不替伴侣决定医疗方案。'},
{id:'handoff',title:'交接清楚，继续迎接宝宝',tip:'带着当前偏好与沟通记录找护士确认，再一起迎接分娩。',lesson:'听清接下来的安排，并记住有需要时如何联系医护。'}
];
const itemNames={papers:'📄 入院资料',plan:'📒 陪产偏好',confirmedPlan:'📒 已确认的偏好',pillow:'▱ 靠枕',water:'🥛 饮水',notes:'📋 交接记录'};
let state,player,path=[],keys=new Set(),action=null,paused=true,running=false,ended=false,last=0,frame=0,hover=null,target=null;
let sound=false,audio=null;
function say(s){$('#speech').textContent=s;}
function tell(s){$('#toast').textContent=s;}
function tone(good=true){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=good?660:330;g.gain.setValueAtTime(.04,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.2);o.start();o.stop(audio.currentTime+.22);}catch{}}
function reset(){
 state={time:0,energy:100,held:null,done:{},drinkAllowed:false,contacted:false,request:false,called:false,nurseETA:0,nurseHere:false,recordConfirmed:false,readyForBirth:false,phoneRang:false,rhythm:false,rhythmTime:0,hits:0,cooldown:0,attempts:0,breaks:0};
 player={x:216,y:320,step:0};path=[];keys.clear();target=null;action=null;ended=false;running=true;
 $('#rhythm-panel').hidden=true;tell('行动反馈会显示在这里。');renderHUD();last=performance.now();
}
function show(html){paused=true;keys.clear();path=[];music?.setPlaying(false);$('#pause').textContent='继续';$('#overlay-content').innerHTML=html;$('#overlay').showModal();}
function close(){ $('#overlay').close();if(!ended){paused=false;last=performance.now();music?.setPlaying(running);$('#pause').textContent='暂停';canvas.focus();}}
function intro(){show(`<div class="eyebrow">NEW EPISODE · BIRTH PARTNER</div><h1>我在，你不用<br>独自面对。</h1><p>你们已经到达医院。她需要一个能听见需求、拿好东西、及时帮她叫到医护的人。现在，接过待产包，走进这一程。</p><div class="scene-phases"><span>01 入院交接</span><span>02 准备与陪伴</span><span>03 表达需求</span><span>04 分娩前交接</span></div><p>WASD / 方向键移动，E / 空格互动。也可点击物品走近，再点「互动」。靠近她后会开启光点节奏挑战，在绿色区内按下「握手」。</p><p>本次最长八分钟，时间经过是虚构的。节奏游戏不是呼吸或分娩技巧教学；玩家的得分不会决定分娩方式或母婴结局。点击开始后播放轻柔配乐。</p><button class="primary" id="begin">一起进去吧 →</button><a class="episode-return" href="index.html">返回「回家第一晚」</a>`);$('#begin').onclick=()=>{reset();close();say('她：「先把资料交给护士吧。我的待产包就在那边，你帮我拿一下。」');};}
function done(id){if(state.done[id])return;state.done[id]=true;tone();tell('✓ '+tasks.find(t=>t.id===id).title);if(Object.keys(state.done).length===8)end(true);else renderHUD();}
function blocked(x,y){return x<30||x>970||y<30||y>590||walls.some(r=>x>r.x-13&&x<r.x+r.w+13&&y>r.y-13&&y<r.y+r.h+13);}
function findPath(x,y){const start=[Math.floor(player.x/20),Math.floor(player.y/20)],goal=[Math.floor(x/20),Math.floor(y/20)],q=[start],prev=new Map([[start.join(','),null]]);let i=0;if(blocked(goal[0]*20+10,goal[1]*20+10))return[];while(i<q.length){const c=q[i++];if(c[0]===goal[0]&&c[1]===goal[1])break;for(const d of [[0,1],[0,-1],[1,0],[-1,0]]){const n=[c[0]+d[0],c[1]+d[1]],k=n.join(',');if(!prev.has(k)&&!blocked(n[0]*20+10,n[1]*20+10)){prev.set(k,c);q.push(n);}}}if(!prev.has(goal.join(',')))return[];const out=[];let c=goal;while(c&&c.join(',')!==start.join(',')){out.unshift({x:c[0]*20+10,y:c[1]*20+10});c=prev.get(c.join(','));}return out;}
function stopAction(){action=null;$('#action-progress').style.width='0';if(state.rhythm){state.rhythm=false;$('#rhythm-panel').hidden=true;tell('可以先去处理别的事，再回来继续陪伴。已完成的回应会保留。');}}
function walk(x,y,id=null){if(paused||ended)return;stopAction();target=id;path=findPath(x,y);}
function nearest(){return stations.map(s=>({s,d:Math.hypot(player.x-s.ax,player.y-s.ay)})).filter(o=>o.d<60).sort((a,b)=>a.d-b.d)[0]?.s;}
function operation(s){if(!s)return null;const a=(label,seconds,fn)=>({label,seconds,fn}),no=label=>({label,blocked:true});
 if(s.id==='bag'){
  if(state.held)return no('先把手里的物品交到需要的地方');
  if(!state.done.arrival)return a('取出入院资料',1.4,()=>state.held='papers');
  if(!state.done.plan)return a('取出陪产偏好记录',1.4,()=>state.held='plan');
  return no('证件与个人物品已整理好');
 }
 if(s.id==='nurse'){
  if(state.held==='papers')return a('递交资料，确认报到与联络方式',3,()=>{state.held=null;done('arrival');say('护士：「已经登记好了。先和她确认希望怎样被陪伴，再告诉我们。」');});
  if(state.held==='confirmedPlan')return a('把她确认的陪产偏好交给护士',2.5,()=>{state.held=null;done('plan');say('护士：「收到。需求可以变化，有不舒服或任何疑问随时叫我们。」');});
  if(state.held==='notes')return a('与护士确认后续观察、休息和求助安排',3,()=>{state.held=null;state.recordConfirmed=true;say('护士：「后续安排都记在这里。有担心的情况及时联系我们，别自己判断。」');tell('交接已记录，现在回到她身边。');});
  if(!state.done.arrival)return no('先到待产包拿入院资料');
  if(!state.done.plan)return no('先和她确认陪产偏好，再来交接');
  if(!state.drinkAllowed)return a('询问当前能否饮水及注意事项',2.5,()=>{state.drinkAllowed=true;say('护士：「在本场景当前的安排下可以饮水；之后若安排改变，请再次问我们。」');tell('当前饮水安排已确认，可去饮水台取水。');});
  return a('确认有需要时如何及时联系医护',2,()=>say('护士：「床边有呼叫铃。她有新的需要时，请及时叫我们。」'));
 }
 if(!state.done.arrival)return no('先完成护士站的入院交接');
 if(s.id==='partner'){
  if(state.held==='plan')return a('听她说需求，一起确认陪产偏好',3,()=>{state.held='confirmedPlan';say('她：「我想你安静地陪着，不要拍照。想要什么，我会告诉你。疼痛缓解也可能临时改变主意。」');});
  if(state.held==='pillow')return a('问她是否需要靠枕，再按她的反馈放好',2.5,()=>{state.held=null;done('comfort');say('她：「这样舒服一些。谢谢你先问我。」');});
  if(state.held==='water')return a('把水递到她手边',2,()=>{state.held=null;done('water');say('她：「接下来这段，你握着我的手陪我吧。」');});
  if(state.held)return no('先将手里的资料交给护士');
  if(!state.done.plan)return no('先从待产包取出陪产偏好，听她说说');
  if(state.recordConfirmed)return a('坐回她身边，开始下一段陪伴',4,()=>{done('handoff');});
  if(state.nurseHere&&!state.done.advocate)return a('陪她提问、记下解释，让她表达自己的选择',4,()=>{done('advocate');say('她向医护表达了自己的意愿。你记下问题与解释，继续支持她。');});
  if(state.called&&!state.nurseHere)return no('医护正在过来，留在她身边即可');
  if(state.request&&!state.called)return no('她想咨询镇痛选择，请按床边呼叫铃');
  if(!state.done.comfort||!state.done.water)return no('先把舒适物品与她需要的水准备好');
  if(!state.done.focus)return a('握住她的手，开始专注陪伴',1,()=>{state.rhythm=true;state.rhythmTime=0;state.cooldown=0;$('#rhythm-panel').hidden=false;$('#rhythm-panel').scrollIntoView({block:'center',behavior:'smooth'});say('她：「就这样陪着我。你在这里，我知道的。」');tell('光点进入绿色区时，点「握手」或按 E，完成三次回应。');});
  return a('安静地陪她一会儿',3,()=>{state.energy=Math.min(100,state.energy+5);say('你：「我在这里。想改变什么，我们随时告诉医护。」');});
 }
 if(s.id==='cart'){
  if(state.held)return no('先把手里的物品送到目的地');
  if(!state.done.plan)return no('先确认她的陪产偏好');
  if(!state.done.comfort)return a('取出她需要的靠枕',1.5,()=>state.held='pillow');
  return no('需要的舒适用品已放到手边');
 }
 if(s.id==='water'){
  if(state.held)return no('先把手里的物品送过去');
  if(!state.drinkAllowed)return no('先向护士确认她当前的饮水安排');
  if(state.done.water)return no('饮水已送到，其他需求仍可问医护');
  return a('按已确认的安排取一杯水',2,()=>state.held='water');
 }
 if(s.id==='phone'){
  if(state.held)return no('先交接好手里的物品');
  if(!state.contacted)return a('按她的意愿回复家人，暂缓拍照和来访',3,()=>{state.contacted=true;say('你：「我们已经安顿好。她现在需要安静，我们有消息会联系大家。」');tell('再去门口，把安静探望安排好。');});
  return no('亲友已经收到消息，非紧急通知已静音');
 }
 if(s.id==='door'){
  if(!state.contacted)return no('先在家属联络处沟通她的休息需求');
  if(!state.done.privacy)return a('与家属约好探望时机，保留安静空间',2,()=>{done('privacy');say('门外的脚步渐渐远了。你把注意力留给房间里的她。');});
  return no('来访已经协调好，门口保持安静');
 }
 if(s.id==='bell'){
  if(!state.request)return a('确认呼叫铃的位置和使用方式',1,()=>tell('知道需要帮助时在哪里呼叫，就少一份慌乱。'));
  if(!state.called)return a('呼叫医护，说明她想了解镇痛选择',1.5,()=>{state.called=true;state.nurseETA=6;say('医护回应：「收到，我们来和她聊一聊。」');});
  return no(state.nurseHere?'医护已在床旁，请一起听取解释':'已经呼叫，医护正在过来');
 }
 if(s.id==='notes'){
  if(!state.readyForBirth)return no('先完成陪产协作，后续交接将在剧情推进后开启');
  if(state.held)return no('先把手里的资料送到护士站');
  if(state.recordConfirmed)return no('后续安排已与医护确认，回到她身边吧');
  return a('拿起后续照护交接记录',1.5,()=>state.held='notes');
 }
 if(s.id==='chair'){
  if(state.held)return no('先把手里的物品送好');
  return a('坐下整理呼吸，让自己镇定一点',4,()=>{state.energy=Math.min(100,state.energy+20);state.breaks++;tell('你也可以短暂休息，再继续陪伴。');});
 }
 return null;
}
function hit(){
 if(state.cooldown>0)return;
 const phase=(Math.sin(state.rhythmTime*1.8-Math.PI/2)+1)/2;
 state.attempts++;state.cooldown=.7;
 if(phase>=.36&&phase<=.64){state.hits++;tone();tell('接住了这次回应 · '+state.hits+' / 3');if(state.hits===3){state.rhythm=false;$('#rhythm-panel').hidden=true;state.request=true;done('focus');say('她：「我改变主意了，想问问镇痛选择。你帮我叫一下医护，好吗？」');}}
 else{tone(false);tell('不着急。等光点进入绿色区域，再试一次。');}
}
function interact(){if(paused||ended||action)return;if(state.rhythm){hit();return;}const s=nearest(),op=operation(s);if(!op)return;if(op.blocked){tell(op.label);return;}keys.clear();path=[];action={...op,elapsed:0};$('#interact').disabled=true;$('#interact').innerHTML='进行中…';}
function destination(){
 if(state.rhythm)return 'partner';
 if(state.held)return {papers:'nurse',plan:'partner',confirmedPlan:'nurse',pillow:'partner',water:'partner',notes:'nurse'}[state.held];
 if(state.request&&!state.done.advocate)return state.called?'partner':'bell';
 const t=tasks.find(t=>!state.done[t.id]);if(!t)return 'partner';
 return {arrival:'bag',plan:'bag',comfort:'cart',water:state.drinkAllowed?'water':'nurse',focus:'partner',privacy:state.contacted?'door':'phone',advocate:'bell',handoff:state.recordConfirmed?'partner':'notes'}[t.id];
}
function renderHUD(){if(!state)return;const n=Object.keys(state.done).length;$('#clock').textContent=state.readyForBirth?'分娩前交接':state.request?'表达需求':state.done.arrival?'准备与陪伴':'待产报到';$('#energy').style.width=state.energy+'%';$('#energy-num').textContent=Math.ceil(state.energy);$('#calm').style.width=n/8*100+'%';$('#calm-num').textContent=n+'/8';$('#task-count').textContent=n+' / 8';
 const active=state.request&&!state.done.advocate?'advocate':tasks.find(t=>!state.done[t.id])?.id;
 $('#missions').innerHTML=tasks.map(t=>`<div class="mission ${state.done[t.id]?'done':active===t.id?'active':''}"><span class="circle">${state.done[t.id]?'✓':''}</span><div><strong>${t.title}</strong><small>${state.done[t.id]?'已完成':t.tip}</small></div></div>`).join('');
 const held=state.held?itemNames[state.held]:'双手空闲';$('#carry').textContent=held;$('#inventory').textContent=held;
 $('#hint-text').textContent=state.rhythm?'专注观察场景下方的光点，在绿色区按「握手」。这只是游戏，不需要照着调整呼吸。':state.held?'下一站：'+stations.find(s=>s.id===destination()).name+'。带着'+itemNames[state.held]+'过去。':tasks.find(t=>t.id===active)?.tip||'这一程，你陪在了她身边。';
 $('#rhythm-count').textContent=state.hits+' / 3';
}
function update(dt){if(paused||!running||ended)return;state.time+=dt;state.energy=Math.max(15,state.energy-dt*.045);state.cooldown=Math.max(0,state.cooldown-dt);
 if(state.time>25&&!state.phoneRang&&!state.contacted){state.phoneRang=true;say('手机亮了：家人想来探望。她希望先安静一些，你可以代为联系。');tone(false);}
 if(state.called&&!state.nurseHere){state.nurseETA-=dt;if(state.nurseETA<=0){state.nurseHere=true;say('医护到床边了。现在陪她把想问的问题说清楚，听取专业解释。');tone();}}
 if(Object.keys(state.done).length===7&&!state.readyForBirth){state.readyForBirth=true;say('医护：“这一段准备已经完成。把当前需求与记录交接清楚，接下来我们继续陪她经历分娩。”');tell('去交接记录台拿资料，与护士确认后续安排。');}
 let dx=(keys.has('right')?1:0)-(keys.has('left')?1:0),dy=(keys.has('down')?1:0)-(keys.has('up')?1:0);
 if(dx||dy){path=[];stopAction();}else if(path.length){const p=path[0],d=Math.hypot(p.x-player.x,p.y-player.y);if(d<5)path.shift();else{dx=(p.x-player.x)/d;dy=(p.y-player.y)/d;}}
 if(dx||dy){const len=Math.hypot(dx,dy),speed=state.held==='water'?145:190;dx=dx/len*speed*dt;dy=dy/len*speed*dt;if(!blocked(player.x+dx,player.y))player.x+=dx;if(!blocked(player.x,player.y+dy))player.y+=dy;player.step+=dt*9;}
 if(action){action.elapsed+=dt;$('#action-progress').style.width=Math.min(100,action.elapsed/action.seconds*100)+'%';if(action.elapsed>=action.seconds){const fn=action.fn;action=null;$('#action-progress').style.width='0';fn();renderHUD();}}
 if(state.rhythm){state.rhythmTime+=dt;$('#rhythm-dot').style.left=((Math.sin(state.rhythmTime*1.8-Math.PI/2)+1)*50)+'%';}
 const s=nearest(),op=operation(s);$('#location').textContent=state.rhythm?'专注陪伴':s?.name||'走廊';$('#action-label').textContent=state.rhythm?'光点进入绿色区时回应':action?action.label+'…':op?.label||'走近物品，接住一个需要';$('#interact').disabled=state.rhythm?state.cooldown>0:!op||!!op.blocked||!!action;$('#interact').innerHTML=state.rhythm?'握手 <kbd>E</kbd>':action?'进行中…':'互动 <kbd>E</kbd>';
 if(frame%12===0)renderHUD();if(state.time>=480)end(false);
}
function end(complete){if(ended)return;ended=true;state.rhythm=false;$('#rhythm-panel').hidden=true;action=null;path=[];let best=Object.keys(state.done).length;try{best=Math.max(best,Number(localStorage.getItem('dad-labor-best')||0));localStorage.setItem('dad-labor-best',String(best));}catch{}
 show(`<div class="eyebrow">BIRTH PARTNER · 陪产回顾</div><h1>${complete?'这一程，你一直在。':'这一程，先到这里。'}</h1><p>支持不是替她作出每一个决定，而是在她需要时递出双手、表达需求、找来合适的帮助。</p><div class="features"><div><b>${Object.keys(state.done).length}/8</b>完成的协作</div><div><b>${state.hits}/3</b>专注回应</div><div><b>${best}/8</b>本机最佳完成数</div></div>${tasks.map(t=>`<div class="summary-item">${state.done[t.id]?'✓':'○'} ${t.title}<br><span>${t.lesson}</span></div>`).join('')}<p>本回顾不评定陪产能力，不对应真实分娩或健康结果。</p><a class="episode-return" href="birth.html">继续「迎接你」：经历分娩与第一次见面 →</a><button class="primary" id="again">再陪伴一程 →</button>`);$('#again').onclick=()=>{reset();close();say('新的一程开始。这次，也可以重新安排准备与等待的顺序。');};
}
function box(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function circle(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function line(x,y,a,b,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(a,b);ctx.stroke();}
function text(t,x,y,size=12,color='#667f7a'){ctx.font=`${size}px system-ui,sans-serif`;ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(t,x,y);}
function person(x,y,color,bounce=0){ctx.globalAlpha=.12;ctx.beginPath();ctx.ellipse(x,y+9,18,7,0,0,Math.PI*2);ctx.fillStyle='#264d49';ctx.fill();ctx.globalAlpha=1;box(x-10,y,8,15,3,'#4d6461');box(x+3,y,8,15,3,'#4d6461');box(x-14,y-27+bounce,28,34,10,color);circle(x,y-36+bounce,15,'#e9ba98');ctx.fillStyle='#4b514a';ctx.beginPath();ctx.arc(x,y-41+bounce,14,Math.PI,Math.PI*2);ctx.fill();circle(x+5,y-35+bounce,1.6,'#4b514a');}
function draw(){
 ctx.clearRect(0,0,1000,620);box(0,0,1000,620,0,'#d8e2d8');box(20,20,310,580,5,'#e9eada');box(353,20,627,580,5,'#e6eee4');for(let y=40;y<600;y+=45){line(23,y,326,y,'#dde0cc',1);line(356,y,976,y,'#dae5da',1)}
 text('待 产 接 待 区',172,48,12,'#8c9b89');text(state.readyForBirth?'产 后 交 接':'陪 产 室',667,48,12,'#8c9b89');
 box(60,76,211,71,12,'#9eb6ae');box(64,78,203,51,9,'#cfdbcd');box(85,90,48,25,3,'#607a77');box(90,95,38,15,2,'#a5c4b4');box(203,91,34,22,4,'#fff9e7');person(164,104,'#f6f5e7');box(70,123,191,27,5,'#b5cac0');text('护士站',165,172,12);
 // waiting bench, luggage and contact shelf
 box(65,387,202,73,13,'#aab7a0');box(72,393,189,52,10,'#d0d9bb');box(132,405,48,37,7,'#ce956d');line(143,405,143,399,'#956f4d',4);line(143,399,165,399,'#956f4d',4);line(165,399,165,405,'#956f4d',4);box(144,416,24,15,3,'#e4bd8d');
 box(207,223,82,46,7,'#b6bba2');box(238,229,23,32,4,'#436460');box(241,233,17,22,2,state.phoneRang&&!state.contacted?'#f0c985':'#a7cbb2');
 // bed and partner; monitor is purely decorative with no clinical readings
 box(602,85,205,142,15,'#9db6b0');box(611,93,188,119,10,'#f9f7e7');box(651,100,108,34,10,'#d8ded0');circle(707,131,23,'#5f5149');circle(707,140,17,'#eab996');box(614,159,182,52,7,'#b4cbbd');box(691,155,37,38,10,'#d6afa0');line(603,98,603,204,'#829f99',5);line(808,98,808,204,'#829f99',5);
 if(state.done.comfort)box(760,142,31,44,9,'#e6ca9f');

 box(850,120,58,54,10,'#aec4bd');circle(879,145,15,state.request&&!state.called?'#dca06a':'#779f93');text('✚',879,151,19,'#fffdf1');
 box(448,103,102,61,12,'#9cb6ab');box(456,109,86,44,10,'#c6d7c1');box(443,124,15,47,5,'#87a499');box(540,124,15,47,5,'#87a499');
 // supplies, water and handover table
 box(432,388,116,75,10,'#acb7a0');box(439,394,101,25,5,'#dce2cf');box(453,422,44,25,7,'#e6ca9f');box(505,423,26,21,4,'#fbf7e7');
 box(816,386,100,75,10,'#adbfbb');box(830,389,31,45,7,'#cfe0d6');box(835,380,22,15,5,'#8bada7');line(845,429,857,429,'#5e807b',4);box(873,419,19,26,4,'#fff8e9');
 box(633,418,117,67,12,'#bdad8c');box(661,431,55,38,4,'#f8f4df');for(let i=0;i<3;i++)line(670,441+i*8,706,441+i*8,'#a7b5a0',2);
 for(const r of walls)box(r.x,r.y,r.w,r.h,3,'#9bb3a8');box(332,261,15,70,3,state.done.privacy?'#98bfa7':'#c5b695');
 if(state.nurseHere)person(791,238,'#fbfbef');
 const near=nearest();for(const s of stations){let y=s.y+77;if(s.id==='nurse')y=172;if(s.id==='door')y=354;text(s.name,s.x,y,11,near?.id===s.id?'#9b6b45':'#6c8275');if(near?.id===s.id||hover===s.id){ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(s.ax,s.ay,25,11,0,0,Math.PI*2);ctx.strokeStyle='#bf9061';ctx.stroke();ctx.setLineDash([]);}if(target===s.id&&path.length)circle(s.ax,s.ay,5,'#c89562');}
 for(let i=0;i<path.length;i+=3)circle(path[i].x,path[i].y,2,'#b09260');
 person(player.x,player.y,'#cc946b',path.length||keys.size?Math.sin(player.step)*2:0);
 if(state.held){const x=player.x+19,y=player.y-18;if(state.held==='water')box(x-7,y,15,20,3,'#fffbeb');else if(state.held==='pillow')box(x-13,y,29,23,6,'#e6ca9f');else{box(x-10,y,24,29,3,'#f6edcc');line(x-5,y+8,x+7,y+8,'#9aac91',2);line(x-5,y+15,x+7,y+15,'#9aac91',2);}}
 if(action){ctx.strokeStyle='#d79d65';ctx.lineWidth=4;ctx.beginPath();ctx.arc(player.x,player.y-36,23,-Math.PI/2,-Math.PI/2+Math.PI*2*action.elapsed/action.seconds);ctx.stroke();}
 if(state.rhythm){circle(737,118,4+Math.sin(state.rhythmTime*2)*2,'#dba781');text('♡',738,106,20,'#c68b70');}
}
function loop(now){const dt=Math.min(.04,(now-last)/1000||0);last=now;frame++;update(dt);draw();requestAnimationFrame(loop);}
const mappings={w:'up',ArrowUp:'up',s:'down',ArrowDown:'down',a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right'};
window.addEventListener('keydown',e=>{if(e.target.closest('dialog'))return;if(mappings[e.key]){e.preventDefault();keys.add(mappings[e.key]);}if((e.key.toLowerCase()==='e'||e.code==='Space')&&e.target===canvas){e.preventDefault();if(!e.repeat)interact();}});window.addEventListener('keyup',e=>keys.delete(mappings[e.key]));window.addEventListener('blur',()=>keys.clear());
function coords(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*1000/r.width,y:(e.clientY-r.top)*620/r.height};}
canvas.addEventListener('pointerdown',e=>{if(paused||ended)return;canvas.focus();const p=coords(e),s=stations.find(s=>Math.hypot(s.x-p.x,s.y-p.y)<55);if(s){if(Math.hypot(player.x-s.ax,player.y-s.ay)<50)interact();else walk(s.ax,s.ay,s.id);}else walk(p.x,p.y);});canvas.addEventListener('pointermove',e=>{const p=coords(e);hover=stations.find(s=>Math.hypot(s.x-p.x,s.y-p.y)<55)?.id;canvas.style.cursor=hover?'pointer':'crosshair';});
for(const b of document.querySelectorAll('[data-dir]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.dir);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.dir));}
$('#interact').onclick=interact;$('#help-route').onclick=()=>{if(paused||ended)return;if(state.rhythm){$('#rhythm-panel').scrollIntoView({block:'center'});return;}const s=stations.find(s=>s.id===destination());walk(s.ax,s.ay,s.id);canvas.focus();canvas.scrollIntoView({block:'center',behavior:'smooth'});};
function pause(){if(!running||ended)return;show('<div class="eyebrow">TAKE A BREATH</div><h1>先喘口气。</h1><p>场景时间和光点均已暂停。</p><button class="primary" id="resume">继续陪伴 →</button>');$('#resume').onclick=close;}
$('#pause').onclick=pause;document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused&&!ended)pause();});
$('#finish').onclick=()=>{if(!running||ended)return;show('<h1>现在结束这次陪产？</h1><p>可以回顾已经完成的协作，也可以继续。</p><button class="primary" id="end-confirm">结束并回顾</button><button class="secondary" id="resume">继续陪伴</button>');$('#end-confirm').onclick=()=>{$('#overlay').close();end(false);};$('#resume').onclick=close;};
$('#music').onclick=()=>{if(!music)return;music.setEnabled(!music.enabled);$('#music').textContent='配乐：'+(music.enabled?'开':'关');$('#music').setAttribute('aria-pressed',String(music.enabled));};$('#music-volume').oninput=e=>music?.setVolume(Number(e.target.value)/100);
$('#sound').onclick=()=>{sound=!sound;$('#sound').textContent='音效：'+(sound?'开':'关');$('#sound').setAttribute('aria-pressed',String(sound));tone();};
$('#guide').onclick=()=>{show(`<h1>做她身边的队友。</h1><p>移动：WASD / 方向键，或点击场景。互动：靠近后按 E / 空格，或点击互动按钮。每次携带一件物品。移动会取消进行中的操作。</p><p>握手挑战：到她身边开始陪伴，光点进入绿色区时按 E 或点「握手」。完成三次即可。失误可重试，没有伤害惩罚；离开后已完成次数会保留。</p><p>她提出新的镇痛咨询需求时，先按床边呼叫铃，再回床边陪她与医护沟通。游戏不提供镇痛方案，也不要求玩家替她决定。</p><p>最长八分钟，支持暂停和重玩。只有最佳完成数存储在当前浏览器，本次进度不续存。页面无追踪，无外部字体。</p><p>陪伴原则参考 <a href="https://www.nhs.uk/best-start-in-life/pregnancy/preparing-for-labour-and-birth/tips-for-your-birthing-partner-or-partners/" target="_blank" rel="noopener">NHS 陪产伙伴指南</a>（2026-10-03 核对）。情节、动作与时间为游戏设计，不是医学模拟。实际安排与饮食限制请遵循医护指导。</p><button class="primary" id="resume">返回 →</button>`);$('#resume').onclick=()=>{if(running)close();else{$('#overlay').close();intro();}};};
$('#overlay').addEventListener('cancel',e=>{e.preventDefault();if(running&&!ended)close();});
reset();running=false;intro();requestAnimationFrame(loop);
})();
