const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup(){
 const voices=[],timers=new Map();let id=0;
 const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(value){this.value=value;}});
 class AudioContext{
  constructor(){this.currentTime=0;this.destination={};}
  async resume(){}
  createGain(){return {gain:param(),connect(){},disconnect(){}};}
  createOscillator(){const v={frequency:param(),connect(){},disconnect(){},start(t){this.startTime=t},stop(t){this.stopTime=t}};voices.push(v);return v;}
 }
 const sandbox={window:{AudioContext},setInterval:fn=>{timers.set(++id,fn);return id},clearInterval:id=>timers.delete(id)};
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../assets/js/music.js'),'utf8'),sandbox);
 return {m:new sandbox.window.NightMusic(),voices,timers};
}
test('music starts only during play, schedules a score, and cleans up on pause',async()=>{
 const {m,voices,timers}=setup();assert.equal(voices.length,0);
 m.setPlaying(true);await new Promise(setImmediate);assert.equal(timers.size,1);assert.ok(voices.length>=6);
 const count=voices.length;m.context.currentTime=1;[...timers.values()][0]();assert.ok(voices.length>count);
 m.setVolume(.1);assert.equal(m.master.gain.value,.1);
 m.setPlaying(false);assert.equal(timers.size,0);assert.equal(m.voices.size,0);assert.equal(m.master.gain.value,0);
 m.setPlaying(true);await new Promise(setImmediate);assert.equal(timers.size,1);
 m.setEnabled(false);assert.equal(timers.size,0);
 m.setPlaying(false);m.setEnabled(true);await new Promise(setImmediate);assert.equal(timers.size,0);
});
test('rapid toggles never create duplicate music schedulers',async()=>{
 const {m,timers}=setup();m.setPlaying(true);m.setEnabled(false);await new Promise(setImmediate);assert.equal(timers.size,0);
 m.setEnabled(true);m.setPlaying(true);await new Promise(setImmediate);assert.equal(timers.size,1);
 m.setPlaying(false);assert.equal(timers.size,0);
});
