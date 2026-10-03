/* Original procedural night theme: warm pads, a slow arpeggio and a sparse melody.
   All sound is synthesized locally; no media downloads, tracking or samples. */
(() => {
'use strict';
class NightMusic {
  constructor(){
    this.enabled=true;this.playing=false;this.volume=.25;this.context=null;
    this.master=null;this.timer=null;this.voices=new Set();this.step=0;this.next=0;
  }
  setEnabled(enabled){this.enabled=enabled;this.sync();}
  setPlaying(playing){this.playing=playing;this.sync();}
  setVolume(value){this.volume=Math.max(0,Math.min(1,value));if(this.master&&this.enabled&&this.playing)this.master.gain.setTargetAtTime(this.volume,this.context.currentTime,.08);}
  async sync(){
    if(!this.enabled||!this.playing){this.stop();return;}
    try{
      if(!this.context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('Audio unavailable');this.context=new Audio();this.master=this.context.createGain();this.master.gain.value=0;this.master.connect(this.context.destination);}
      await this.context.resume();
      if(!this.enabled||!this.playing)return;
      if(this.timer!==null)return;
      this.master.gain.cancelScheduledValues(this.context.currentTime);
      this.master.gain.setTargetAtTime(this.volume,this.context.currentTime,.12);
      this.step=0;this.next=this.context.currentTime+.08;
      this.schedule();this.timer=setInterval(()=>this.schedule(),120);
    }catch{this.enabled=false;this.stop();if(this.onUnavailable)this.onUnavailable();}
  }
  stop(){
    if(this.timer!==null){clearInterval(this.timer);this.timer=null;}
    if(!this.context)return;
    const now=this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);this.master.gain.setTargetAtTime(0,now,.02);
    for(const voice of this.voices){try{voice.stop(now+.09);}catch{}}
    this.voices.clear();
  }
  note(midi,time,length,volume,type='sine'){
    const ctx=this.context,o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type;o.frequency.value=440*Math.pow(2,(midi-69)/12);
    g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(volume,time+.09);
    g.gain.exponentialRampToValueAtTime(.0001,time+length);
    o.connect(g);g.connect(this.master);this.voices.add(o);
    o.onended=()=>{this.voices.delete(o);o.disconnect();g.disconnect();};
    o.start(time);o.stop(time+length+.05);
  }
  schedule(){
    // Eight bars at 64 BPM, two steps per beat. Cmaj7 – Am7 – Fmaj7 – G6.
    const chords=[[48,55,59,64],[45,52,55,60],[41,48,52,57],[43,50,55,59]];
    const melody=[76,null,74,null,71,null,67,null,72,null,71,null,69,null,67,null,
      72,null,76,null,74,null,72,null,71,null,69,null,67,null,null,null,
      69,null,72,null,76,null,72,null,69,null,67,null,64,null,67,null,
      71,null,74,null,72,null,71,null,67,null,69,null,71,null,null,null];
    const beat=60/64/2;
    while(this.next<this.context.currentTime+.35){
      const i=this.step%64,chord=chords[Math.floor(i/16)],t=this.next;
      if(i%16===0)for(const n of chord)this.note(n,t,beat*15,.027);
      this.note(chord[[0,2,1,3,2,1,3,1][i%8]]+12,t,1.35,.035);
      if(melody[i]!==null)this.note(melody[i],t,1.8,.06);
      this.next+=beat;this.step++;
    }
  }
}
window.NightMusic=NightMusic;
})();
