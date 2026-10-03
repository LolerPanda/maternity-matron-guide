/* Pure puzzle rules shared by views and deterministic tests. */
(() => {
'use strict';
const packs=[
{id:'papers',name:'证件资料',w:2,h:1,color:'#e6c98d'},
{id:'charger',name:'充电用品',w:1,h:2,color:'#b7c8d7'},
{id:'clothes',name:'换洗衣物',w:3,h:2,color:'#d1baa7'},
{id:'wash',name:'洗漱用品',w:2,h:2,color:'#b9cdb2'},
{id:'baby',name:'宝宝衣物',w:2,h:2,color:'#d9bec8'},
{id:'supplies',name:'院方清单用品',w:3,h:2,color:'#c4bfda'}];
const nodes=[{id:'home',name:'家',x:10,y:50},{id:'a',name:'北路口',x:32,y:22},{id:'b',name:'南路口',x:30,y:80},{id:'c',name:'河桥',x:55,y:22},{id:'d',name:'沿河路',x:55,y:80},{id:'gate',name:'医院入口',x:79,y:60},{id:'unit',name:'产科接待',x:90,y:20}];
const edges=[['home','a'],['home','b'],['a','c'],['b','d'],['c','d'],['c','gate'],['d','gate'],['gate','unit']];
const shifts=[
{id:'call',name:'确认出院安排',rows:[0],times:[0],detail:'爸爸负责 · 08–10 联络窗口'},
{id:'shop',name:'采购日用品',rows:[0],times:[0,1],detail:'爸爸负责 · 上午完成'},
{id:'rest',name:'爸爸的休息',rows:[0],times:[2,3],detail:'下午；同一时段须由帮手接班'},
{id:'cover',name:'接班陪伴',rows:[1],times:[2,3],detail:'帮手负责；与爸爸休息重合'},
{id:'meal',name:'安排晚餐',rows:[0,1],times:[2,3],detail:'下午完成 · 爸爸或帮手'},
{id:'laundry',name:'处理家务',rows:[0,1],times:[0,1,2,3],detail:'爸爸或帮手均可'}];
const people=[
{id:'dad',name:'爸爸',cap:2,skills:['chores','admin'],note:'能处理家务、协调事务；最多两件事'},
{id:'friend',name:'朋友',cap:1,skills:['chores'],note:'这周愿意帮一件具体家务'},
{id:'family',name:'家人',cap:2,skills:['chores','company'],note:'可陪伴或做家务；最多两件事'},
{id:'clinic',name:'医疗 / 喂养支持',cap:2,skills:['physical','feeding'],note:'身体恢复、喂养问题的专业评估'},
{id:'counsel',name:'心理专业支持',cap:1,skills:['mental'],note:'持续情绪困扰的专业帮助'}];
const needs=[{id:'food',name:'一周的备餐',skill:'chores'},{id:'shopping',name:'日用品采购',skill:'chores'},{id:'calls',name:'协调复诊事务',skill:'admin'},{id:'company',name:'有人听她说说',skill:'company'},{id:'recovery',name:'恢复中的身体疑问',skill:'physical'},{id:'feeding',name:'喂养困难的评估',skill:'feeding'},{id:'mood',name:'持续低落与焦虑',skill:'mental'}];
const visitors=[
{id:'parcel',title:'生活用品配送',text:'物品已经买好，放在门口即可。',lane:'door',tag:'物品'},
{id:'relative',title:'想来看看宝宝的亲友',text:'你们已经约好今天休息，改天再见。',lane:'later',tag:'探望'},
{id:'dinner',title:'朋友送来的晚餐',text:'晚餐送达，今天不需要额外接待。',lane:'door',tag:'物品'},
{id:'cleaner',title:'约好的家务帮手',text:'已征得同意，今天来接手家务。',lane:'help',tag:'已约协助'},
{id:'photos',title:'临时提出拍照留念',text:'伴侣不愿被拍摄，先暂停并说明边界。',lane:'later',tag:'未获同意'},
{id:'backup',title:'约定的照护接班',text:'双方已确认时间，进来完成交接。',lane:'help',tag:'已约协助'}];
function dimensions(id,rot){const p=packs.find(p=>p.id===id);return rot?[p.h,p.w]:[p.w,p.h];}
function placePack(placed,id,x,y,rot){if(!packs.some(p=>p.id===id))return null;const [w,h]=dimensions(id,rot);if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x+w>6||y+h>4)return null;const rest=placed.filter(p=>p.id!==id);if(rest.some(p=>{const[a,b]=dimensions(p.id,p.rot);return x<p.x+a&&x+w>p.x&&y<p.y+b&&y+h>p.y}))return null;return [...rest,{id,x,y,rot:!!rot}];}
function routeMove(route,next,closed){const from=route.at(-1);if(!edges.some(([a,b])=>a===from&&b===next||b===from&&a===next))return null;if(closed&&[from,next].sort().join('-')==='a-c')return null;return [...route,next];}
function assignShift(assigned,id,row,time){const task=shifts.find(t=>t.id===id);if(!task||!task.rows.includes(row)||!task.times.includes(time)||row===1&&time<2)return null;const other=Object.entries(assigned).filter(([key])=>key!==id);if(other.some(([,p])=>p.row===row&&p.time===time))return null;return {...assigned,[id]:{row,time}};}
function shiftsSolved(a){return shifts.every(t=>a[t.id])&&a.rest.time===a.cover.time;}
function linkNeed(links,needId,personId){const n=needs.find(n=>n.id===needId),p=people.find(p=>p.id===personId);if(!n||!p||!p.skills.includes(n.skill))return null;if(Object.entries(links).filter(([k,v])=>k!==needId&&v===personId).length>=p.cap)return null;return {...links,[needId]:personId};}
const initial=id=>({pack:{placed:[],selected:'papers',rot:false},route:{route:['home'],contact:false,closed:false},handover:{tab:0,selected:null,asked:false,slots:{}},shifts:{assigned:{},selected:'call'},soothe:{light:80,sound:75,checked:false,environment:false,safe:false,rested:false,help:false},visitors:{index:0,handled:[],paused:false},signal:{called:false,selected:null,slots:{},sent:false},network:{links:{},selected:'food'}}[id]);
function valid(id,s){
 if(!s||typeof s!=='object'||Array.isArray(s))return false;
 if(id==='pack'){if(!Array.isArray(s.placed)||s.placed.length>6)return false;let a=[];for(const p of s.placed){if(!p||a.some(q=>q.id===p.id))return false;a=placePack(a,p.id,p.x,p.y,p.rot);if(!a)return false;}return packs.some(p=>p.id===s.selected)&&typeof s.rot==='boolean';}
 if(id==='route')return Array.isArray(s.route)&&s.route.length<100&&s.route[0]==='home'&&s.route.every(x=>nodes.some(n=>n.id===x))&&typeof s.contact==='boolean'&&typeof s.closed==='boolean';
 if(id==='handover')return [0,1,2].includes(s.tab)&&typeof s.asked==='boolean'&&s.slots&&Object.keys(s.slots).every(k=>['follow','feeding','meds','contact'].includes(k))&&Object.values(s.slots).every(v=>['follow','feeding','meds','contact'].includes(v))&&[null,'follow','feeding','meds','contact'].includes(s.selected);
 if(id==='shifts'){if(!s.assigned||!shifts.some(t=>t.id===s.selected))return false;let a={};for(const[k,v]of Object.entries(s.assigned)){if(!v)return false;a=assignShift(a,k,v.row,v.time);if(!a)return false;}return true;}
 if(id==='soothe')return [s.light,s.sound].every(v=>Number.isFinite(v)&&v>=0&&v<=100)&&['checked','environment','safe','rested','help'].every(k=>typeof s[k]==='boolean');
 if(id==='visitors')return Number.isInteger(s.index)&&s.index>=0&&s.index<=visitors.length&&Array.isArray(s.handled)&&s.handled.every(id=>visitors.some(v=>v.id===id));
 if(id==='signal')return typeof s.called==='boolean'&&typeof s.sent==='boolean'&&[null,'when','symptom','since','who'].includes(s.selected)&&s.slots&&Object.keys(s.slots).every(k=>['when','symptom','since','who'].includes(k))&&Object.values(s.slots).every(v=>['when','symptom','since','who'].includes(v));
 if(id==='network'){if(!s.links||!needs.some(n=>n.id===s.selected))return false;let a={};for(const[k,v]of Object.entries(s.links)){a=linkNeed(a,k,v);if(!a)return false;}return true;}
 return false;
}
let storageOK=true;
function read(){try{const x=JSON.parse(localStorage.getItem('dad-series-v1'));return x&&typeof x==='object'&&!Array.isArray(x)?{complete:x.complete&&typeof x.complete==='object'?x.complete:{},sessions:x.sessions&&typeof x.sessions==='object'?x.sessions:{}}:{complete:{},sessions:{}};}catch{storageOK=false;return{complete:{},sessions:{}};}}
function write(data){try{localStorage.setItem('dad-series-v1',JSON.stringify(data));}catch{storageOK=false;}}
function load(id){const s=read().sessions[id];return valid(id,s)?s:initial(id);}
function save(id,s){const d=read();d.sessions[id]=s;write(d);}
function complete(id){const d=read();d.complete[id]=true;write(d);}
function finished(id){if(id==='night'||id==='labor'){try{return Number(localStorage.getItem(id==='night'?'dad-night-best':'dad-labor-best'))>=8}catch{return false;}}return read().complete[id]===true;}
window.DadSeries={packs,nodes,edges,shifts,people,needs,visitors,dimensions,placePack,routeMove,assignShift,shiftsSolved,linkNeed,initial,valid,load,save,complete,finished,storageOK:()=>storageOK};
})();
