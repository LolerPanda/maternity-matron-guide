/* Shared renderer for both entry pages. No network calls or runtime dependencies. */
(() => {
'use strict';
const {sources,chapters,scenes,checks,ui:L}=window.DAD_QUEST_LOCALE;
const key='dad-quest-v1';
const english=document.documentElement.lang==='en';
let storageOK=true;
let state={answers:{},checks:[]};
try {
  const saved=JSON.parse(localStorage.getItem(key));
  if(saved&&saved.answers&&typeof saved.answers==='object'&&Array.isArray(saved.checks)){
    for(const [i,a] of Object.entries(saved.answers)){
      if(/^(?:[0-9]|1[01])$/.test(i)&&Number.isInteger(a)&&a>=0&&a<3)state.answers[i]=a;
    }
    state.checks=[...new Set(saved.checks.filter(i=>Number.isInteger(i)&&i>=0&&i<checks.length))];
  }
}catch {storageOK=false;}
let current=0;
let reviewQueue=[];
const app=document.querySelector('#app');
const modal=document.querySelector('#modal');
const $=s=>document.querySelector(s);
const count=()=>Object.keys(state.answers).length;
const completed=c=>[c*3,c*3+1,c*3+2].filter(i=>state.answers[i]!==undefined).length;
const sourceLink=k=>`<a target="_blank" rel="noopener noreferrer" href="${sources[k][1]}">${sources[k][0]} ↗</a>`;
const needsReview=()=>scenes.map((s,i)=>({s,i})).filter(({s,i})=>state.answers[i]!==undefined&&state.answers[i]!==s.best);
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{storageOK=false;}}
function route(view='home',value=''){
  const hash=view==='home'?'':`#${view}=${value}`;
  // Entry pages remain directly openable from disk; navigation never requires a server router.
  try {history.replaceState(null,'',location.pathname+location.search+hash);}catch{}
  $('#language-switch').href=(english?'index.html':'en.html')+hash;
}
function top(){window.scrollTo(0,0);}
function home(){
  reviewQueue=[];route();
  app.innerHTML=`<section class="hero"><div><div class="eyebrow"><span class="dot"></span>${L.eyebrow}</div><h1>${L.heroTitle}</h1><p>${L.intro}</p><div class="hero-actions"><button class="primary" id="start">${count()===12?L.viewResults:count()?L.resume:L.start}<span>→</span></button><span class="micro">${L.duration}</span></div></div><div class="art"><img src="assets/images/family.svg" alt="${L.artAlt}" width="580" height="410"><div class="art-label">${L.artLabel}</div></div></section>
  <section class="progress-panel"><div class="progress-icon" aria-hidden="true">✧</div><div class="progress-copy"><strong>${count()===12?L.progressDone:L.progressTitle}</strong><p>${count()?L.welcome:L.newStart}</p></div><div class="progress-track"><div class="track-top"><span>${L.journey}</span><span>${count()} / 12 ${L.scenarios}</span></div><div class="track"><i style="width:${count()/12*100}%"></i></div></div></section>
  <section><div class="section-top"><div><h2>${L.map}</h2><p>${L.mapIntro}</p></div><span>YOUR NEXT CHAPTER</span></div><div class="chapters">${chapters.map((c,i)=>`<button class="chapter ${completed(i)>0&&completed(i)<3||!count()&&i===0?'current':''}" data-chapter="${i}"><div class="chapter-top">CHAPTER 0${i+1}<span class="pill">${completed(i)===3?L.complete:c.time}</span></div><div class="chapter-icon" aria-hidden="true">${c.icon}</div><h3>${c.name}</h3><p>${c.desc.replace('\n','<br>')}</p><div class="chapter-bottom"><span>${completed(i)} / 3 ${L.scenarios}${completed(i)===3?' · '+L.again:''}</span><span>↗</span></div></button>`).join('')}</div></section>
  <div class="note"><b aria-hidden="true">♡</b>${L.disclaimer}</div>${!storageOK?`<p class="storage-warning" role="status">${L.storageWarning}</p>`:''}`;
  $('#start').onclick=()=>count()===12?results():play(scenes.findIndex((_,i)=>state.answers[i]===undefined));
  document.querySelectorAll('[data-chapter]').forEach(b=>b.onclick=()=>{
    const c=Number(b.dataset.chapter);
    play([c*3,c*3+1,c*3+2].find(i=>state.answers[i]===undefined)??c*3);
  });top();
}
function play(i){
  current=i;route('scene',i);
  const s=scenes[i],c=chapters[Math.floor(i/3)],a=state.answers[i];
  app.innerHTML=`<section class="game"><div class="game-nav"><button class="text-button" id="back">← ${L.map}</button><span>${reviewQueue.length?L.reviewMode:c.name} · ${i%3+1} / 3</span></div><div class="track"><i style="width:${(i%3+1)/3*100}%"></i></div><article class="scene"><div class="scene-head"><span class="emoji" aria-hidden="true">${c.icon}</span><div><small>${s.place}</small><h2>${s.title}</h2></div></div><div class="scene-body"><p class="story">${s.story}</p><p class="question">${L.question}</p><div class="options">${s.options.map((o,j)=>`<button class="option ${a!==undefined?(j===s.best?'correct':j===a?'chosen':''):''}" data-answer="${j}" ${a!==undefined?'disabled':''}><span>${'ABC'[j]}</span>${o}</button>`).join('')}</div><div id="feedback" aria-live="polite">${a!==undefined?feedback(i,a):''}</div></div></article><p class="micro" style="text-align:center;margin-top:20px">${L.noTimer}</p></section>`;
  $('#back').onclick=home;
  document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.answer)));
  wireNext();top();
}
function feedback(i,a){
  const s=scenes[i];
  return `<div class="feedback"><h3>${a===s.best?L.good:L.rethink}</h3><p>${s.why}</p>${a!==s.best?`<p><strong>${L.better}</strong>${s.options[s.best]}</p>`:''}<p class="action"><strong>${L.action}</strong><br>${s.action}</p>${sourceLink(s.source)}</div><div class="next-row"><span class="badge">${i%3===2?L.chapterDone:L.saved}</span><button class="primary" id="next">${reviewQueue.length?(reviewQueue.some(j=>state.answers[j]===undefined)?L.next:L.reviewDone):i%3===2?L.harvest:L.next}<span>→</span></button></div>`;
}
function answer(a){
  if(state.answers[current]!==undefined)return;
  state.answers[current]=a;save();
  document.querySelectorAll('[data-answer]').forEach(b=>{
    b.disabled=true;const j=Number(b.dataset.answer);
    b.classList.add(j===scenes[current].best?'correct':j===a?'chosen':'unselected');
  });
  $('#feedback').innerHTML=feedback(current,a);wireNext();
  $('#feedback').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
}
function wireNext(){
  const b=$('#next');if(!b)return;
  b.onclick=()=>{
    if(reviewQueue.length){const i=reviewQueue.find(j=>state.answers[j]===undefined);if(i!==undefined)play(i);else{reviewQueue=[];results();}}
    else if(current%3===2)chapterEnd(Math.floor(current/3));
    else play(current+1);
  };
}
function takeaways(items){return items.map(s=>`<details><summary>${s.title}</summary><p>${s.why}</p><p>${s.action}</p>${sourceLink(s.source)}</details>`).join('');}
function chapterEnd(c){
  route('chapter',c);
  app.innerHTML=`<section class="results"><div class="celebration-icon" aria-hidden="true">${chapters[c].icon}</div><div class="eyebrow centered">CHAPTER 0${c+1} · ${completed(c)}/3 ${L.practiced}</div><h1>${completed(c)===3?L.unlocked+chapters[c].badge:L.keepLearning}</h1><p>${L.chapterMessage}</p><div class="review">${scenes.slice(c*3,c*3+3).map(s=>`<details open><summary>${s.title}</summary><p>${s.action}</p></details>`).join('')}</div><button class="primary" id="continue">${count()===12?L.viewResults:L.continue} →</button> <button class="text-button" id="map">${L.map}</button></section>`;
  $('#continue').onclick=()=>count()===12?results():play(scenes.findIndex((_,i)=>state.answers[i]===undefined));
  $('#map').onclick=home;top();
}
function results(){
  route('results');const needs=needsReview();
  app.innerHTML=`<section class="results"><div class="celebration-icon" aria-hidden="true">🌿</div><div class="eyebrow centered">A NEW CHAPTER BEGINS</div><h1>${L.resultTitle}</h1><p>${L.resultIntro}</p><div class="result-grid"><div><strong>${count()}</strong>${L.practicedScenarios}</div><div><strong>${chapters.filter((_,i)=>completed(i)===3).length}</strong>${L.badges}</div><div><strong>${needs.length}</strong>${L.toReview}</div></div><button class="primary" id="review-start">${needs.length?L.review:L.restart} →</button> <button class="text-button" id="map">${L.map}</button><div class="review"><h3>${needs.length?L.reviewPocket:L.takeHome}</h3>${takeaways(needs.length?needs.map(({s})=>s):scenes)}</div><p class="micro">${L.resultNote}</p></section>`;
  $('#map').onclick=home;
  $('#review-start').onclick=()=>{
    if(needs.length){reviewQueue=needs.map(({i})=>i);reviewQueue.forEach(i=>delete state.answers[i]);save();play(reviewQueue[0]);}
    else{state.answers={};save();play(0);}
  };top();
}
function showModal(html){$('#modal-content').innerHTML=html;modal.showModal();}
$('#handbook').onclick=()=>{
  showModal(`<h2>${L.handbookTitle}</h2><p>${L.handbookIntro}</p>${checks.map((s,i)=>`<label class="check"><input type="checkbox" data-check="${i}" ${state.checks.includes(i)?'checked':''}>${s}</label>`).join('')}<h3>${L.urgentTitle}</h3><div class="emergency"><p>${L.urgentBody}</p><p>${L.urgentNote}</p>${sourceLink('warning')}</div>`);
  document.querySelectorAll('[data-check]').forEach(b=>b.onchange=()=>{const i=Number(b.dataset.check);state.checks=state.checks.filter(x=>x!==i);if(b.checked)state.checks.push(i);save();});
};
$('#sources').onclick=()=>showModal(`<h2>${L.aboutTitle}</h2><p>${L.aboutBody}</p><p>${L.aboutMedical}</p><h3>${L.references}</h3><ul>${Object.keys(sources).map(k=>`<li>${sourceLink(k)}</li>`).join('')}</ul><h3>${L.privacyTitle}</h3><p>${L.privacy}</p>`);
$('.close').onclick=()=>modal.close();
modal.onclick=e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}};
$('.brand').onclick=e=>{e.preventDefault();home();};
// Locale entry pages use stable scene IDs; saved choices remain shared across languages.
function restoreRoute(){
  const match=location.hash.match(/^#(scene|chapter|results)=(\d*)$/);
  if(match){const n=Number(match[2]);if(match[1]==='scene'&&n>=0&&n<12){play(n);return;}if(match[1]==='chapter'&&n>=0&&n<4){chapterEnd(n);return;}if(match[1]==='results'){results();return;}}
  home();
}
restoreRoute();
window.addEventListener('hashchange',restoreRoute);
})();
