/* A local screenshot of this game's canvas; no camera or screen permissions. */
(() => {'use strict';
const format=stamp=>stamp===null?'旧进度未记录时刻':new Date(stamp).toLocaleString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
function matches(card,photo){return !!(card&&photo&&card.birthStamp===photo.birthStamp&&card.capturedAt===photo.capturedAt&&typeof card.image==='string'&&card.image.length<2000000&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(card.image));}
function capture(scene,photo){
 const card=document.createElement('canvas');card.width=960;card.height=800;const c=card.getContext('2d');
 c.fillStyle='#fcfbf2';c.fillRect(0,0,960,800);c.drawImage(scene,0,0,960,560);
 c.fillStyle='#29443e';c.font='600 32px system-ui, sans-serif';c.fillText('你好，小小的你。',44,614);
 c.font='19px system-ui, sans-serif';c.fillText('本局剧情出生时刻 · 设备本地时间',44,654);
 c.font='600 30px system-ui, sans-serif';c.fillText(format(photo.birthStamp),44,698);
 c.fillStyle='#6f7f70';c.font='16px system-ui, sans-serif';c.fillText('《迎接你》游戏纪念 · 非真实医疗记录',44,750);
 return {...photo,image:card.toDataURL('image/png')};
}
window.BirthKeepsake={format,matches,capture};
})();
