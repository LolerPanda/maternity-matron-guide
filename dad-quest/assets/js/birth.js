(() => {'use strict';
const G=window.BirthJourney,K=window.BirthKeepsake,$=id=>document.getElementById(id),canvas=$('scene'),music=new NightMusic(),key='dad-birth-journey-v1',photoKey='dad-birth-photo-v1';let s=G.initial(),paused=true,last=0,saveClock=0,drag=null,target=null,route=[],keys=new Set(),musicOn=true,renderedStage=-1,lastSpeech='',lastFeedback='',photoCard=null,photoNotice='',photoError='';music.setEnabled(true);
try{const old=JSON.parse(localStorage.getItem(key));s=G.restore(old)||s;}catch{}
try{const card=JSON.parse(localStorage.getItem(photoKey));if(K.matches(card,s.photo))photoCard=card;}catch{}
const details=[
 '陪伴者的存在、隐私与被尊重的感受都很重要。她可以随时改变希望你做什么；医护需要操作时，仍应保留合适的照明和通道。',
 '灯光与噪声是爸爸能接手的小事。不是所有环境都能随意调整，先询问她，也听现场工作人员安排。',
 '需要支持不等于始终需要触碰。她说“停一下”时，松手和安静同样是陪伴；不需要用连点证明认真。',
 '接下来的评估和分娩照护由专业团队进行。爸爸清理随身物品与空间，不触碰器械、不代替医护操作。',
 '不同的人需要不同体位与陪伴方式。在现场允许的地方站好，让她看见你，也让医护能顺利接近她。',
 '分娩配合取决于本人感受和医护的当下指导。这里没有可以照搬到现实的用力次数、屏气长度或呼吸节奏。',
 '这一幕是温和、非写实的出生叙事。宝宝出生后，医护还需照顾宝宝与妈妈；是否哭、如何处理脐带等不作为玩家得分项目。',
 '医护先评估并安排母婴照护。情况允许、妈妈愿意时，可在医护协助下开始肌肤接触；如果需要等待，也不代表陪伴失败。',
 '接触期间仍要观察母婴。画面中的毯子位置只是陪伴互动，不能据此判断真实安全状态；任何担忧都应立即告诉工作人员。',
 '宝宝出生之后，还有胎盘娩出和对妈妈的后续评估等照护。核对腕带是协助工作人员，不代替医院自己的身份核验。',
 '注意力不只属于宝宝。妈妈提出不适时，及时找医护；喂养可以寻求支持，不设必须立刻完成含接的任务或倒计时。',
 '出生不意味着立刻离开产房或结束观察。听清谁负责照护、如何呼叫和下一步安排，让后续交接继续清楚。'
];
function save(){try{localStorage.setItem(key,JSON.stringify({...s,held:false}));$('save-status').textContent='已保存在当前浏览器';}catch{$('save-status').textContent='浏览器未允许保存；保持本页可继续';}}
function stopWalking(){keys.clear();target=null;route=[];}
function endDrag(e){if(!drag||(e&&e.pointerId!==drag.id))return;const id=drag.id;drag=null;if(canvas.hasPointerCapture?.(id))canvas.releasePointerCapture(id);stopWalking();}
function walkTo(p){p={x:Math.max(45,Math.min(900,p.x)),y:Math.max(185,Math.min(510,p.y))};if(p.x>380&&p.x<660&&p.y<415)p.x=p.x<520?350:700;const crosses=(s.player.x<380&&p.x>380)||(s.player.x>660&&p.x<660);route=crosses?[{x:s.player.x,y:480},{x:p.x,y:480},p]:[p];target=route.shift();}
function set(type,value){if(['phone','frame'].includes(type))photoError='';if(['chair','phone','cuddle'].includes(type))stopWalking();s=G.act(s,type,value);hud();}
function modal(title,body,label,fn){paused=true;endDrag();stopWalking();s=G.act(G.act(s,'hand',false),'cuddle',false);music.setPlaying(false);$('dialog-content').innerHTML=`<h2>${title}</h2><p>${body}</p><div class="actions"><button class="primary" id="resume">${label}</button><a href="series.html">成长地图</a></div>`;if(!$('dialog').open)$('dialog').showModal();$('resume').onclick=()=>{if(fn)fn();$('dialog').close();paused=false;last=performance.now();music.setPlaying(musicOn);canvas.focus({preventScroll:true});document.querySelector('.game').scrollIntoView({block:'start'});};save();}
function pause(){if(!paused)modal('先歇一会儿。','剧情、动作和等待都已暂停。回来后从这一刻继续。','继续陪伴');}
function restart(){endDrag();stopWalking();s=G.initial();photoCard=null;photoNotice='';photoError='';try{localStorage.removeItem(photoKey);}catch{}renderedStage=-1;lastSpeech='';lastFeedback='';showCard($('keepsake'));hud();save();}
function finish(){try{localStorage.setItem('dad-birth-complete','true');}catch{}paused=true;music.setPlaying(false);$('dialog-content').innerHTML='<h2>你好，小小的你。</h2><p>你见证了这次出生，也继续看见了需要照顾的她。从倾听到让出空间，从等待到及时求助，你陪着走完了这一段。</p><p>故事里的平安来自设定，不是游戏成绩；现实中每一次分娩都可能有不同的过程和安排。</p><div class="actions"><a class="primary" href="adventure.html?chapter=handover">继续 · 住院与出院交接 →</a><button id="again">再体验一次</button><a href="series.html">回成长地图</a></div>'+(photoCard?'<div id="final-photo"></div>':'');if(photoCard)showCard($('final-photo'));if(!$('dialog').open)$('dialog').showModal();$('again').onclick=()=>{restart();$('dialog').close();paused=false;music.setPlaying(musicOn);};save();}
function speech(){if(s.stage===2)return s.hand<4?'她：“握着我的手，安静陪我一会儿。”':'她：“现在先松开吧，我想自己缓一缓。你留在这里就好。”';
 if(s.stage===5)return s.elapsed<4?'助产士：“接下来的配合，我会直接和她沟通。”':s.elapsed<8?'她：“我想要你在床头安静陪着，有问题帮我问清楚。”':'你：“我在这里。你想调整，我们随时告诉她们。”';
 if(s.stage===6)return s.born?'宝宝来到这个房间。助产士先为宝宝保暖和评估，妈妈仍在接受照护。':s.cuddle?'她轻轻靠向你，你们额头相贴。你留在床头，医护继续照护。':s.elapsed<8?'她：“帮我记下宝宝出生的这一刻吧。也想和你额头靠一靠。”':s.elapsed<17?'助产士不断与她沟通。你留出空间，只在她需要时回应。':'医护在床旁迎接宝宝。你可以留在床头陪伴，也可以打开手机准备记录。';
 if(s.stage===7)return s.elapsed<8?'助产士正在评估与安置宝宝，也在留意妈妈的情况。你留在旁边等待。':s.contact?'在医护协助下，宝宝来到妈妈胸前。你们第一次这样近地看见彼此。':'助产士：“现在可以在我们的协助下开始接触。” 她：“我愿意，陪着我们吧。”';
 if(s.stage===10&&s.called)return s.elapsed<8?'呼叫已收到。医护正在回应，你留在她身边，不自行判断不适原因。':'助产士回到床边了解不适并继续评估，也记下了她希望获得喂养支持的需求。';return G.moments[s.stage].speech;}
function tools(){const kind=G.moments[s.stage].kind;let html='';if(['privacy','light','blanket'].includes(kind)){const id={privacy:'curtain',light:'light',blanket:'blanket'}[kind];html=`<label>${{privacy:'隐私帘',light:'陪伴灯',blanket:'毯子位置'}[kind]}<input id="adjust" type="range" min="0" max="100" value="${s[id]}" aria-label="${id==='blanket'?'调整毯子覆盖位置':id==='light'?'调节陪伴灯亮度':'拉上隐私帘'}"><output id="value">${s[id]}</output></label>`;}
 if(kind==='hand'||kind==='witness')html='<button id="head">走到床头</button><button id="hold">按住握手陪伴</button><button id="toggle-hold">轻触握手 / 松开</button><progress id="respond" max="7" value="0" aria-label="陪伴回应进度"></progress>';
 if(kind==='chair')html='<button data-chair="left" aria-label="椅子向左">← 椅子</button><button data-chair="right" aria-label="椅子向右">椅子 →</button><button data-chair="up" aria-label="椅子向上">↑</button><button data-chair="down" aria-label="椅子向下">↓</button>';
 if(kind==='position'||kind==='record')html=(kind==='record'?'<button id="record">收好出生与后续照护记录</button>':'')+'<button id="head">走到床头</button>';
 if(kind==='brief')html='<progress id="listen" max="12" value="0" aria-label="医护交代进度"></progress><span>听她说完，也给自己一点安静。</span>';
 if(kind==='contact')html='<button id="contact">由医护协助，陪她开始接触</button>';
 if(['witness','contact'].includes(kind))html+='<button id="cuddle" aria-pressed="false">头贴头陪伴</button><button id="phone-toggle" aria-expanded="false">打开手机 · 记录出生</button>'+(kind==='contact'?'<button id="head">走到床头</button>':'')+'<section id="phone-panel" class="phone-panel" hidden aria-label="游戏手机"><div class="phone-heading"><strong>这一刻，留给我们</strong><span>游戏手机</span></div><p>她愿意留下纪念。把时间标记移进浅色取景框，宝宝出生后按下截屏。</p><div class="phone-view"><div class="frame-guide"></div><span id="frame-marker">时刻</span><div class="phone-clock"><small>本局剧情出生时刻 · 设备本地时间</small><strong id="phone-clock"></strong></div></div><label>调整取景<input id="phone-frame" type="range" min="0" max="100" value="'+s.phoneFrame+'" aria-label="调整手机取景"></label><p id="phone-status" role="status"></p><button id="shutter">截屏记录出生时刻</button><small class="phone-note">只截取游戏画面，可以重拍，也可直接继续陪伴。</small></section>';
 if(kind==='bands')html='<button class="band" id="mother">翻看妈妈腕带</button><button class="band" id="baby">翻看宝宝腕带</button><button id="confirm">请护士确认一致</button>';
 if(kind==='help')html='<button id="call">按呼叫铃 · 说明她的新需要</button>';
 $('tools').innerHTML=html;
 if($('adjust'))$('adjust').oninput=e=>{const id={privacy:'curtain',light:'light',blanket:'blanket'}[kind];set(id,e.target.value);$('value').value=e.target.value;};
 if($('hold')){const b=$('hold');b.onpointerdown=e=>{if(paused)return;e.preventDefault();b.setPointerCapture(e.pointerId);set('hand',true);};for(const e of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(e,()=>set('hand',false));b.onkeydown=e=>{if(e.code==='Space'){e.preventDefault();if(!paused)set('hand',true);}};b.onkeyup=e=>{if(e.code==='Space')set('hand',false);};b.onblur=()=>set('hand',false);}
 document.querySelectorAll('[data-chair]').forEach(b=>b.onclick=()=>{const d={left:[-35,0],right:[35,0],up:[0,-25],down:[0,25]}[b.dataset.chair];set('chair',{x:s.chair.x+d[0],y:s.chair.y+d[1]});});
 if($('cuddle'))$('cuddle').onclick=()=>set('cuddle',!s.cuddle);
 if($('phone-toggle'))$('phone-toggle').onclick=()=>set('phone',!s.phoneOpen);
 if($('phone-frame'))$('phone-frame').oninput=e=>set('frame',e.target.value);
 if($('shutter'))$('shutter').onclick=takePhoto;
 if($('toggle-hold'))$('toggle-hold').onclick=()=>set('hand',!s.held);
 if($('head'))$('head').onclick=()=>{walkTo({x:350,y:230});};if($('record'))$('record').onclick=()=>{if(Math.hypot(s.player.x-760,s.player.y-435)<65)set('record');else walkTo({x:760,y:435});};if($('contact'))$('contact').onclick=()=>set('contact');if($('call'))$('call').onclick=()=>set('call');for(const id of ['mother','baby'])if($(id))$(id).onclick=()=>set('band',id);if($('confirm'))$('confirm').onclick=()=>set('confirm');
}
function phoneHud(){
 if(!$('phone-panel'))return;
 const aligned=s.phoneFrame>=45&&s.phoneFrame<=65;
 $('cuddle').disabled=!G.nearHead(s);$('cuddle').textContent=s.cuddle?'轻轻分开 · 结束头贴头':G.nearHead(s)?'她愿意 · 头贴头陪伴':'先走到床头，再头贴头';$('cuddle').setAttribute('aria-pressed',String(s.cuddle));
 $('phone-toggle').textContent=s.phoneOpen?'收起手机，回到陪伴':s.photo?'打开手机 · 重拍纪念':'打开手机 · 记录出生';$('phone-toggle').setAttribute('aria-expanded',String(s.phoneOpen));$('phone-panel').hidden=!s.phoneOpen;
 $('frame-marker').style.left=s.phoneFrame+'%';$('frame-marker').classList.toggle('aligned',aligned);
 $('phone-clock').textContent=s.born?K.format(s.birthStamp):'等待宝宝出生…';
 const message=photoError||(s.born&&s.birthStamp===null?'这份旧进度没有保存出生时刻。可重新体验来记录，或继续当前故事。':!aligned?'把“时刻”标记移入浅色框（45–65），左右键也可微调。':!s.born?'取景已对准，等待宝宝出生。无需抢拍，出生时刻会自动记住。':s.photo?'纪念截图已拍下；重拍会保留同一个出生时刻。':'取景已对准，出生时刻已固定。现在可以截屏。');
 if($('phone-status').textContent!==message)$('phone-status').textContent=message;
 $('shutter').disabled=!s.born||s.birthStamp===null||!aligned;$('shutter').textContent=s.photo?'重新截屏 · 保留出生时刻':'截屏记录出生时刻';
}
function showCard(container){
 if(!container)return;container.hidden=!s.photo;
 if(!s.photo){container.innerHTML='';return;}
 container.innerHTML='<h3>我们的第一张纪念截图</h3><p>本局剧情出生时刻：'+K.format(s.birthStamp)+'</p>'+(photoCard?'<img alt="游戏出生纪念图，附本局出生时刻"><a class="photo-download" download="迎接你-出生纪念.png">保存纪念截图 PNG ↓</a>':'<p>出生时刻仍在，图片未能保存在此浏览器。可在出生环节重新截屏。</p>')+'<p class="photo-notice"></p>';
 if(photoCard){container.querySelector('img').src=photoCard.image;container.querySelector('a').href=photoCard.image;}
 container.querySelector('.photo-notice').textContent=photoNotice||'游戏纪念，不是真实医疗记录。图片只保存在当前设备。';
}
function takePhoto(){
 if(paused)return;photoError='';const next=G.act(s,'capture',Math.max(Date.now(),s.birthStamp||0));if(next.photo===s.photo)return;
 try{BirthScene.draw(canvas,next,next.time);const card=K.capture(canvas,next.photo);s=next;photoCard=card;photoNotice='已生成纪念截图，可以保存到设备。';try{localStorage.setItem(photoKey,JSON.stringify(card));}catch{photoNotice='浏览器空间不足或禁止保存图片；请现在点击下方按钮保存到设备。';}save();showCard($('keepsake'));hud();}catch{photoError='暂时无法生成图片，请再试一次；出生时刻仍会保留。';phoneHud();}
}
function hud(){const m=G.moments[s.stage];if(renderedStage!==s.stage){renderedStage=s.stage;tools();$('phase').textContent=m.phase;$('counter').textContent=String(s.stage+1).padStart(2,'0')+' / 12';$('moment-title').textContent=m.title;$('tip').textContent=m.tip;$('detail').textContent=details[s.stage];$('chapters').innerHTML=['留一盏温柔的灯','陪伴也会改变','给医护留出空间','一起迎接宝宝','第一次近距离见面','妈妈也仍需要照顾'].map((t,i)=>`<li class="${Math.floor(s.stage/2)===i?'active':s.stage/2>i?'done':''}">${t}</li>`).join('');}
 const sp=speech();if(lastSpeech!==sp){$('speech').textContent=sp;lastSpeech=sp;}
 let feedback=G.ready(s)?'这一刻已完成，准备好后再继续。':'可以慢慢来，没有操作倒计时。';
 if(s.stage===2)feedback=s.hand<4?(G.nearHead(s)?'先回应握手需求。':'先走到床头，再握手陪伴。'):s.held?'她想休息了，松开手，安静留在旁边。':'留出一小段安静，不需要继续按。';
 if(s.stage===8)feedback=s.blanket>70?'毯子太靠近脸了，向下调整，让脸部露出。':s.blanket<45?'在医护示意下，把毯子调整到身体位置。':'身体盖好，脸部露出。工作人员继续在旁观察。';
 if(s.stage===9)feedback=s.confirmed?'护士：“两条腕带信息一致，我们也已完成核对。”':s.read.length===2?'两条腕带都显示虚构配对编号 A-0618。请护士共同确认。':'翻看腕带上属于这对母婴的配对编号。';
 if(s.stage===11&&s.recorded)feedback='已记录：本局出生时刻（'+K.format(s.birthStamp)+'）、母婴配对编号 A-0618、继续观察与呼叫方式、喂养支持需求。回到床头陪她。';
 if(lastFeedback!==feedback){$('feedback').textContent=feedback;lastFeedback=feedback;}
 $('next').disabled=!G.ready(s);$('next').textContent=s.stage===11?'留在她们身边 · 完成本篇':'准备好了，继续 →';
 phoneHud();
 if($('hold')){$('toggle-hold').textContent=s.held?'轻触松开':'轻触握手';$('hold').classList.toggle('holding',s.held);$('hold').textContent=s.held?'正握着她的手 · 松开即停止':'按住握手陪伴';$('respond').value=s.stage===2?s.hand+s.rest:s.witness*7;}
 if($('record')){$('record').textContent=s.recorded?'记录已收好':Math.hypot(s.player.x-760,s.player.y-435)<65?'收好出生与后续照护记录':'走到记录台';$('record').disabled=s.recorded;}
 if($('listen'))$('listen').value=s.elapsed;if($('contact'))$('contact').disabled=s.elapsed<8||s.contact;if($('confirm'))$('confirm').disabled=s.read.length<2||s.confirmed;if($('call')){$('call').disabled=s.called;$('call').textContent=s.called?'医护已收到呼叫':'按呼叫铃 · 说明她的新需要';}for(const id of ['mother','baby'])if($(id)&&s.read.includes(id))$(id).textContent=(id==='mother'?'妈妈':'宝宝')+'腕带 · A-0618';
}
$('next').onclick=()=>{if(paused)return;endDrag();stopWalking();s=G.next(s);if(s.stage===2)walkTo({x:350,y:230});save();if(s.complete)finish();else hud();};$('pause').onclick=pause;$('restart').onclick=()=>{modal('重新体验这一程？','会重新开始本篇的 12 个时刻，其他章节进度不受影响。','重新开始',restart);const cancel=document.createElement('button');cancel.textContent='取消，继续当前进度';cancel.onclick=()=>{$('dialog').close();if(s.complete)finish();else{paused=false;last=performance.now();music.setPlaying(musicOn);}};$('dialog-content').querySelector('.actions').append(cancel);};$('music').onclick=()=>{musicOn=!musicOn;music.setEnabled(musicOn);music.setPlaying(musicOn&&!paused);$('music').textContent=musicOn?'配乐：开':'配乐：关';$('music').setAttribute('aria-pressed',String(musicOn));};
music.onUnavailable=()=>{musicOn=false;$('music').textContent='配乐不可用';$('music').setAttribute('aria-pressed','false');};
const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*960/r.width,y:(e.clientY-r.top)*560/r.height};};
canvas.onpointerdown=e=>{if(paused||drag)return;canvas.focus({preventScroll:true});const p=point(e);
 if(s.stage===3){e.preventDefault();stopWalking();if(Math.hypot(p.x-s.chair.x,p.y-s.chair.y)<65){drag={id:e.pointerId,dx:p.x-s.chair.x,dy:p.y-s.chair.y};canvas.setPointerCapture(e.pointerId);}return;}
 walkTo(p);
};
canvas.onpointermove=e=>{if(drag&&!paused&&e.pointerId===drag.id){const p=point(e);set('chair',{x:p.x-drag.dx,y:p.y-drag.dy});}};
for(const e of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(e,endDrag);
const directions={ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0],ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1]};
window.addEventListener('keydown',e=>{if(paused||e.target!==canvas)return;if(directions[e.key]){e.preventDefault();if(s.stage===3){if(!drag){const [x,y]=directions[e.key];set('chair',{x:s.chair.x+x*15,y:s.chair.y+y*15});}return;}keys.add(e.key);target=null;route=[];}if(e.code==='Space'&&[2,6].includes(s.stage)){e.preventDefault();set('hand',true);}});window.addEventListener('keyup',e=>{keys.delete(e.key);if(e.code==='Space')set('hand',false);});window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',save);$('dialog').addEventListener('cancel',e=>e.preventDefault());
function frame(now){const dt=Math.min(.05,(now-last)/1000||0);last=now;if(!paused&&!s.complete){s=G.tick(s,dt,Date.now());let dx=0,dy=0;for(const k of keys){dx+=directions[k][0];dy+=directions[k][1];}if(target&&!keys.size){dx=target.x-s.player.x;dy=target.y-s.player.y;if(Math.hypot(dx,dy)<5){target=route.shift()||null;dx=dy=0;}}const len=Math.hypot(dx,dy);if(len&&!drag&&s.stage!==3)s=G.act(s,'move',{x:s.player.x+dx/len*130*dt,y:s.player.y+dy/len*130*dt});saveClock+=dt;if(saveClock>2){save();saveClock=0;}hud();}BirthScene.draw(canvas,s,paused?s.time:now/1000);requestAnimationFrame(frame);}
showCard($('keepsake'));hud();if(s.complete)finish();else modal(s.stage?'你们的故事，接着走。':'这一次，不跳过初次见面。','从待产末段到宝宝出生，再到母婴继续接受照护。你可以调节、拖动物品、走到床头、回应需求，见证一个温和呈现的出生故事。没有抢时间，也没有操作失误造成伤害。',s.stage?'继续陪伴':'走进分娩室');requestAnimationFrame(frame);
})();
