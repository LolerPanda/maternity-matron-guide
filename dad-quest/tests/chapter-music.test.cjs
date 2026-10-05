const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');

// Run the real chapter scripts with a small DOM and audio scheduler double.
function chapter(name){
 const timers=new Set(),elements=new Map();let timerID=0,contexts=0;
 function surface(){const events=new Map();return {
  addEventListener(type,fn){if(!events.has(type))events.set(type,new Set());events.get(type).add(fn);},
  removeEventListener(type,fn){events.get(type)?.delete(fn);},
  emit(type,event={}){for(const fn of [...(events.get(type)||[])])fn({type,...event});}
 };}
 function element(id){if(!elements.has(id)){const e=Object.assign(surface(),{
  style:{},dataset:{},open:false,textContent:'',innerHTML:'',attributes:{},
  setAttribute(k,v){this.attributes[k]=v;},querySelectorAll(){return[];},
  querySelector(){return null;},classList:{add(){},remove(){},toggle(){}},
  showModal(){this.open=true;},close(){this.open=false;this.emit('close');},
  getContext(){return{};},scrollIntoView(){},focus(){}
 });elements.set(id,e);}return elements.get(id);}
 const document=Object.assign(surface(),{hidden:false,getElementById:element,querySelector:element,querySelectorAll(){return[];}});
 const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(){}});
 class AudioContext{
  constructor(){contexts++;this.currentTime=0;this.destination={};}
  async resume(){}
  createGain(){return{gain:param(),connect(){},disconnect(){}};}
  createOscillator(){return{frequency:param(),connect(){},disconnect(){},start(){},stop(){}};}
 }
 const store=new Map();
 const env=Object.assign(surface(),{document,AudioContext,location:{search:'?chapter=pack'},URLSearchParams,
  localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},
  requestAnimationFrame(){},performance:{now:()=>0},
  setInterval(){timers.add(++timerID);return timerID;},clearInterval:id=>timers.delete(id)
 });env.window=env;vm.createContext(env);
 const scripts={episodes:['series-data','series-core','music','episodes'],departure:['series-core','departure-core','music','departure'],'beijing-drive':['beijing-drive-core','music','beijing-drive']};
 for(const script of scripts[name])vm.runInContext(fs.readFileSync(path.join(root,'assets/js',script+'.js'),'utf8'),env);
 return{document,env,timers,element,contexts:()=>contexts,click(id){document.emit('pointerdown',{target:{closest:selector=>selector==='#music'&&id==='music'}});element(id).onclick?.();document.emit('click');}};
}
const flush=()=>new Promise(setImmediate);

for(const name of ['episodes','departure']){
 test(`${name}: first action starts default music, mute survives pause and background`,async()=>{
  const c=chapter(name);assert.equal(c.contexts(),0);
  c.document.hidden=true;c.document.emit('visibilitychange');c.document.hidden=false;c.document.emit('visibilitychange');
  await flush();assert.equal(c.contexts(),0,'visibility alone must not attempt autoplay');
  c.click(name==='episodes'?'rotate':'contact');await flush();assert.equal(c.timers.size,1);
  c.click('pause');assert.equal(c.timers.size,0);
  c.click('resume');await flush();assert.equal(c.timers.size,1);
  c.click('music');assert.equal(c.timers.size,0);assert.equal(c.element('music').attributes['aria-pressed'],'false');
  c.click('pause');c.click('resume');c.document.hidden=true;c.document.emit('visibilitychange');c.document.hidden=false;c.document.emit('visibilitychange');
  await flush();assert.equal(c.timers.size,0,'manual mute must persist within the chapter');
  c.click('music');await flush();assert.equal(c.timers.size,1);
  c.document.hidden=true;c.document.emit('visibilitychange');assert.equal(c.timers.size,0);
  c.env.emit('pagehide');assert.equal(c.timers.size,0);
 });
 test(`${name}: first music-button click mutes before any audio is created`,async()=>{
  const c=chapter(name);c.click('music');await flush();assert.equal(c.contexts(),0);assert.equal(c.element('music').attributes['aria-pressed'],'false');
  c.document.emit('keydown',{key:'Tab'});await flush();assert.equal(c.contexts(),0);
 });
 test(`${name}: a drag gesture unlocks audio, but Escape alone does not`,async()=>{
  const c=chapter(name);c.document.emit('keydown',{key:'Escape'});await flush();assert.equal(c.contexts(),0);
  c.document.emit('pointerdown',{target:{closest:()=>null}});await flush();assert.equal(c.timers.size,1);
 });
}
test('driving: start unlocks music, pause and hidden-page resume remain silent',async()=>{
 const c=chapter('beijing-drive');assert.equal(c.contexts(),0);assert.equal(c.element('modal').open,true);
 c.click('resume');assert.equal(c.contexts(),1,'audio activation occurs inside the start handler');await flush();assert.equal(c.timers.size,1);
 c.click('pause');assert.equal(c.timers.size,0);c.click('resume');await flush();assert.equal(c.timers.size,1);
 c.click('music');c.click('pause');c.click('resume');await flush();assert.equal(c.timers.size,0);
 c.click('music');await flush();assert.equal(c.timers.size,1);
 c.document.hidden=true;c.document.emit('visibilitychange');assert.equal(c.timers.size,0);assert.equal(c.element('modal').open,true);
 c.click('resume');await flush();assert.equal(c.timers.size,0,'hidden pages must remain silent');
});
test('all gameplay entry buttons display default music enabled',()=>{
 for(const name of ['index','labor','adventure','route','drive-beijing']){
  const html=fs.readFileSync(path.join(root,name+'.html'),'utf8');
  assert.match(html,/<button id="music" aria-pressed="true">(?:配乐：|♫ )开<\/button>/,name);
 }
});
