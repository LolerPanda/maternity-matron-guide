/* Eight independent, untimed chapters. Interaction feedback stays outside the board. */
(() => {
'use strict';
const C=window.DadSeries, $=id=>document.getElementById(id);
const id=new URLSearchParams(location.search).get('chapter');
if(id==='route'){location.replace('route.html');return;}
const meta=DAD_CHAPTERS.find(c=>c.id===id&&!c.href);
if(!meta){$('title').textContent='这一章还没有收录';$('description').textContent='请回到成长地图选择章节。';$('board').innerHTML='<a href="series.html">返回成长地图</a>';return;}
let s=C.load(id), done=false, musicOn=false;
const music=new NightMusic();music.setEnabled(false);
const hints={pack:'先选物件，可旋转，再点箱内左上角格子放下。点已放入的物件可取出。',route:'先联系产科，再点击与当前位置相连的地点。封路后可以折返或绕行。',handover:'翻阅三份资料，点选一条信息，再点下面对应的交接栏。缺失的信息先向医护补问。',shifts:'先选任务，再点成人时间表。点已安排的格子可撤回；休息必须有人同时接班。',soothe:'拖动两个滑杆布置环境，再依次完成观察、安置、暂停和支援。无需让宝宝停止哭泣。',visitors:'把来访卡片拖到合适通道，也可以直接点击通道。没有倒计时，按家庭已确认的安排处理。',signal:'先按模拟求助键。联络启动后再点选事实，归入四个栏位，传递给医护。',network:'先选左边的需求，再点右边的支持者。连线可改派；每个人有不同专长和容量。'};
$('stage').textContent=meta.stage+' / 爸爸练习生';$('title').textContent=meta.name;document.title=meta.name+' · 爸爸练习生';$('description').textContent=meta.desc;$('board-tag').textContent=meta.subtitle;$('objective').textContent=meta.mechanic;$('instructions').textContent=hints[id];$('lesson').textContent=meta.lesson;
function say(t){$('feedback').textContent=t;}
function save(){C.save(id,s);$('saved').textContent=C.storageOK()?'已自动保存；可以随时离开，再回来继续。':'浏览器未允许保存；本次仍可游玩，关闭页面后进度可能丢失。';}
function update(t){save();render();if(t)say(t);}
function finish(){done=true;C.complete(id);save();music.setPlaying(false);render();say('这一章已完成。你可以回到地图，自由选择下一种挑战。');}
function modal(title,text,confirm){music.setPlaying(false);$('modal-content').innerHTML=`<h2>${title}</h2><p>${text}</p><div class="choice-actions"><button class="primary" id="resume">${confirm?'确认重新开始':'继续游戏'}</button>${confirm?'<button class="secondary" id="cancel">保留进度</button>':''}</div>`;$('modal').showModal();$('resume').onclick=()=>{if(confirm){s=C.initial(id);done=false;update('新一轮准备好了。完成徽章会保留。');}$('modal').close();};if(confirm)$('cancel').onclick=()=>$('modal').close();}
$('modal').addEventListener('close',()=>music.setPlaying(musicOn&&!done&&!document.hidden));
$('pause').onclick=()=>modal('停一会儿，也没有关系','游戏已暂停。这里没有连续登录、限时奖励或扣分。');
$('guide').onclick=()=>modal('这一章怎么玩',hints[id]+' '+meta.lesson);
$('restart').onclick=()=>modal('重新开始这一章？','将清空本章进行中的操作，其他章节的进度会保留。',true);
$('music').onclick=()=>{musicOn=!musicOn;$('music').textContent='配乐：'+(musicOn?'开':'关');$('music').setAttribute('aria-pressed',String(musicOn));music.setEnabled(musicOn);music.setPlaying(musicOn&&!done);};
music.onUnavailable=()=>{musicOn=false;$('music').textContent='配乐暂不可用';$('music').setAttribute('aria-pressed','false');};
document.addEventListener('visibilitychange',()=>music.setPlaying(musicOn&&!done&&!document.hidden&&!$('modal').open));
window.addEventListener('pagehide',()=>music.setPlaying(false));
function btn(key,label,selected=false,disabled=false){return `<button data-key="${key}" class="${selected?'selected':''}" ${disabled?'disabled':''}>${label}</button>`;}
function toolButtons(items,selected,fn){$('tools').innerHTML=items.map(x=>btn(x.id,x.label||x.name,selected===x.id,x.disabled)).join('');$('tools').querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>fn(b.dataset.key));}
function bind(attr,fn){$('board').querySelectorAll(`[data-${attr}]`).forEach(b=>b.onclick=()=>fn(b.dataset[attr],b));}
function status(t){$('step-state').textContent=t;}
function render(){
 if(done){const next=DAD_CHAPTERS[DAD_CHAPTERS.findIndex(x=>x.id===id)+1];status('完成 · 不用刷关');$('tools').innerHTML='';$('board').innerHTML=`<div class="complete-stamp"><div class="symbol">✧</div><h2>这一件事，你接住了。</h2><p>${meta.lesson}</p><div class="complete-actions"><a class="primary" href="series.html">回到成长地图</a>${next?`<a class="secondary" href="${next.href||'adventure.html?chapter='+next.id}">下一章 · ${next.subtitle}</a>`:''}</div></div>`;return;}
 views[id]();
 if(id==='network')drawLinks();
}
function drawLinks(){
 const grid=$('board').querySelector('.network-grid');if(!grid)return;
 const old=grid.querySelector('svg');if(old)old.remove();
 const box=grid.getBoundingClientRect();
 const paths=Object.entries(s.links).map(([n,p])=>{const a=grid.querySelector(`[data-need="${n}"]`).getBoundingClientRect(),b=grid.querySelector(`[data-person="${p}"]`).getBoundingClientRect();const x=a.right-box.left,y=a.top+a.height/2-box.top,u=b.left-box.left,v=b.top+b.height/2-box.top;return `<path d="M ${x} ${y} C ${x+18} ${y}, ${u-18} ${v}, ${u} ${v}"/>`;}).join('');
 grid.insertAdjacentHTML('afterbegin',`<svg class="network-svg" viewBox="0 0 ${box.width} ${box.height}" aria-hidden="true" fill="none" stroke="#64876b" stroke-width="2">${paths}</svg>`);
}
window.addEventListener('resize',()=>{if(id==='network'&&!done)drawLinks();});
const facts={follow:['复诊安排','示例：明日 14:00 电话随访（仅为游戏资料）'],meds:['药物核对','按本人出院清单与医护核对；游戏不提供剂量'],feeding:['喂养支持','先联系医院喂养支持团队确认预约'],contact:['联络路径','已确认出院咨询渠道与紧急求助路径']};
const callFacts={when:['围产阶段','产后第 4 天'],symptom:['眼前症状','严重头痛，同时视线模糊'],since:['开始时间','今天傍晚开始（虚构场景记录）'],who:['陪伴情况','家属在身边陪伴，等待医护安排']};
function recordSlots(data){return `<div class="slots">${Object.entries(data).map(([k,v])=>`<button class="slot" data-slot="${k}"><b>${v[0]}</b><span>${s.slots[k]?data[s.slots[k]][1]:'点选资料，再放入这里'}</span></button>`).join('')}</div>`;}
function recordBindings(data,ready){bind('fact',k=>{s.selected=k;update('已选中：'+data[k][0]+'。请放入对应记录栏。');});bind('slot',k=>{if(!s.selected)return say('先从上面的资料中选一条信息。');if(s.selected!==k)return say('这条信息属于“'+data[s.selected][0]+'”，请放入相应栏位。');s.slots[k]=s.selected;s.selected=null;update('记录已归档。');if(ready&&Object.keys(s.slots).length===4&&s.asked)finish();});}
const views={
 pack(){
  status(`${s.placed.length} / 6 件物品`);
  const cells=Array.from({length:24},(_,i)=>{const x=i%6,y=Math.floor(i/6),p=s.placed.find(p=>{const[w,h]=C.dimensions(p.id,p.rot);return x>=p.x&&x<p.x+w&&y>=p.y&&y<p.y+h;});const item=p&&C.packs.find(q=>q.id===p.id),anchor=p&&x===p.x&&y===p.y;return `<button data-cell="${i}" aria-label="第${y+1}行第${x+1}列${item?'，'+item.name:''}" class="pack-cell ${p?'occupied':''} ${anchor?'anchor':''}" ${item?`style="--item-color:${item.color}"`:''}>${anchor?item.name:''}</button>`;}).join('');
  const selected=C.packs.find(p=>p.id===s.selected),[w,h]=C.dimensions(s.selected,s.rot);
  $('board').innerHTML=`<h2 class="board-title">一只箱子 · 六件必要用品</h2><p class="board-note">这是空间拼图，真实清单请以医院要求为准。格子里的物件可随时取出。</p><div class="pack-grid">${cells}</div><div class="tool-row"><button id="rotate" class="secondary">旋转 ↻</button><span class="chip">${selected.name} · ${w} × ${h}</span></div>`;
  toolButtons(C.packs.map(p=>({...p,label:p.name+(s.placed.some(q=>q.id===p.id)?' ✓':'')})),s.selected,k=>{s.selected=k;s.rot=false;update();});
  $('rotate').onclick=()=>{s.rot=!s.rot;update('已旋转；选择放置位置。');};
  bind('cell',i=>{const x=+i%6,y=Math.floor(+i/6),old=s.placed.find(p=>{const[w,h]=C.dimensions(p.id,p.rot);return x>=p.x&&x<p.x+w&&y>=p.y&&y<p.y+h;});if(old){s.placed=s.placed.filter(p=>p.id!==old.id);s.selected=old.id;s.rot=old.rot;return update('已取出，可以重新摆放。');}const next=C.placePack(s.placed,s.selected,x,y,s.rot);if(!next)return say('这里放不下：试着旋转，或选择更靠左上方的位置。');s.placed=next;const remaining=C.packs.find(p=>!next.some(q=>q.id===p.id));if(remaining){s.selected=remaining.id;s.rot=false;}update('放好了。');if(next.length===6)finish();});
 },
 handover(){
  status(`${Object.keys(s.slots).length} / 4 项交接`);
  const tabs=['出院安排','支持记录','联络卡'],keys=[['follow','meds'],s.asked?['feeding']:[],['contact']][s.tab];
  $('board').innerHTML=`<div class="doc-tabs">${tabs.map((v,i)=>`<button data-tab="${i}" class="${s.tab===i?'active':''}">${v}</button>`).join('')}</div><div class="doc-paper"><small>虚构训练资料 · 不能作为个人医嘱</small><h2 class="board-title">${tabs[s.tab]}</h2>${keys.map(k=>`<button data-fact="${k}" class="fact ${s.selected===k?'selected':''}"><b>${facts[k][0]}</b><br>${facts[k][1]}</button>`).join('')}${s.tab===1&&!s.asked?'<p>喂养支持的预约方式：尚未记录。</p><button class="secondary" id="ask">向医护补问缺失信息</button>':''}</div>${recordSlots(facts)}`;
  $('tools').innerHTML='<p class="board-note">资料不会自动填入记录。发现缺漏时，可以补问；不要凭记忆猜测。</p>';
  bind('tab',k=>{s.tab=+k;update();});if($('ask'))$('ask').onclick=()=>{s.asked=true;update('已补问并记录预约渠道。真实安排需由所在医院确认。');};recordBindings(facts,true);
 },
 shifts(){
  status(`${Object.keys(s.assigned).length} / 6 项安排`);
  $('board').innerHTML=`<h2 class="board-title">把休息当成一件正事</h2><p class="board-note">虚构成人分工日：妈妈专注恢复，帮手中午到场。格子是占位练习，不表示任务必须花两小时，也不是宝宝作息表。</p><div class="shift-wrap"><div class="shift-grid"><span></span>${['08–10','10–12','12–14','14–16'].map(t=>`<div class="shift-label">${t}</div>`).join('')}${[0,1].map(r=>`<div class="shift-label">${r?'帮手':'爸爸'}</div>${[0,1,2,3].map(t=>{const key=Object.keys(s.assigned).find(k=>s.assigned[k].row===r&&s.assigned[k].time===t);return `<button data-shift="${r}-${t}" class="shift-cell ${r===1&&t<2?'fixed':key?'filled':''}" ${r===1&&t<2?'disabled':''}>${r===1&&t<2?'尚未到场':key?C.shifts.find(x=>x.id===key).name:'＋ 安排'}</button>`;}).join('')}`).join('')}</div></div>`;
  toolButtons(C.shifts.map(t=>({...t,label:t.name+(s.assigned[t.id]?' ✓':'')+'<br><small>'+t.detail+'</small>'})),s.selected,k=>{s.selected=k;update();});
  bind('shift',key=>{const[r,t]=key.split('-').map(Number),old=Object.keys(s.assigned).find(k=>s.assigned[k].row===r&&s.assigned[k].time===t);if(old){delete s.assigned[old];s.selected=old;return update('已撤回，可重新安排。');}const next=C.assignShift(s.assigned,s.selected,r,t);if(!next)return say('这个时间或负责人不符合任务条件，请查看右侧任务说明。');s.assigned=next;const remaining=C.shifts.find(x=>!next[x.id]);if(remaining)s.selected=remaining.id;update('安排已记录。休息时要有同一时段的接班。');if(C.shiftsSolved(next))finish();});
 },
 soothe(){
  status(s.safe?'宝宝已安全安置':'照顾宝宝，也照顾自己');
  $('board').innerHTML=`<div class="soothe-scene"><div class="lamp" style="opacity:${s.light/100}"></div><div class="sound-lines" style="opacity:${s.sound/100}">♪ 〰</div><div class="parent-icon">🧑</div><div class="cot"><div class="baby-icon">${s.safe?'👶':'♡'}</div></div></div><p class="board-note">温和环境是支持的一部分，不保证哭声停止。滑杆数值只是游戏参数。</p>${['light','sound'].map(k=>`<label class="dial"><span>${k==='light'?'灯光亮度':'环境声音'}<output id="${k}-value">${s[k]}%</output></span><input id="${k}" type="range" min="0" max="100" value="${s[k]}" aria-label="${k==='light'?'灯光亮度':'环境声音'}"></label>`).join('')}<div class="station-banner">${s.environment?'哭声仍在。你感到自己越来越烦躁，需要安全地停一下。':'先回应宝宝的需要，再调低环境刺激。'}</div>`;
  ['light','sound'].forEach(k=>{$(k).oninput=()=>{s[k]=Number($(k).value);$(k+'-value').textContent=s[k]+'%';$('board').querySelector(k==='light'?'.lamp':'.sound-lines').style.opacity=s[k]/100;save();};});
  const steps=[['check','观察并回应宝宝的需要',s.checked],['environment','确认环境已调柔和',s.environment],['safe','把宝宝仰卧放入空的安全婴儿床',s.safe],['rest','短暂离开哭声，平复自己',s.rested],['help','联系可信赖的人来支援',s.help]];
  const current=steps.find(x=>!x[2]);toolButtons(steps.map(([key,name,yes])=>({id:key,name:(yes?'✓ ':'')+name,disabled:yes||key!==current?.[0]})),null,k=>{if(k==='check'){s.checked=true;return update('关注喂养、尿布和不适等需要。若担心宝宝生病，应联系医护；本章只练习环境与支援。');}if(k==='environment'){if(s.light>40||s.sound>35)return say('试着继续向左调节两个滑杆，让这个游戏场景更柔和。');s.environment=true;}if(k==='safe')s.safe=true;if(k==='rest')s.rested=true;if(k==='help')s.help=true;update(k==='safe'?'宝宝已仰卧安置在平坦、坚实、无松软物品的独立婴儿床中。现在可以短暂平复自己。':'你不需要独自撑住。绝不摇晃宝宝；求助是照护的一部分。');if(s.help)finish();});
 },
 visitors(){
  const card=C.visitors[s.index];if(!card){finish();return;}status(`${s.index} / 6 次协调`);
  $('board').innerHTML=`<div class="reception"><p class="board-note">家庭今日安排：优先休息，只接待已约好的协助。医护和紧急联络不进入这条队列。</p><div class="moving-card" draggable="true" id="visitor-card"><span class="chip">${card.tag}</span><strong>${card.title}</strong><p>${card.text}</p><small>拖到通道，或直接点下面的通道</small></div><div class="lanes">${[['door','门口交付','物品送达，无需接待'],['help','接班协助','已约好且获得同意'],['later','改约稍后','保留休息和隐私']].map(([k,a,b])=>`<button class="lane" data-lane="${k}"><b>${a}</b><br>${b}</button>`).join('')}</div></div>`;
  $('tools').innerHTML='<p class="board-note">没有速度分数。把每份好意放在合适的位置，家庭才能真正得到帮助。</p>';
  function receive(k){if(k!==card.lane)return say('看看卡片中的约定：物品可门口交付，已约的协助接班，未经同意的探望改约。');s.handled.push(card.id);s.index++;if(s.index===C.visitors.length){finish();return;}update('这件事已安排妥当。下一位来了。');}
  bind('lane',receive);$('visitor-card').ondragstart=e=>e.dataTransfer.setData('text/plain',card.id);$('board').querySelectorAll('[data-lane]').forEach(b=>{b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();if(e.dataTransfer.getData('text/plain')===card.id)receive(b.dataset.lane);};});
 },
 signal(){
  status(s.called?'模拟联络已启动':'先求助，再整理信息');
  $('board').innerHTML=`<div class="phone-panel"><small>虚构场景 · 不会拨打真实电话</small><h2>“头很痛，看东西也模糊……”</h2><p>产后第 4 天，今天傍晚开始出现严重头痛和视线模糊。你正在她身边。</p>${!s.called?'<button id="call" class="call-button">立即启动<br>模拟求助</button>':'<div class="phone-state">● 模拟联络已经启动</div><p>现实遇到这类警示信号应立即寻求医疗帮助。按当地急救或医疗团队指示行动，不等记录完成。</p>'}</div>${s.called?`<div class="doc-paper"><small>把已知事实传给医护；不知道的诊断，不猜。</small>${Object.entries(callFacts).map(([k,v])=>`<button class="fact ${s.selected===k?'selected':''}" data-fact="${k}">${v[1]}</button>`).join('')}</div>${recordSlots(callFacts)}`:''}`;
  if(!s.called){$('tools').innerHTML='<p class="board-note">此时最重要的是启动求助。记录和游戏操作都不能延误真实就医。</p>';$('call').onclick=()=>{s.called=true;update('模拟联络已启动，现在把已知情况交接清楚。');};}else{recordBindings(callFacts,false);toolButtons([{id:'send',name:'传递这份事实记录',disabled:Object.keys(s.slots).length<4}],null,()=>{s.sent=true;finish();});}
 },
 network(){
  status(`${Object.keys(s.links).length} / 7 项得到支持`);
  $('board').innerHTML=`<h2 class="board-title">一张不让任何人独撑的网</h2><p class="board-note">每个人的容量是本关的虚构约定。把专业问题交给专业支持；改派已连线需求也可以。</p><div class="network-grid"><div class="network-col">${C.needs.map(n=>`<button class="network-card ${s.selected===n.id?'selected':''} ${s.links[n.id]?'assigned':''}" data-need="${n.id}">${n.name}<span>${s.links[n.id]?'→ '+C.people.find(p=>p.id===s.links[n.id]).name:'等待一位支持者'}</span></button>`).join('')}</div><div class="network-col">${C.people.map(p=>`<button class="network-card" data-person="${p.id}"><b>${p.name}</b><span>${p.note}</span><i>${Object.values(s.links).filter(k=>k===p.id).length} / ${p.cap} 已分配</i></button>`).join('')}</div></div>`;
  $('tools').innerHTML='<p class="board-note">先选需求，再找支持者。持续或加重的情绪困扰应主动求助，爸爸也可以寻求心理支持。</p>';
  bind('need',k=>{s.selected=k;update();});bind('person',k=>{const next=C.linkNeed(s.links,s.selected,k);if(!next)return say('这位支持者的专长不匹配，或已经满负荷。换个人，或先把现有需求改派出去。');s.links=next;const remaining=C.needs.find(n=>!next[n.id]);if(remaining)s.selected=remaining.id;update('已连上一个支持点。');if(Object.keys(next).length===C.needs.length)finish();});
 }
};
const solved={pack:()=>s.placed.length===6,route:()=>s.route.at(-1)==='unit',handover:()=>s.asked&&Object.keys(s.slots).length===4,shifts:()=>C.shiftsSolved(s.assigned),soothe:()=>s.help,visitors:()=>s.index===6,signal:()=>s.sent,network:()=>Object.keys(s.links).length===7};
if(solved[id]())finish();else render();
})();
