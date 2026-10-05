/* A fictional supported birth, with no player-controlled clinical outcomes. */
(() => {'use strict';
const moments=[
 ['安顿 · 留一盏温柔的灯','把外界留在门外','她：“把帘子拉上吧，我想留一点自己的空间。”','把隐私帘滑到关闭端，再继续。','privacy'],
 ['安顿 · 留一盏温柔的灯','照着她的感受调整','她：“有点刺眼，灯光柔和一些就好。” 医护确认这盏陪伴灯可以调节。','把灯光调到她喜欢的 35–55。','light'],
 ['待产末段 · 陪伴也会改变','有时握手，有时松开','她先想握手，随后会想独自缓一缓。听见改变，就调整自己的动作。','按住“握手陪伴”；她提出休息时松开。也可用空格操作。','hand'],
 ['准备分娩 · 给团队留出空间','把椅子挪开','助产士：“我来照顾她，你把通道里的椅子移到左侧停放区。”','拖动椅子到虚线区；也可用方向键或下方按钮微调，爸爸会留在椅子旁。','chair'],
 ['准备分娩 · 仍站在她看得见的地方','走到床头','她：“站在我看得见的地方，别走开。”','点击场景地面或用方向键走到床头的暖色圆环。','position'],
 ['分娩 · 跟随当下的医护指导','一起听清接下来的安排','助产士：“具体怎么配合，我会当面告诉她。你安静陪着，需要帮助就叫我。”','留在床头，听完这段交代。无需跟着画面呼吸或用力。','brief'],
 ['分娩 · 第一次见面正在靠近','你在这里，她知道','医护团队继续分娩照护。你们的目光相遇，房间里只留下简短的鼓励。','这一段没有操作考试。可以握手或安静陪着，看见宝宝来到这个房间。','witness'],
 ['出生 · 先由医护确认','等这一声“可以了”','助产士先为宝宝擦干、保暖并进行初步评估，同时继续照顾妈妈。','等医护确认，听见妈妈愿意后，由医护协助开始肌肤接触。','contact'],
 ['初见 · 盖好身体，留出小脸','小小的你，终于见面','医护已协助安置宝宝。她：“你在旁边陪着我们吧。”','在医护示意下调整示意毯的位置，覆盖身体，保持脸部露出。','blanket'],
 ['出生之后 · 仍在照护之中','一起核对小小的腕带','医护继续妈妈的第三产程照护和母婴观察。护士邀请你一起核对母婴标识。','依次翻看妈妈与宝宝腕带，再请护士确认。画面中的编号是虚构的。','bands'],
 ['出生之后 · 也别忘了她','把她的新需要说出来','她：“我有些不舒服，想让助产士来看看。还有，稍后喂养时请人陪着我们。”','按呼叫铃，留在她身边等待医护回应；不自行判断原因。','help'],
 ['留在身边 · 下一程慢慢来','把这一刻留下','医护继续观察，并说明后续安排。是否休息、接触与喂养，都按当时情况调整。','收好本次记录，再回到她身边。出生不是照护的终点。','record']
].map(([phase,title,speech,tip,kind])=>({phase,title,speech,tip,kind}));
const initial=()=>({version:1,stage:0,elapsed:0,time:0,player:{x:300,y:430},chair:{x:650,y:385},light:85,curtain:15,born:false,contact:false,blanket:10,nurseHere:true,witness:0,held:false,hand:0,rest:0,read:[],called:false,confirmed:false,recorded:false,complete:false});
const nearHead=s=>Math.hypot(s.player.x-350,s.player.y-230)<65;
function ready(s){switch(s.stage){case 0:return s.curtain>=90;case 1:return s.light>=35&&s.light<=55;case 2:return s.hand>=4&&s.rest>=3;case 3:return s.chair.x>=180&&s.chair.x<=280&&s.chair.y>=415&&s.chair.y<=480;case 4:return nearHead(s);case 5:return s.elapsed>=12;case 6:return s.born;case 7:return s.contact;case 8:return s.blanket>=45&&s.blanket<=70;case 9:return s.confirmed;case 10:return s.called&&s.elapsed>=8;case 11:return s.recorded&&nearHead(s);default:return false;}}
function next(s){if(!ready(s)||s.complete)return s;if(s.stage===11)return {...s,complete:true,held:false};return {...s,stage:s.stage+1,elapsed:0,held:false};}
function act(s,type,value){if(s.complete)return s;const n={...s,read:[...s.read]};const kind=moments[s.stage].kind;
 if(['curtain','light','blanket'].includes(type)&&({curtain:'privacy',light:'light',blanket:'blanket'})[type]===kind)n[type]=Math.max(0,Math.min(100,Number(value)||0));
 if(type==='hand')n.held=!!value;
 if(type==='chair'&&kind==='chair'){n.chair={x:Math.max(45,Math.min(910,value.x)),y:Math.max(320,Math.min(510,value.y))};n.player={x:Math.max(45,n.chair.x-45),y:n.chair.y};}
 if(type==='move'){const p={x:Math.max(45,Math.min(900,value.x)),y:Math.max(185,Math.min(510,value.y))};if(!(p.x>380&&p.x<660&&p.y<415))n.player=p;}
 if(type==='contact'&&kind==='contact'&&s.elapsed>=8)n.contact=true;
 if(type==='band'&&kind==='bands'&&['mother','baby'].includes(value)&&!n.read.includes(value))n.read.push(value);
 if(type==='confirm'&&kind==='bands'&&n.read.length===2)n.confirmed=true;
 if(type==='call'&&kind==='help'&&!s.called){n.called=true;n.elapsed=0;}
 if(type==='record'&&kind==='record'&&Math.hypot(s.player.x-760,s.player.y-435)<65)n.recorded=true;
 return n;
}
function tick(s,dt){if(s.complete)return s;dt=Math.min(.1,Math.max(0,dt));const n={...s,time:s.time+dt,elapsed:s.elapsed+dt};
 if(s.stage===2){if(s.hand<4&&s.held&&nearHead(s))n.hand=Math.min(4,s.hand+dt);if(s.hand>=4&&!s.held)n.rest=Math.min(3,s.rest+dt);}
 if(s.stage===6){n.witness=Math.min(1,n.elapsed/28);if(n.elapsed>=28)n.born=true;}
 return n;
}
function valid(s){
 const range=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;
 if(!s||s.version!==1||!Number.isInteger(s.stage)||s.stage<0||s.stage>=moments.length)return false;
 if(!['elapsed','time'].every(k=>range(s[k],0,1e8))||!['light','curtain','blanket'].every(k=>range(s[k],0,100))||!range(s.witness,0,1)||!range(s.hand,0,4)||!range(s.rest,0,3))return false;
 if(!s.player||!range(s.player.x,45,900)||!range(s.player.y,185,510)||!s.chair||!range(s.chair.x,45,910)||!range(s.chair.y,320,510))return false;
 if(!Array.isArray(s.read)||new Set(s.read).size!==s.read.length||!s.read.every(k=>['mother','baby'].includes(k)))return false;
 if(!['born','contact','held','called','confirmed','recorded','complete','nurseHere'].every(k=>typeof s[k]==='boolean'))return false;
 return (s.stage<7||s.born)&&(s.stage<8||s.contact)&&(!s.contact||s.born)&&(!s.confirmed||s.read.length===2)&&(!s.complete||(s.stage===11&&ready(s)));
}
window.BirthJourney={moments,initial,nearHead,ready,next,act,tick,valid};
})();
