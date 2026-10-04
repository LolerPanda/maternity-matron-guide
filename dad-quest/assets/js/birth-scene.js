/* An original, non-graphic birth-room illustration. All care is carried out by the team. */
(() => {
'use strict';
const W=960,H=560;
const targets=Object.freeze({partner:{x:480,y:245},head:{x:350,y:230},nurse:{x:740,y:280},desk:{x:760,y:435}});
const chairZone=Object.freeze({x:170,y:400,w:120,h:95});
const palette={ink:'#284d49',muted:'#68837a',wall:'#e9eddf',floor:'#dde6d7',wood:'#bca681',cream:'#fff9e9',sage:'#9ebdaf',teal:'#668d82',skin:'#ebbd9b',rose:'#d6a396',orange:'#c98f67'};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function draw(canvas,state={},time=0){
 const c=canvas.getContext('2d');if(!c)return;
 const dpr=clamp(window.devicePixelRatio||1,1,2);
 if(canvas.width!==W*dpr||canvas.height!==H*dpr){canvas.width=W*dpr;canvas.height=H*dpr;}
 c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
 const stage=Number.isFinite(state.stage)?state.stage:0;
 const light=clamp(Number.isFinite(state.light)?state.light:70,0,100);
 const curtain=clamp(Number.isFinite(state.curtain)?state.curtain:0,0,100)/100;
 const witness=clamp(state.witness||0,0,1);
 const born=!!state.born||stage>=7;
 const contact=!!state.contact;
 const blanket=clamp(state.blanket||0,0,100)/100;
 const t=Number.isFinite(time)?time:0;
 const player=state.player||{x:300,y:430};
 const holding=!!state.held&&(stage===2||stage===6)&&Math.hypot(player.x-targets.head.x,player.y-targets.head.y)<65;
 const box=(x,y,w,h,r,fill,stroke)=>{c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}};
 const circle=(x,y,r,fill)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();};
 const line=(x,y,x2,y2,stroke,width=2)=>{c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=stroke;c.lineWidth=width;c.lineCap='round';c.stroke();};
 const label=(txt,x,y,size=12,color=palette.muted,align='center')=>{c.font=`${size}px system-ui,-apple-system,"PingFang SC",sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;c.fillText(txt,x,y);};
 const ellipse=(x,y,rx,ry,fill)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();};
 function floorMarker(x,y,w,h,txt,active=false){
  c.save();c.setLineDash([7,7]);box(x,y,w,h,14,null,active?'#bc9160':'#a7baaa');c.restore();
  label(txt,x+w/2,y+h-15,11,active?'#8d704f':'#8b9f8c');
 }
 function person(x,y,kind='dad',facing='right'){
  const nurse=kind==='nurse',doctor=kind==='doctor';
  const shirt=nurse?'#ebf2e9':doctor?'#80a99a':palette.orange;
  ellipse(x,y+11,22,8,'#506e5722');
  box(x-14,y-1,11,20,5,'#5b7268');box(x+3,y-1,11,20,5,'#5b7268');
  box(x-19,y-35,38,43,13,shirt);
  line(x-19,y-22,x-23,y-2,palette.skin,8);if(kind!=='dad'||!holding)line(x+19,y-22,x+22,y-4,palette.skin,8);
  circle(x,y-49,17,palette.skin);
  c.beginPath();c.arc(x,y-53,17,Math.PI,Math.PI*2);c.fillStyle=doctor?'#78918a':'#5b5146';c.fill();
  if(nurse||doctor){box(x-18,y-66,36,10,4,nurse?'#fffcee':'#7ca693');box(x-9,y-38,18,9,4,'#d2e1d6');box(x+6,y-24,7,10,2,'#d1b88c');}
  else{circle(x+(facing==='left'?-6:6),y-48,1.6,palette.ink);line(x+3,y-41,x+8,y-41,'#a97458',1.5);box(x-5,y-28,10,5,2,'#deb18c');}
 }
 function baby(x,y,scale=1,cover=0){
  c.save();c.translate(x,y);c.rotate(-.25);c.scale(scale,scale);
  ellipse(1,11,15,20,'#a99f8033');
  box(-14,-10,28,41,13,'#f9eed4');
  c.beginPath();c.moveTo(-13,4);c.lineTo(12,14);c.lineTo(5,28);c.lineTo(-9,25);c.closePath();c.fillStyle='#e4d6b4';c.fill();
  circle(0,-9,10,palette.skin);c.beginPath();c.arc(0,-12,10,Math.PI,Math.PI*2);c.fillStyle='#e7e9d5';c.fill();
  line(-4,-8,-1,-8,'#957459',1.2);line(3,-8,6,-8,'#957459',1.2);
  if(cover>0){
   // 45–70 is the game's body-covering range. Above 70 the edge visibly reaches the face.
   const top=cover<=.45?31-cover/.45*24:cover<=.7?7-(cover-.45)/.25*4:1-(cover-.7)*62;
   box(-16,top,32,35-top,7,cover>.7?'#d5c09f':'#c8d9c2');
   line(-9,top+5,9,top+5,cover>.7?'#b9a57f':'#adc2a9',1.5);
  }
  c.restore();
 }
 function chair(x,y){
  ellipse(x,y+23,36,10,'#58745622');
  line(x-24,y+6,x-28,y+27,'#708f82',6);line(x+24,y+6,x+28,y+27,'#708f82',6);
  box(x-34,y-47,68,50,14,'#7b9e8e');box(x-28,y-41,56,37,11,'#b5cbb0');
  box(x-32,y-10,64,34,9,'#94b39b');box(x-26,y-8,52,23,8,'#cbd8b8');
  box(x-38,y-9,11,35,5,'#6f9483');box(x+27,y-9,11,35,5,'#6f9483');
  if(stage===3){c.save();c.setLineDash([5,5]);ellipse(x,y-8,48,48,'#d3b16a12');c.strokeStyle='#b8915f';c.lineWidth=2;c.stroke();c.restore();label('↔ 拖动座椅',x,y+45,12,'#926c45');}
 }
 // Wall, daylight and floor remain the same room through the whole chapter.
 box(0,0,W,H,0,palette.wall);
 box(0,112,W,H-112,0,palette.floor);
 for(let y=142;y<H;y+=52)line(0,y,W,y,'#ccd9c82e',1);
 for(let x=-180;x<W+180;x+=130)line(480+(x-480)*.76,112,x,H,'#c7d6c522',1);
 box(0,103,W,10,0,'#b4c6b0');
 box(20,19,920,72,17,'#f7f5e9');
 const names=['把空间交给她','把空间交给她','把空间交给她','为医护留出通道','在她看得见的地方','与医护一起陪伴','等待，迎接新生命','第一声回应','贴近彼此','最初的安静时光','把后续安排听清','我们一起，走向下一程'];
 label('THE FIRST HELLO',52,43,10,'#9c9f86','left');
 label(names[clamp(stage,0,11)],52,68,20,palette.ink,'left');
 label('安心陪伴室',858,44,13,palette.muted);label(born?'你好，小小的新朋友':'此刻，一起在这里',858,65,10,'#8b9d8c');
 // A window curtain visibly closes for privacy; it never obscures the playing area.
 box(258,120,341,56,7,'#a9beb1');box(267,126,323,44,4,'#f1ead0');
 const sky=c.createLinearGradient(0,124,0,176);sky.addColorStop(0,'#d1ded4');sky.addColorStop(1,'#f3e9c7');box(272,130,313,36,3,sky);
 line(431,126,431,170,'#e8eee2',4);line(268,121,591,121,'#849e90',5);
 const panelWidth=28+curtain*133;
 box(267,125,panelWidth,48,3,'#bac9b1');box(591-panelWidth,125,panelWidth,48,3,'#bac9b1');
 for(let i=8;i<panelWidth;i+=15){line(267+i,127,267+i,170,'#a8bca2',2);line(591-i,127,591-i,170,'#a8bca2',2);}
 // Door, coat hooks and a reassuringly ordinary clock, without medical readouts.
 box(37,139,113,193,12,'#b5c7b6');box(44,146,99,178,7,'#ccd7be');box(65,161,58,57,6,'#e7e9d7');
 box(106,244,20,6,3,'#8ca391');label('轻声',93,192,14,'#8a9d89');
 line(186,151,224,151,'#b5a381',5);for(let i=0;i<3;i++)circle(189+i*16,153,3,'#887c62');
 box(184,162,29,45,8,'#9eb5a4');line(184,172,175,191,'#9eb5a4',9);
 circle(648,144,23,'#a5bba6');circle(648,144,19,'#faf6e5');line(648,144,648,133,'#778d77',2);line(648,144,659,148,'#778d77',2);circle(648,144,2,'#778d77');
 // A lamp gives gentle, controllable warmth; clinical care remains visible at every setting.
 line(236,250,236,336,'#9b9e80',6);ellipse(236,339,25,7,'#b5b394');
 c.beginPath();c.moveTo(214,214);c.lineTo(257,214);c.lineTo(267,252);c.lineTo(205,252);c.closePath();c.fillStyle='#eee0b9';c.fill();
 const lampGlow=c.createRadialGradient(236,256,3,236,256,130);lampGlow.addColorStop(0,`rgba(255,232,164,${.08+light*.0024})`);lampGlow.addColorStop(1,'rgba(255,232,164,0)');circle(236,256,130,lampGlow);
 label('陪伴灯',236,362,11);
 // Clear chair parking and care corridor have physical presence but no large overlay.
 floorMarker(chairZone.x,chairZone.y,chairZone.w,chairZone.h,'座椅停放',stage===3);
 if(stage===3||stage===4){c.save();c.setLineDash([8,9]);line(657,407,755,316,'#b4c5ac',2);c.restore();label('通道',686,399,10,'#96a78e');}
 if(stage===4){c.save();c.setLineDash([5,5]);ellipse(targets.head.x,targets.head.y+8,38,16,'#d1ab681c');c.strokeStyle='#b89860';c.stroke();c.restore();label('床头位置',350,263,11,'#a08553');}
 // Bed and mother: gown and bedding throughout, no visible medical procedure.
 ellipse(505,353,138,27,'#54735e18');
 c.save();c.translate(445,215);c.rotate(-.4);
 box(-58,-39,132,229,18,'#8fae9e');box(-51,-33,118,205,15,'#f7f2df');
 box(-60,-43,136,15,6,'#b7cbb7');box(-58,163,132,23,7,'#93b09f');
 box(-49,-28,110,44,14,'#d8ddc8');box(-43,-23,98,30,11,'#eeebd8');
 circle(8,7,27,'#655749');circle(10,16,21,palette.skin);
 c.beginPath();c.arc(8,1,24,Math.PI*1.03,Math.PI*1.98);c.lineWidth=8;c.strokeStyle='#655749';c.stroke();
 line(1,17,7,17,'#7c6452',1.4);line(15,17,21,17,'#7c6452',1.4);line(8,29,15,29,'#ae7c60',1.6);
 box(-31,38,80,53,20,'#d6aaa0');
 box(-48,72,111,93,12,'#b7ccbd');
 c.beginPath();c.moveTo(-47,89);c.quadraticCurveTo(6,107,62,86);c.lineTo(62,156);c.quadraticCurveTo(8,171,-47,155);c.closePath();c.fillStyle='#cadbc8';c.fill();
 line(-41,120,51,125,'#b3cdb8',2);
 if(!holding){line(-28,49,-52,76,palette.skin,12);circle(-52,78,7,palette.skin);}
 line(46,47,57,75,palette.skin,12);circle(57,77,7,palette.skin);
 line(-65,34,-65,149,'#769e8c',5);line(81,34,81,149,'#769e8c',5);
 line(-65,35,-54,35,'#769e8c',5);line(69,35,81,35,'#769e8c',5);
 if(contact&&born){baby(10,64,.88,blanket);line(-32,59,-9,66,palette.skin,8);line(45,59,28,75,palette.skin,8);}
 c.restore();
 // Accessible bedside call button. Decorative light never displays vital signs.
 line(378,185,365,294,'#b4aa87',2);box(352,287,25,37,7,'#eee2bb');circle(364,302,6,'#769a83');
 label('呼叫铃',361,341,11);
 box(697,133,116,64,11,'#adbfac');box(705,141,100,48,7,'#e6ead5');
 label('一起照护',755,165,14,'#77927d');
 // Storage and handover desk remain clickable at a fixed position.
 box(809,238,112,124,12,'#adbca6');box(817,246,96,48,6,'#d3dec7');box(817,302,96,50,6,'#d3dec7');
 box(828,257,34,26,6,'#fff7de');box(870,255,29,29,6,'#c5a981');
 for(let i=0;i<3;i++){box(826+i*26,316,20,22,4,['#e4c9a1','#f8edd2','#bacfae'][i]);}
 label('照护物品',865,380,11);
 box(694,397,168,85,13,'#b6a07c');box(700,392,156,71,11,'#d4c3a0');
 box(738,402,61,43,4,'#fbf4de');box(757,399,24,6,3,'#98ad96');
 for(let i=0;i<3;i++)line(750,414+i*8,787,414+i*8,'#a8b8a0',2);
 box(817,416,20,24,5,'#faf3dd');line(837,421,842,421,'#c6b48f',3);line(842,421,842,434,'#c6b48f',3);line(842,434,837,434,'#c6b48f',3);
 label('交接记录台',779,496,12);
 // Artifacts provide a small narrative progression, without jump cuts to another room.
 if(stage>=5){
  const halo=c.createRadialGradient(515,275,30,515,275,165);halo.addColorStop(0,'#ffecbb1c');halo.addColorStop(1,'#ffecbb00');circle(515,275,165,halo);
  person(604,331,'doctor','left');
  if(!born&&stage===6&&witness>.72){c.save();c.globalAlpha=clamp((witness-.72)/.28,0,1);baby(584,294,.82);c.restore();}
  if(born&&!contact){line(592,306,579,288,palette.skin,8);line(619,310,599,306,palette.skin,8);baby(584,285,.92);}
 }
 if(state.nurseHere||stage>=5)person(740,280,'nurse','left');
 else {c.save();c.globalAlpha=.8;person(722,216,'nurse','left');c.restore();}
 label('医护',740,309,11);
 const chairPos=state.chair||{x:600,y:370};chair(chairPos.x,chairPos.y);
 person(player.x,player.y,'dad',player.x>445?'left':'right');
 if(holding){
  // Shared hands visibly respond to the hold control; releasing restores both resting arms.
  const dad={x:player.x+19,y:player.y-22},mom={x:438.3,y:271};
  const hand={x:(dad.x+mom.x)/2,y:(dad.y+mom.y)/2-3};
  c.beginPath();c.moveTo(dad.x,dad.y);c.quadraticCurveTo(dad.x+16,hand.y+6,hand.x,hand.y);c.strokeStyle=palette.skin;c.lineWidth=9;c.lineCap='round';c.stroke();
  c.beginPath();c.moveTo(mom.x,mom.y);c.quadraticCurveTo(mom.x-4,hand.y+5,hand.x+3,hand.y);c.lineWidth=10;c.stroke();
  circle(hand.x,hand.y,6,palette.skin);line(hand.x-3,hand.y+1,hand.x+3,hand.y+3,'#dba785',1.2);
  label('♡',hand.x,hand.y-21,15,'#bc926f');
 }
 if(stage===5&&Math.hypot(player.x-targets.head.x,player.y-targets.head.y)<75){
  c.save();c.globalAlpha=.4+.18*Math.sin(t*1.8);label('♡',player.x+28,player.y-68,21,'#be926e');c.restore();
 }
 if(born){
  // Small warm flecks mark the first greeting; no score or health outcome is implied.
  c.save();c.globalAlpha=.4;for(let i=0;i<5;i++){const a=i*1.256+t*.08;circle(525+Math.cos(a)*78,220+Math.sin(a)*48,1.4,'#c9a86e');}c.restore();
 }
 // Lighting is a gentle tint, capped for readability instead of a blackout.
 if(light<65){c.fillStyle=`rgba(59,79,73,${(65-light)*.0014})`;c.fillRect(0,113,W,H-113);}
 // Boundary trim stays separate from the UI narration outside the canvas.
 line(18,537,942,537,'#c5d2bf',1);label('她的意愿 · 你的陪伴 · 医护的照护',480,548,10,'#95a68c');
}
window.BirthScene=Object.freeze({draw,targets,chairZone});
})();
