/* Five scene-driven family games. All clocks and outcomes are fictional. */
(() => {'use strict';
const ids=['shifts','soothe','visitors','signal','network'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const shiftJobs=[
 {id:'review',name:'整理交接',station:0,who:['dad'],duration:18,need:[],detail:'先把联络、家务和陪伴的责任交清楚。'},
 {id:'admin',name:'确认随访渠道',station:1,who:['dad'],duration:22,need:['review'],detail:'处理成人事务，不给宝宝安排作息。'},
 {id:'delivery',name:'接收用品',station:2,who:['dad','helper'],duration:24,need:['review'],detail:'来回取件时，留意谁正在陪伴。'},
 {id:'cover',name:'接过陪伴这一班',station:3,who:['helper'],duration:12,need:['review'],detail:'帮手到场后，先完成交接才能让爸爸休息。'},
 {id:'rest',name:'完整休息一段',station:4,who:['dad'],duration:32,need:['cover'],detail:'休息期间帮手必须留在陪伴位置。'},
 {id:'handoff',name:'听清新一班的记录',station:0,who:['dad'],duration:18,need:['rest','admin','delivery'],detail:'爸爸休息后回来交接，让帮手也能离开。'}
];
const requests=[
 {id:'food',name:'三天备餐',skill:'chores',duration:30,x:300,y:180},
 {id:'shopping',name:'补齐日用品',skill:'chores',duration:26,x:540,y:180},
 {id:'calls',name:'确认复诊渠道',skill:'admin',duration:22,x:780,y:180},
 {id:'company',name:'听她说一会儿',skill:'company',duration:35,x:300,y:340},
 {id:'recovery',name:'恢复疑问预约',skill:'physical',duration:28,x:540,y:340},
 {id:'feeding',name:'喂养支持预约',skill:'feeding',duration:32,x:780,y:340},
 {id:'mood',name:'持续情绪困扰支持',skill:'mental',duration:25,x:540,y:490}
];
const supporters=[
 {id:'dad',name:'爸爸',skills:['chores','admin'],cap:2,x:70,y:140},
 {id:'friend',name:'朋友',skills:['chores'],cap:1,x:70,y:230},
 {id:'family',name:'家人',skills:['chores','company'],cap:2,x:70,y:320},
 {id:'clinic',name:'医疗 / 喂养团队',skills:['physical','feeding'],cap:2,x:70,y:410},
 {id:'counsel',name:'心理专业支持',skills:['mental'],cap:1,x:70,y:500}
];
const visitors=[
 {id:'parcel',name:'配送员',kind:'delivery',arrival:0,detail:'生活用品放在门口，不进家。'},
 {id:'relative',name:'临时来访的亲友',kind:'visit',arrival:12,detail:'妈妈今天想休息，需要约另一天。'},
 {id:'friend',name:'送饭的朋友',kind:'delivery',arrival:24,detail:'送达之后离开，避免变成额外接待。'},
 {id:'cleaner',name:'已约家务帮手',kind:'helper',arrival:38,detail:'妈妈已同意，活动范围是客厅和厨房。'},
 {id:'camera',name:'想拍照的亲友',kind:'camera',arrival:50,detail:'妈妈不想被拍。先保护隐私，再说明边界。'},
 {id:'cover',name:'已约接班家人',kind:'cover',arrival:65,detail:'到场不是交接完成，还需要把当前安排说清楚。'}
];
const grid={cols:10,rows:6,start:50,end:9,blocked:[3,13,23,33,43,16,26,36,46,56,22,25,40,41]};
const facts=[{id:'stage',name:'围产阶段',text:'产后第4天，妈妈在家。'},{id:'symptom',name:'眼前症状',text:'她说头很痛，看东西也模糊。'},{id:'since',name:'开始时间',text:'今天傍晚开始，具体情况由医护评估。'},{id:'address',name:'联络与地址',text:'星河小区6号楼2层，家属在身边；虚构游戏地址。'}];
function initial(id){if(!ids.includes(id))return null;const base={version:2,id,time:0,complete:false,events:[],message:'',selected:null};
 if(id==='shifts')return {...base,actors:{dad:{x:180,y:420,job:null,progress:0},helper:{x:850,y:460,job:null,progress:0}},done:[],helperArrived:false,delay:false,recovered:false};
 if(id==='soothe')return {...base,phase:0,player:{x:250,y:400},target:null,light:85,sources:[{id:'tv',x:430,y:215},{id:'phone',x:350,y:320},{id:'speaker',x:470,y:350}],observed:[],baby:'arms',steady:0,holding:false,help:false,wait:0};
 if(id==='visitors')return {...base,door:0,screen:0,active:null,talk:0,holding:false,appointment:17,parcels:[],handled:[],inside:[],guestPositions:{},handoff:0};
 if(id==='signal')return {...base,called:false,callTime:0,observed:[],sent:[],speaking:null,voice:0,route:[grid.start],crew:0,dispatched:false,obstacle:true,door:false,backup:false,records:false,teamHere:false};
 return {...base,contracts:{},done:[],disrupted:false,consent:false,confirmed:[],focus:null};
}
function note(s,text){s.message=text;return s;}
function event(s,id,text){if(!s.events.includes(id)){s.events.push(id);s.message=text;}}
function copy(s){return JSON.parse(JSON.stringify(s));}
function act(s,type,v){if(s.complete)return s;const n=copy(s);
 if(type==='select'){n.selected=v;return n;}
 if(s.id==='shifts'){
  if(type==='assign'){
   const job=shiftJobs.find(j=>j.id===v.job),actor=n.actors[v.actor];if(!job||!actor)return s;
   if(n.done.includes(job.id))return note(n,'这件事已经接住了，不用重复做。');
   if(v.actor==='helper'&&!n.helperArrived)return note(n,'帮手还在路上。先处理不需要同时接班的事务。');
   if(!job.who.includes(v.actor))return note(n,'这件事的负责人不同，看看任务旁的分工说明。');
   if(job.need.some(k=>!n.done.includes(k)))return note(n,'先完成前面的交接。休息需要有人真正接班。');
   if(Object.values(n.actors).some(a=>a.job===job.id))return note(n,'已有一位队友在接手，不需要重复分配。');
   if(actor.job)return note(n,'先让当前动作做完，或点击“撤回当前安排”。');
   if(v.actor==='helper'&&n.actors.dad.job==='rest')return note(n,'爸爸正休息，帮手先留在陪伴位置。');
   actor.job=job.id;actor.progress=0;n.selected=null;return note(n,job.name+'已经开始，角色会走到相应位置。');
  }
  if(type==='cancel'&&n.actors[v]?.job){n.actors[v].job=null;n.actors[v].progress=0;return note(n,'安排已撤回，已完成的事情会保留。');}
  if(type==='reconfirm'&&n.delay&&n.helperArrived){n.recovered=true;event(n,'handover','重新说明了当前责任，帮手回到陪伴位置。');}
 }
 if(s.id==='soothe'){
  if(type==='move')n.target={x:clamp(v.x,80,880),y:clamp(v.y,180,510)};
  if(type==='light')n.light=clamp(Number(v)||0,0,100);
  if(type==='source'&&n.phase===1){const src=n.sources.find(x=>x.id===v.id);if(src){src.x=clamp(v.x,80,880);src.y=clamp(v.y,170,510);}}
  if(type==='observe'&&n.phase===0){if(!['needs','comfort','support'].includes(v))return s;if(!n.observed.includes(v))n.observed.push(v);note(n,({needs:'她刚回应过喂养和尿布需要。仍不确定的情况，应向医护询问。',comfort:'你留意宝宝的状态。游戏不根据哭声判断病因。',support:'她也很疲惫。今天的目标是有人接班，不是证明自己能让哭声停止。'})[v]);if(n.observed.length===3){n.phase=1;event(n,'observe','先看见需要，再调整环境。把三个声源移出浅色安静区。');}}
  if(type==='environment'&&n.phase===1){if(n.light>45||n.sources.some(p=>Math.hypot(p.x-320,p.y-285)<225))return note(n,'还太亮或声源太近：调柔灯光，把三个声源移到右侧。');n.phase=2;note(n,'环境柔和了，哭声仍在。你觉得自己开始烦躁，先把宝宝安全安置。');}
  if(type==='place'&&n.phase===2){if(Math.hypot(n.player.x-320,n.player.y-285)>75)return note(n,'先走到婴儿床旁，保持照护连续。');n.baby='cot';n.phase=3;n.target=null;event(n,'safe','宝宝已仰卧安置在平坦、坚实、无松软物品的独立婴儿床中。');}
  if(type==='hold'&&n.phase===3){n.holding=!!v;if(!v)n.steady=Math.max(0,n.steady-1);}
  if(type==='help'&&n.phase>=3){n.help=true;note(n,'已联系可信赖的接班家人；如果担心宝宝生病，应直接寻求医疗帮助。');}
  if(type==='handoff'&&n.phase===4&&n.help&&n.wait>=14){n.phase=5;n.complete=true;event(n,'team','你交出了当前安排，帮手在床边接班。哭声不作为成败标准。');}
 }
 if(s.id==='visitors'){
  if(type==='person'&&visitors.some(p=>p.id===v&&p.arrival<=n.time)&&!n.handled.includes(v)){n.active=v;n.talk=0;n.holding=false;}
  if(type==='talk'){n.holding=!!v;}
  if(type==='door')n.door=clamp(Number(v)||0,0,100);
  if(type==='screen')n.screen=clamp(Number(v)||0,0,100);
  if(type==='appointment')n.appointment=clamp(Number(v)||0,9,20);
  const person=visitors.find(x=>x.id===n.active);
  if(type==='tray'&&person?.kind==='delivery'&&n.talk>=3){if(v.x<650||v.x>875||v.y<360||v.y>500)return note(n,'把交付托盘拖到门外虚线区，配送不需要进入家里。');if(n.door>25)return note(n,'先把门收到小开口，门外交付即可。');n.parcels.push(person.id);n.handled.push(person.id);n.active=null;event(n,'delivery-'+person.id,'门外交付完成。物品送到了，家里仍能安静休息。');}
  if(type==='book'&&person?.kind==='visit'&&n.talk>=3){if(n.appointment<16)return note(n,'今天上午和下午都留给休息，把来访约到另一天的傍晚时段。');n.handled.push(person.id);n.active=null;event(n,'appointment','你约好了明天 '+n.appointment+':00，亲友已经收到明确安排。');}
  if(type==='invite'&&person&&['helper','cover'].includes(person.kind)&&n.talk>=3){if(n.door<75)return note(n,'双方已确认了协助，把门打开，让约好的帮手进来。');if(n.screen<85)return note(n,'先拉好卧室隐私屏，再开放家务活动区。');if(!n.inside.includes(person.id))n.inside.push(person.id);n.guestPositions[person.id]=0;note(n,'帮手正在沿访客通道进屋，卧室仍保持隐私。');}
  if(type==='privacy'&&person?.kind==='camera'&&n.talk>=3){if(n.screen<85||n.door>25)return note(n,'先拉好隐私屏、把门收到小开口，再明确暂停拍照。');n.handled.push(person.id);n.active=null;event(n,'photo-boundary','亲友收起了相机。你说清楚了她今天不想被拍摄的意愿。');}
  if(type==='handoff'&&n.active==='cover'&&n.inside.includes('cover')&&n.guestPositions.cover>=1){n.handoff+=1;if(n.handoff>=3){n.handled.push('cover');n.active=null;event(n,'cover','完成了当前需要、联络方式和下一班责任的交接。');}}
  if(n.handled.length===visitors.length){n.complete=true;note(n,'好意有了具体去处，休息和隐私也有人守住。');}
 }
 if(s.id==='signal'){
  if(type==='call'&&!n.called){n.called=true;n.callTime=n.time;event(n,'call','模拟联络已启动。现实中的严重头痛、视线变化需要立即求医，不等待游戏任务。');}
  if(type==='observe'&&facts.some(f=>f.id===v)&&!n.observed.includes(v)){n.observed.push(v);note(n,facts.find(f=>f.id===v).text);}
  if(type==='speak'){if(!n.called)return note(n,'先启动模拟求助，整理资料不能成为联络前置条件。');if(v===null){n.speaking=null;n.voice=0;}else if(n.observed.includes(v)&&!n.sent.includes(v)){n.speaking=v;n.voice=0;}}
  if(type==='route'&&n.called&&!n.dispatched){const prev=n.route.at(-1);if(v===n.route[n.route.length-2])n.route.pop();else if(Number.isInteger(v)&&v>=0&&v<60&&!grid.blocked.includes(v)&&!n.route.includes(v)&&((Math.abs(v-prev)===10)||(Math.abs(v-prev)===1&&Math.floor(v/10)===Math.floor(prev/10))))n.route.push(v);else note(n,'沿相邻走廊格铺设引导路线，墙和设备区不能穿过。');}
  if(type==='reset-route'&&!n.dispatched)n.route=[grid.start];
  if(type==='dispatch'&&n.called){if(n.route.at(-1)!==grid.end)return note(n,'先把路线接到家门，别让工作人员走进死路。');n.dispatched=true;event(n,'guide','路线已确认，模拟支援人员开始走向家门。');}
  if(type==='obstacle'&&n.called){if(v.x<650||v.x>900||v.y<460)return note(n,'把走廊推车拖到右下角停放区，留出通道。');n.obstacle=false;note(n,'通道留好了，继续保持联络。');}
  if(type==='door'&&n.called)n.door=true;
  if(type==='backup'&&n.called)n.backup=true;
  if(type==='records'&&n.called)n.records=true;
  if(type==='handoff'&&n.teamHere){if(n.sent.length!==4||!n.backup||!n.records)return note(n,'把已知情况传清楚，并确认宝宝照护和个人资料交接。');n.complete=true;event(n,'handoff','支援人员已接到情况，接下来由医疗团队继续评估与照护。');}
 }
 if(s.id==='network'){
  if(type==='consent'){n.consent=true;event(n,'consent','她愿意邀请合适的人参与。专业预约和家务协助都按她的意愿继续。');}
  if(type==='assign'){
   const need=requests.find(r=>r.id===v.need),person=supporters.find(p=>p.id===v.person);if(!need||!person)return s;
   if(!n.consent)return note(n,'先和她商量希望获得哪些支持。');
   if(n.done.includes(need.id))return note(n,'这个支持点已落实，不用重做。');
   if(person.id==='friend'&&n.disrupted)return note(n,'朋友今天临时有事，换一位合适的人。');
   if(!person.skills.includes(need.skill))return note(n,'需要与这位队友的专长不匹配，专业疑问交给对应团队。');
   if(Object.entries(n.contracts).filter(([k,c])=>k!==need.id&&c.person===person.id&&c.status!=='done').length>=person.cap)return note(n,'这位队友已满负荷。等待正在做的事，或改派其他支持者。');
   n.contracts[need.id]={person:person.id,status:'asking',progress:0};n.focus=need.id;note(n,'请求已发出，等待对方确认；不是把任务直接丢给别人。');
  }
  if(type==='confirm'&&n.contracts[v]?.status==='reply'){n.contracts[v].status='working';n.contracts[v].progress=0;if(!n.confirmed.includes(v))n.confirmed.push(v);event(n,'confirm-'+v,'具体范围和联络方式已双方确认，支持开始落实。');}
  if(type==='cancel'&&n.contracts[v]&&n.contracts[v].status!=='done'){delete n.contracts[v];note(n,'这个请求已撤回，完成的支持会保留。');}
  if(n.done.length===requests.length&&n.disrupted){n.complete=true;note(n,'这张支持网经受了变化。每件事都有愿意接手的人，爸爸也有边界。');}
 }
 return n;
}
const shiftPlaces=[{x:190,y:225},{x:430,y:225},{x:760,y:250},{x:420,y:415},{x:180,y:440}];
function stepToward(p,t,amount){const d=Math.hypot(t.x-p.x,t.y-p.y);if(d<=amount)return {...p,x:t.x,y:t.y};return {...p,x:p.x+(t.x-p.x)/d*amount,y:p.y+(t.y-p.y)/d*amount};}
function tick(s,dt){if(s.complete)return s;const n=copy(s);dt=clamp(dt,0,.2);n.time+=dt;
 if(n.id==='shifts'){
  if(n.time>=25&&!n.delay){n.delay=true;event(n,'delay','帮手：路上耽搁了，我会晚到一会儿。先别把休息建立在“应该已到”的假设上。');}
  if(n.time>=42&&!n.helperArrived){n.helperArrived=true;event(n,'arrival','帮手到门口了。重新确认责任，再让她接过陪伴。');}
  if(n.done.includes('cover')&&!n.actors.helper.job)Object.assign(n.actors.helper,stepToward(n.actors.helper,shiftPlaces[3],dt*100));
  for(const [who,a] of Object.entries(n.actors)){if(!a.job)continue;const job=shiftJobs.find(j=>j.id===a.job);if(who==='helper'&&!n.recovered)continue;if(job.id==='rest'&&(!n.done.includes('cover')||n.actors.helper.job||Math.hypot(n.actors.helper.x-shiftPlaces[3].x,n.actors.helper.y-shiftPlaces[3].y)>1))continue;Object.assign(a,stepToward(a,shiftPlaces[job.station],dt*100));if(Math.hypot(a.x-shiftPlaces[job.station].x,a.y-shiftPlaces[job.station].y)>1)continue;a.progress+=dt;if(a.progress>=job.duration){n.done.push(job.id);a.job=null;a.progress=0;event(n,'job-'+job.id,job.name+'完成了。');}}
  if(n.done.length===6){n.complete=true;note(n,'休息有了真实接班，回来时也听清了新情况。');}
 }
 if(n.id==='soothe'){
  if(n.target){n.player=stepToward(n.player,n.target,dt*120);if(Math.hypot(n.player.x-n.target.x,n.player.y-n.target.y)<1)n.target=null;}
  if(n.phase===3&&n.holding&&n.baby==='cot'){n.steady+=dt;if(n.steady>=8){n.phase=4;n.holding=false;event(n,'pause','你把短暂暂停留给了自己，不把烦躁变成对宝宝的动作。');}}
  if(n.help)n.wait+=dt;
 }
 if(n.id==='visitors'){
  if(n.holding&&n.active){n.talk=Math.min(3,n.talk+dt);if(n.talk>=3)n.holding=false;}
  for(const id of n.inside){n.guestPositions[id]=Math.min(1,(n.guestPositions[id]||0)+dt/8);if(n.guestPositions[id]>=1&&id==='cleaner'&&!n.handled.includes(id)){n.handled.push(id);if(n.active===id)n.active=null;event(n,'helper','家务帮手到了约好的区域，没有穿过卧室。');}}
  if(n.handled.length===6)n.complete=true;
 }
 if(n.id==='signal'){
  if(n.speaking&&n.called){n.voice+=dt;if(n.voice>=3){if(!n.sent.includes(n.speaking))n.sent.push(n.speaking);event(n,'say-'+n.speaking,'这条已知事实已传达；不知道的情况留给医护评估。');n.speaking=null;n.voice=0;}}
  if(n.dispatched&&!n.teamHere){const at=Math.floor(n.crew);if(!(n.obstacle&&n.route[at+1]===34)&&!(at>=n.route.length-2&&!n.door)){n.crew=Math.min(n.route.length-1,n.crew+dt*.7);if(n.crew>=n.route.length-1){n.teamHere=true;event(n,'team','模拟支援人员到了家门。你仍保持联络，交接目前情况。');}}}
 }
 if(n.id==='network'){
  if(n.time>=24&&!n.disrupted){n.disrupted=true;for(const [k,c] of Object.entries(n.contracts))if(c.person==='friend'&&c.status!=='done')delete n.contracts[k];event(n,'disruption','朋友：今天临时有事，未完成的帮忙需要改派。已经落实的支持不会被撤销。');}
  for(const [id,c]of Object.entries(n.contracts)){if(c.status==='reply'||c.status==='done')continue;c.progress+=dt;if(c.status==='asking'&&c.progress>=5){c.status='reply';c.progress=0;note(n,supporters.find(p=>p.id===c.person).name+'回复了：请确认具体范围，再开始。');}else if(c.status==='working'&&c.progress>=requests.find(r=>r.id===id).duration){c.status='done';if(!n.done.includes(id))n.done.push(id);event(n,'support-'+id,requests.find(r=>r.id===id).name+'已落实。专业支持指预约和联络确认，不表示问题已治愈。');}}
  if(n.done.length===7&&n.disrupted)n.complete=true;
 }
 return n;
}
function valid(s,id){
 if(!s||s.version!==2||s.id!==id||!ids.includes(id)||!Number.isFinite(s.time)||s.time<0||s.time>1e7||typeof s.complete!=='boolean'||typeof s.message!=='string'||!Array.isArray(s.events)||s.events.length>100||!s.events.every(x=>typeof x==='string'))return false;
 const num=(x,a,b)=>Number.isFinite(x)&&x>=a&&x<=b,arr=(a,allowed)=>Array.isArray(a)&&new Set(a).size===a.length&&a.every(x=>allowed.includes(x)),bool=(...keys)=>keys.every(k=>typeof s[k]==='boolean');
 if(id==='shifts')return arr(s.done,shiftJobs.map(j=>j.id))&&bool('helperArrived','delay','recovered')&&['dad','helper'].every(k=>{const a=s.actors?.[k];return a&&num(a.x,0,960)&&num(a.y,0,560)&&(a.job===null||shiftJobs.some(j=>j.id===a.job&&j.who.includes(k)))&&num(a.progress,0,40);})&&(!s.complete||s.done.length===6);
 if(id==='soothe')return Number.isInteger(s.phase)&&num(s.phase,0,5)&&num(s.player?.x,80,880)&&num(s.player?.y,180,510)&&num(s.light,0,100)&&Array.isArray(s.sources)&&s.sources.length===3&&s.sources.every(p=>['tv','phone','speaker'].includes(p.id)&&num(p.x,80,880)&&num(p.y,170,510))&&new Set(s.sources.map(p=>p.id)).size===3&&arr(s.observed,['needs','comfort','support'])&&['arms','cot'].includes(s.baby)&&num(s.steady,0,9)&&num(s.wait,0,1e7)&&bool('holding','help')&&(s.phase<3||s.baby==='cot')&&(!s.complete||s.phase===5);
 if(id==='visitors')return num(s.door,0,100)&&num(s.screen,0,100)&&(s.active===null||visitors.some(p=>p.id===s.active))&&num(s.talk,0,3)&&bool('holding')&&num(s.appointment,9,20)&&arr(s.parcels,['parcel','friend'])&&arr(s.handled,visitors.map(v=>v.id))&&arr(s.inside,['cleaner','cover'])&&s.guestPositions&&Object.entries(s.guestPositions).every(([k,v])=>s.inside.includes(k)&&num(v,0,1))&&Number.isInteger(s.handoff)&&num(s.handoff,0,3)&&(!s.complete||s.handled.length===6);
 if(id==='signal'){if(!bool('called','dispatched','obstacle','door','backup','records','teamHere')||!arr(s.observed,facts.map(f=>f.id))||!arr(s.sent,s.observed)||!(s.speaking===null||s.observed.includes(s.speaking))||!num(s.voice,0,3)||!num(s.crew,0,59)||!num(s.callTime,0,s.time)||!Array.isArray(s.route)||s.route[0]!==grid.start||s.route.length>60||new Set(s.route).size!==s.route.length)return false;return s.route.every((v,i)=>Number.isInteger(v)&&num(v,0,59)&&!grid.blocked.includes(v)&&(!i||Math.abs(v-s.route[i-1])===10||Math.abs(v-s.route[i-1])===1&&Math.floor(v/10)===Math.floor(s.route[i-1]/10)))&&s.crew<=s.route.length-1&&(!s.sent.length||s.called)&&(!s.teamHere||(s.dispatched&&s.crew===s.route.length-1&&s.door))&&(!s.dispatched||(s.called&&s.route.at(-1)===grid.end))&&(!s.complete||(s.teamHere&&s.sent.length===4&&s.backup&&s.records));}
 if(!bool('disrupted','consent')||!arr(s.done,requests.map(r=>r.id))||!arr(s.confirmed,requests.map(r=>r.id))||!s.contracts||typeof s.contracts!=='object'||Array.isArray(s.contracts))return false;
 const counts={};for(const[k,c]of Object.entries(s.contracts)){const r=requests.find(x=>x.id===k),p=supporters.find(x=>x.id===c?.person);if(!c||!r||!p||!p.skills.includes(r.skill)||!['asking','reply','working','done'].includes(c.status)||!num(c.progress,0,40))return false;if(c.status!=='done')counts[p.id]=(counts[p.id]||0)+1;}
 return supporters.every(p=>(counts[p.id]||0)<=p.cap)&&s.done.every(k=>s.contracts[k]?.status==='done')&&(!s.complete||(s.done.length===7&&s.disrupted));
}
function restore(raw,id){if(!valid(raw,id))return initial(id);const n=copy(raw);if(id==='soothe'){n.holding=false;n.target=null;}if(id==='visitors')n.holding=false;if(id==='signal'){n.speaking=null;n.voice=0;}return n;}
window.RecoveryGames={ids,initial,act,tick,valid,restore,shiftJobs,shiftPlaces,requests,supporters,visitors,grid,facts};
})();
