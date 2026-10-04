(() => {
'use strict';
const D=window.Departure,$=id=>document.getElementById(id),storageKey='dad-departure-v2';
let s=D.initial(),storageOK=true;
try{const loaded=JSON.parse(localStorage.getItem(storageKey));if(D.valid(loaded))s=loaded;}catch{}
let leg=null,auto=false,last=0,musicOn=false;
const music=new NightMusic();music.setEnabled(false);
function save(){try{localStorage.setItem(storageKey,JSON.stringify(s));}catch{storageOK=false;}$('saved').textContent=storageOK?'已保存到当前路口。刷新或离开后，可从这里继续。':'浏览器无法保存。本次仍可游玩，关闭后进度可能丢失。';}
const name=(id,stage=s.stage)=>(stage==='city'?D.city:D.campus).nodes.find(n=>n[0]===id)?.[1]||id;
function say(text){$('feedback').textContent=text;}
function radio(){const entries=['医护已安排本次到院；先确认接待地点。你负责导航，同行司机负责开车。'];if(s.contact)entries.push('已确认：前往医院落客区，下车后查找夜间接待指引。');if(s.news)entries.push('路况更新：河桥—北路口封闭；环路—东路口缓行 +3 分钟。');if(s.arrival)entries.push('院区更新：A 门夜间关闭。带着行李推车，先去服务台；尽量利用遮雨连廊。');if(s.directions)entries.push('服务台确认：产科接待在楼上，沿指引乘电梯。中厅直连的通道是楼梯，推车无法通行。');$('radio-log').innerHTML=entries.map(e=>`<li>${e}</li>`).join('');}
function render(){
 if(s.stage==='done'){complete();return;}
 const campus=s.stage==='campus',m=D.map(s),end=s.plan.at(-1)||s.at,planned=[s.at,...s.plan];
 $('phase').textContent=campus?'02 / 雨夜院区':'01 / 城市出发';$('position').textContent='当前位置 · '+name(s.at);$('elapsed').textContent=s.minutes;$('weather').textContent=campus?'夜间 · 院区步行':s.news?'持续降雨 · 路况已变化':'傍晚 · 小雨';
 document.querySelector('.map-wrap').classList.toggle('campus',campus);
 $('roads').innerHTML=m.edges.map(e=>{const a=m.nodes.find(n=>n[0]===e[0]),b=m.nodes.find(n=>n[0]===e[1]),blocked=D.blocked(s,e),selected=planned.some((n,i)=>i&&((planned[i-1]===e[0]&&n===e[1])||(planned[i-1]===e[1]&&n===e[0])));return `<line x1="${a[2]}" y1="${a[3]}" x2="${b[2]}" y2="${b[3]}" class="${blocked?'blocked':selected?'planned':e[3]==='rain'?'rain':''}"/><text x="${(a[2]+b[2])/2}" y="${(a[3]+b[3])/2-1}" text-anchor="middle">${blocked?'×':D.cost(s,e)}</text>`;}).join('');
 $('places').innerHTML=m.nodes.map(n=>{const e=D.edge(s,end,n[0]),available=e&&!D.blocked(s,e),number=s.plan.indexOf(n[0]),unknown=campus&&!s.directions&&['lift','unit'].includes(n[0]);return `<button data-place="${n[0]}" class="place ${n[0]===s.at?'current':number>=0?'planned':available?'available':''} ${unknown||n[0]==='a'?'unavailable':''}" style="left:${n[2]}%;top:${n[3]}%" ${leg?'disabled':''}>${unknown?'待确认':n[1]}<small>${n[0]===s.at?'● 你在这里':number>=0?'路线 '+(number+1):unknown?'服务台问询':available?'○ 可接续':''}</small></button>`;}).join('');
 $('places').querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>{const result=D.append(s,b.dataset.place);if(result.error){say(result.error+'。');return;}s=result.state;save();render();say('路线已延伸。可继续规划，或按路线行进；撤回不会扣分。');});
 const at=m.nodes.find(n=>n[0]===s.at);$('traveler').textContent=campus?'🧑‍🤝‍🧑':'🚕';$('traveler').style.left=at[2]+'%';$('traveler').style.top=at[3]+'%';
 const p=D.preview(s);$('estimate').textContent=s.plan.length?`本段 ${p.minutes} 模拟分钟${campus?' · 露天 '+p.rain+' 分钟':''}`:'选择相邻地点，规划一段或整条路线';$('itinerary').textContent=planned.map(n=>name(n)).join(' → ');
 $('go').disabled=!s.plan.length||!s.contact;$('go').textContent=leg?(auto?'下一路口停下':'将在下一路口停下'):'按规划出发';$('undo').disabled=!s.plan.length||!!leg;$('clear').disabled=!s.plan.length||!!leg;
 $('contact').hidden=s.contact;$('directions').hidden=!(campus&&s.at==='desk'&&!s.directions);
 $('objective').textContent=!s.contact?'出发前，确认接待安排':campus?(s.directions?'沿指引乘电梯抵达产科':'到服务台确认夜间接待位置'):s.news?'根据最新路况重新规划':'连起一条前往医院的路线';
 $('instructions').textContent=!s.contact?'本次已由医护安排到院。确认接待信息后，在地图上逐点规划路线，再按“出发”。':campus?'数字表示步行时间。蓝色是露天通道，连廊可遮雨。带着推车不能走楼梯；抵达服务台后，点击确认接待位置。':'先点击与路线末端相连的地点，地图会预览总用时。出发后车辆沿路线移动；广播出现变化时会停在路口，留给你重新规划的时间。';
 $('road-ledger').textContent=campus?'院区路况：A 门关闭 · 蓝色路段露天 · 推车不能走楼梯 · 未确认楼层时先去服务台':s.news?'交通广播：河桥—北路口关闭；环路—东路口由 5 分钟变为 8 分钟。对比绕行路线再出发。':'路段上的数字是模拟分钟。可规划整条路线，车辆到路口时还可能收到新的路况。';
 radio();
}
function startLeg(){
 if(!auto||!s.plan.length||s.stage==='done'){auto=false;leg=null;render();return;}
 const e=D.edge(s,s.at,s.plan[0]),error=D.blocked(s,e);if(error){auto=false;leg=null;render();say(error+'，请撤回或清空规划。');return;}
 const m=D.map(s);leg={from:m.nodes.find(n=>n[0]===s.at),to:m.nodes.find(n=>n[0]===s.plan[0]),elapsed:0,duration:1.4};render();say(s.stage==='city'?'车辆按规划行进中。你可以让司机在下一个节点暂停，重新查看路线。':'你们沿规划的通道一起前行。');
}
function frame(t){const dt=Math.min((t-last)/1000,.05);last=t;
 if(leg&&!$('modal').open&&!document.hidden){leg.elapsed+=dt;const p=Math.min(1,leg.elapsed/leg.duration),x=leg.from[2]+(leg.to[2]-leg.from[2])*p,y=leg.from[3]+(leg.to[3]-leg.from[3])*p;$('traveler').style.left=x+'%';$('traveler').style.top=y+'%';$('travel-progress').style.width=p*100+'%';if(p===1){const result=D.advance(s);leg=null;$('travel-progress').style.width='0';if(result.error){auto=false;say(result.error);}else{s=result.state;save();if(result.event||!s.plan.length)auto=false;render();if(result.event)say(result.event);else if(!auto)say('已抵达 '+name(s.at)+'。可以继续规划。');if(auto)startLeg();}}}
 requestAnimationFrame(frame);
}
$('go').onclick=()=>{if(leg){auto=false;$('go').textContent='将在下一路口停下';return;}auto=true;startLeg();};
$('undo').onclick=()=>{if(leg)return;s.plan.pop();save();render();say('已撤回最后一站。');};$('clear').onclick=()=>{if(leg)return;s.plan=[];save();render();say('规划已清空，当前位置和已完成的路程保留。');};
$('contact').onclick=()=>{s.contact=true;save();render();say('已确认本次到院安排。现在可以规划到医院落客区的路线。');};
$('directions').onclick=()=>{s.directions=true;save();render();say('接待位置已确认：由服务台前往电梯，再到产科接待。地图已补全，按指引规划最后一段。');};
function modal(title,text,restart=false){music.setPlaying(false);$('modal-content').innerHTML=`<h2>${title}</h2><p>${text}</p><div class="choice-actions"><button id="resume" class="primary">${restart?'重新出发':'继续这一程'}</button>${restart?'<button id="cancel" class="secondary">保留进度</button>':''}</div>`;$('modal').showModal();$('resume').onclick=()=>{if(restart){leg=null;auto=false;s=D.initial();document.querySelector('.departure-layout').hidden=false;$('recap').hidden=true;save();render();say('新一程开始。请先确认到院安排。');}$('modal').close();};if(restart)$('cancel').onclick=()=>$('modal').close();}
$('pause').onclick=()=>modal('暂停这一程','车辆和角色已经暂停；关闭对话框后从原位置继续。规划阶段没有时间压力。');
$('guide').onclick=()=>modal('先规划，再行进','点击与路线末端相连的地点，组成路线。数字是虚构分钟；按“出发”后角色沿线移动。路况变化会中断旧规划，请读广播再改道。到院后查看夜间入口、露天通道和电梯指引；先到服务台确认位置。可撤回、暂停或离开，不用从头重复。');
$('restart').onclick=()=>modal('重新开始？','本关进行中的路线将重置，其他章节进度不受影响。',true);
$('modal').addEventListener('close',()=>music.setPlaying(musicOn&&s.stage!=='done'&&!document.hidden));
$('music').onclick=()=>{musicOn=!musicOn;music.setEnabled(musicOn);music.setPlaying(musicOn&&s.stage!=='done');$('music').textContent='配乐：'+(musicOn?'开':'关');$('music').setAttribute('aria-pressed',String(musicOn));};
music.onUnavailable=()=>{musicOn=false;$('music').textContent='配乐暂不可用';$('music').setAttribute('aria-pressed','false');};
document.addEventListener('visibilitychange',()=>music.setPlaying(musicOn&&!document.hidden&&!$('modal').open&&s.stage!=='done'));window.addEventListener('pagehide',()=>music.setPlaying(false));
function complete(){
 leg=null;auto=false;music.setPlaying(false);DadSeries.complete('route');document.querySelector('.departure-layout').hidden=true;$('recap').hidden=false;
 const cityHistory=s.history.filter(h=>h.stage==='city'),campusHistory=s.history.filter(h=>h.stage==='campus');
 const itinerary=(h,stage)=>h.length?[h[0].from,...h.map(x=>x.to)].map(n=>name(n,stage)).join(' → '):'';
 $('recap').innerHTML=`<div class="complete-stamp"><div class="symbol">✧</div><h2>路变了，你们还是一起抵达。</h2><p>你应对了封路、缓行和夜间入口变化，找到了接待团队。</p><div class="recap-grid"><div><b>${s.minutes}</b><span>总模拟分钟 · 非真实预计</span></div><div><b>${s.history.length}</b><span>已走过的路段</span></div><div><b>${s.rain}</b><span>院区露天模拟分钟</span></div></div><div class="recap-route"><b>你实际走过的路线</b><br>${itinerary(cityHistory,'city')}<br>${itinerary(campusHistory,'campus')}</div><p>${s.rain?'你选择了较直接的露天通道。现实中可与伴侣商量，按现场条件选择。':'你利用了遮雨连廊，让院区步行保持在有遮挡的通道内。'}<br>这些记录用来回顾选择，不是照护能力或医疗结果评分。</p><div class="complete-actions"><a class="primary" href="series.html">回到成长地图</a><a class="secondary" href="labor.html">下一程 · 医院陪产</a><button class="text-button" id="again">尝试另一条路线</button></div></div>`;
 $('again').onclick=()=>modal('尝试另一条路线？','无需重玩来解锁后续内容。重新出发后，可以比较不同路线的选择。',true);
}
render();requestAnimationFrame(frame);
})();
