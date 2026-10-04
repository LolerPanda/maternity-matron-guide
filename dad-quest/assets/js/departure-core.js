/* Deterministic logistics puzzle. All distances and times are fictional. */
(() => {
'use strict';
const city={nodes:[['home','家',9,51],['west','西街',28,24],['south','南街',28,81],['market','广场',47,51],['bridge','河桥',49,13],['ring','环路',53,85],['north','北路口',75,19],['east','东路口',76,76],['drop','医院落客区',90,48]],edges:[['home','west',3],['home','south',4],['west','bridge',4],['west','market',2],['south','market',2],['south','ring',3],['market','bridge',3],['market','ring',2],['bridge','north',3],['ring','east',5],['market','east',7],['north','drop',2],['east','drop',3],['north','east',4]]};
const campus={nodes:[['drop','落客区',9,60],['a','A 门',24,16],['canopy','连廊',31,78],['court','露天庭院',44,38],['b','B 门',63,80],['desk','服务台',78,57],['lift','电梯',84,21],['hall','中厅',54,59],['unit','产科接待',59,12]],edges:[['drop','a',2,'closed'],['drop','canopy',2,'roof'],['drop','court',2,'rain'],['canopy','b',3,'roof'],['court','hall',2,'rain'],['hall','desk',2,'roof'],['b','desk',2,'roof'],['hall','unit',2,'stairs'],['desk','lift',2,'roof'],['lift','unit',2,'roof']]};
const key=(a,b)=>[a,b].sort().join(':');
function initial(){return {version:2,stage:'city',at:'home',contact:false,plan:[],history:[],minutes:0,rain:0,news:false,directions:false,arrival:false};}
function map(s){return s.stage==='city'?city:campus;}
function edge(s,a,b){return map(s).edges.find(e=>key(e[0],e[1])===key(a,b));}
function blocked(s,e){if(!e)return '两个地点之间没有直接道路';if(s.stage==='city'&&s.news&&key(e[0],e[1])===key('bridge','north'))return '河桥至北路口已经封闭';if(s.stage==='campus'){if(e[3]==='closed')return 'A 门夜间关闭，请按指引走 B 门或服务台';if(e[3]==='stairs')return '这段是楼梯，行李推车不能通行，请找电梯';if(!s.directions&&(e.includes('lift')||e.includes('unit')))return '先到服务台确认接待位置与电梯指引';}return '';}
function cost(s,e){return e[2]+(s.stage==='city'&&s.news&&key(e[0],e[1])===key('ring','east')?3:0);}
function preview(s,plan=s.plan){let at=s.at,time=0,rain=0;for(const n of plan){const e=edge(s,at,n),error=blocked(s,e);if(error)return {error,minutes:time,rain};time+=cost(s,e);if(e[3]==='rain')rain+=e[2];at=n;}return {error:'',minutes:time,rain,end:at};}
function append(s,n){if(!s.contact)return {error:'先确认本次到院安排，再开始规划。'};if(s.stage==='done')return {error:'已抵达。'};const from=s.plan.at(-1)||s.at;if(n===from)return {error:'请选择与路线末端相连的下一站。'};const e=edge(s,from,n),error=blocked(s,e);if(error)return {error};return {state:{...s,plan:[...s.plan,n]}};}
function advance(s){
 if(!s.contact||!s.plan.length||s.stage==='done')return {error:'请先规划路线。'};
 const to=s.plan[0],e=edge(s,s.at,to),error=blocked(s,e);if(error)return {error};
 let next={...s,at:to,plan:s.plan.slice(1),minutes:s.minutes+cost(s,e),rain:s.rain+(e[3]==='rain'?e[2]:0),history:[...s.history,{stage:s.stage,from:s.at,to,minutes:cost(s,e)}]},event='';
 if(s.stage==='city'&&!s.news&&next.history.filter(x=>x.stage==='city').length===2){next.news=true;next.plan=[];event='路况变化：河桥至北路口临时封闭；环路至东路口积水缓行，增加 3 个模拟分钟。车辆已停在当前节点，请重新规划。';}
 if(s.stage==='city'&&to==='drop'){next.stage='campus';next.plan=[];next.arrival=true;event='抵达落客区。司机负责车辆，你和伴侣一起带着行李推车进入院区。夜间 A 门关闭；雨仍在下。先找到服务台确认产科接待位置。';}
 if(s.stage==='campus'&&to==='desk'&&!s.directions){next.plan=[];event='服务台到了。请确认当前产科接待位置，再规划最后一段。';}
 if(s.stage==='campus'&&to==='unit'&&s.directions){next.stage='done';next.plan=[];event='你们一起抵达产科接待。把接下来的医疗安排交给医护团队。';}
 return {state:next,event};
}
function valid(s){if(!s||s.version!==2||!['city','campus','done'].includes(s.stage)||!Array.isArray(s.plan)||s.plan.length>50||!Array.isArray(s.history)||s.history.length>300||!Number.isFinite(s.minutes)||s.minutes<0||!Number.isFinite(s.rain)||s.rain<0)return false;
 if(!['contact','news','directions','arrival'].every(k=>typeof s[k]==='boolean'))return false;
 const m=map(s);if(!m.nodes.some(n=>n[0]===s.at)||!s.plan.every(n=>m.nodes.some(p=>p[0]===n)))return false;
 if(s.stage==='done'&&(s.at!=='unit'||!s.directions||!s.contact||!s.arrival))return false;
 return s.history.every(h=>h&&['city','campus'].includes(h.stage)&&(h.stage==='city'?city:campus).edges.some(e=>key(e[0],e[1])===key(h.from,h.to))&&Number.isFinite(h.minutes));
}
window.Departure={city,campus,initial,map,edge,blocked,cost,preview,append,advance,valid};
})();
