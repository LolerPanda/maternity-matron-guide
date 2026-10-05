const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SAVE_KEY = 'dad-birth-journey-v1';
const PHOTO_KEY = 'dad-birth-photo-v1';
const CLOCK = Date.parse('2026-10-05T12:34:56.000Z');
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jpK0AAAAASUVORK5CYII=';

// Exercise the actual three scripts together. This DOM/canvas adapter only
// substitutes browser primitives; capture still has to draw and encode a card.
function setup(options = {}) {
  const nodes = new Map(), events = {}, cards = [], sceneDraws = [];
  const storage = options.storage || new Map();
  let now = 0, raf, failEncoding = !!options.failEncoding;

  function element(tag = 'div', id = '') {
    const handlers = {}, children = [];
    const e = {
      tagName: tag.toUpperCase(), id, children, disabled: false, open: false,
      hidden: false, textContent: '', style: {}, dataset: {}, attributes: {}, value: '',
      setAttribute(k, value) {
        this.attributes[k] = String(value);
        if (k === 'class') this.classes = new Set(String(value).split(/\s+/));
        else if (k === 'hidden' || k === 'disabled') this[k] = true;
        else this[k] = String(value);
      },
      getAttribute(k) { return this.attributes[k] ?? null; },
      focus(options) { this.focusOptions = options; },
      scrollIntoView() {}, showModal() { this.open = true; }, close() { this.open = false; },
      addEventListener(k, fn) { handlers[k] = fn; },
      fire(k, event) { handlers[k]?.(event); },
      append(child) { children.push(child); },
      querySelector(selector) { return children.find(child => matches(child, selector)) || null; },
      getBoundingClientRect() { return {left: 0, top: 0, width: 960, height: 560}; },
      setPointerCapture(id) { this.capture = id; },
      hasPointerCapture(id) { return this.capture === id; },
      releasePointerCapture() { this.capture = null; }
    };
    e.classes = new Set();
    e.classList = {toggle(name, enabled) { if (enabled) e.classes.add(name); else e.classes.delete(name); }};
    Object.defineProperty(e, 'innerHTML', {
      get() { return this.html || ''; },
      set(html) {
        this.html = html;
        for (const child of children) if (child.id && nodes.get(child.id) === child) nodes.delete(child.id);
        children.length = 0;
        for (const match of html.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/gi)) {
          const child = element(match[1]);
          for (const attr of match[2].matchAll(/([a-z][a-z0-9-]*)(?:="([^"]*)")?/gi)) child.setAttribute(attr[1], attr[2] ?? '');
          if (child.id) nodes.set(child.id, child);
          children.push(child);
        }
      }
    });
    if (tag === 'canvas') {
      const operations = [];
      const context = {};
      for (const method of ['fillRect', 'drawImage', 'fillText']) context[method] = (...args) => operations.push({method, args});
      e.getContext = () => context;
      e.toDataURL = type => {
        assert.equal(type, 'image/png');
        if (failEncoding) throw new Error('canvas encoding unavailable');
        return PNG;
      };
      e.operations = operations;
    }
    if (id) nodes.set(id, e);
    return e;
  }
  function matches(e, selector) {
    if (selector.startsWith('.')) return e.classes.has(selector.slice(1));
    if (selector.startsWith('#')) return e.id === selector.slice(1);
    return e.tagName === selector.toUpperCase();
  }

  for (const id of ['scene', 'music', 'pause', 'restart', 'next', 'phase', 'counter', 'moment-title', 'tip', 'detail', 'chapters', 'speech', 'feedback', 'tools', 'dialog', 'dialog-content', 'save-status', 'keepsake']) element(id === 'scene' ? 'canvas' : 'div', id);
  const game = element('section');
  class Music { setEnabled(value) { this.enabled = value; } setPlaying(value) { this.playing = value; } }
  class DeviceDate extends Date { static now() { return CLOCK + now; } }
  const env = {
    window: {addEventListener: (key, fn) => events[key] = fn},
    NightMusic: Music, Date: DeviceDate,
    BirthScene: {draw(canvas, state, time) { sceneDraws.push({canvas, state: JSON.parse(JSON.stringify(state)), time}); }},
    document: {
      hidden: false,
      getElementById: id => nodes.get(id) || null,
      querySelector: selector => selector === '.game' ? game : null,
      querySelectorAll: () => [],
      addEventListener() {},
      createElement(tag) { const e = element(tag); if (tag === 'canvas') cards.push(e); return e; }
    },
    performance: {now: () => now}, requestAnimationFrame: fn => raf = fn,
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem(key, value) { if (options.rejectWrites) throw new Error('storage denied'); storage.set(key, value); },
      removeItem(key) { if (options.rejectWrites) throw new Error('storage denied'); storage.delete(key); }
    }
  };
  for (const name of ['birth-core.js', 'birth-keepsake.js']) vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/js', name), 'utf8'), env);
  if (!options.storage) {
    const state = {...env.window.BirthJourney.initial(), stage: 6, player: {x: 350, y: 230}, ...options.seed};
    if (options.legacy) for (const key of ['birthStamp', 'phoneOpen', 'phoneFrame', 'photo', 'cuddle']) delete state[key];
    storage.set(SAVE_KEY, JSON.stringify(state));
    if (options.photoCard) storage.set(PHOTO_KEY, JSON.stringify(options.photoCard));
  }
  let code = fs.readFileSync(path.join(__dirname, '../assets/js/birth.js'), 'utf8');
  const anchor = 'hud();if(s.complete)finish();';
  assert.ok(code.includes(anchor), 'the UI test hook must still attach before startup');
  code = code.replace(anchor, 'globalThis.inspect=()=>({s,target,route,keys,paused,photoCard,photoNotice});globalThis.walk=walkTo;' + anchor);
  vm.runInNewContext(code, env);
  if (nodes.get('resume')) nodes.get('resume').onclick();
  return {
    env, nodes, cards, storage, events, sceneDraws, inspect: env.inspect,
    click(id) { const button = nodes.get(id); assert.ok(button, id); if (!button.disabled) button.onclick(); },
    frame(value) { const input = nodes.get('phone-frame'); input.value = String(value); input.oninput({target: input}); },
    failEncoding(value) { failEncoding = value; },
    tick(seconds) { for (let i = 0; i < Math.ceil(seconds * 20); i++) { now += 50; raf(now); } },
    get now() { return CLOCK + now; }
  };
}

function readyForPhoto(options = {}) {
  const g = setup({seed: {elapsed: 27.9}, ...options});
  g.click('phone-toggle');
  g.frame(55);
  g.tick(.2);
  assert.equal(g.inspect().s.born, true);
  assert.equal(g.nodes.get('shutter').disabled, false);
  return g;
}

test('starting a cuddle or opening the phone cancels every pending walking command', () => {
  const g = setup();
  g.env.walk({x: 760, y: 435});
  assert.ok(g.inspect().route.length);
  g.click('cuddle');
  assert.equal(g.inspect().s.cuddle, true);
  assert.equal(g.inspect().target, null);
  assert.equal(g.inspect().route.length, 0);
  const position = JSON.stringify(g.inspect().s.player);
  g.tick(2);
  assert.equal(JSON.stringify(g.inspect().s.player), position);
  assert.equal(g.inspect().s.cuddle, true);
  g.env.walk({x: 760, y: 435});
  g.click('phone-toggle');
  assert.equal(g.inspect().s.phoneOpen, true);
  assert.equal(g.inspect().s.cuddle, false);
  assert.equal(g.inspect().target, null);
  assert.equal(g.inspect().route.length, 0);
  g.tick(2);
  assert.equal(JSON.stringify(g.inspect().s.player), position);
});

test('aligned framing before birth still waits, then a UI capture builds a downloadable PNG card', () => {
  const g = setup({seed: {elapsed: 27}});
  g.click('phone-toggle');
  g.frame(55);
  assert.equal(g.nodes.get('shutter').disabled, true);
  assert.match(g.nodes.get('phone-status').textContent, /等待宝宝出生/);
  g.click('shutter');
  assert.equal(g.cards.length, 0);
  assert.equal(g.inspect().s.photo, null);
  g.tick(1.1);
  assert.equal(g.nodes.get('shutter').disabled, false);
  g.click('shutter');
  const card = g.nodes.get('keepsake');
  assert.equal(card.hidden, false);
  assert.equal(card.querySelector('img').src, PNG);
  assert.equal(card.querySelector('a').href, PNG);
  assert.equal(card.querySelector('a').download, '迎接你-出生纪念.png');
  assert.equal(g.cards.length, 1);
  assert.equal(g.cards[0].width, 960);
  assert.equal(g.cards[0].height, 800);
  const operations = g.cards[0].operations;
  assert.ok(operations.some(op => op.method === 'drawImage' && op.args[0] === g.nodes.get('scene')));
  const expectedTime = g.env.window.BirthKeepsake.format(g.inspect().s.birthStamp);
  assert.ok(operations.some(op => op.method === 'fillText' && op.args[0] === expectedTime));
  assert.ok(operations.some(op => op.method === 'fillText' && /非真实医疗记录/.test(op.args[0])));
});

test('retakes and a reload preserve the birth time while matching the latest captured card', () => {
  const g = readyForPhoto();
  g.click('shutter');
  const birthStamp = g.inspect().s.birthStamp, firstCapture = g.inspect().s.photo.capturedAt;
  g.tick(3);
  g.click('shutter');
  assert.equal(g.inspect().s.birthStamp, birthStamp);
  assert.ok(g.inspect().s.photo.capturedAt > firstCapture);
  assert.equal(g.inspect().s.photo.birthStamp, birthStamp);
  const latestCapture = g.inspect().s.photo.capturedAt;
  const restored = setup({storage: g.storage});
  assert.equal(restored.inspect().s.birthStamp, birthStamp);
  assert.equal(restored.inspect().s.photo.capturedAt, latestCapture);
  assert.equal(restored.nodes.get('keepsake').querySelector('a').href, PNG);
  restored.tick(3);
  assert.equal(restored.inspect().s.birthStamp, birthStamp);
});

test('denied browser storage still leaves the freshly generated card available for immediate download', () => {
  const g = readyForPhoto({rejectWrites: true});
  g.click('shutter');
  assert.ok(g.inspect().s.photo);
  assert.equal(g.storage.has(PHOTO_KEY), false);
  assert.equal(g.nodes.get('keepsake').querySelector('a').href, PNG);
  assert.match(g.nodes.get('keepsake').querySelector('.photo-notice').textContent, /请现在.*保存到设备/);
  assert.match(g.nodes.get('save-status').textContent, /未允许保存/);
});

test('a canvas encoding error remains visible across frames and a successful retry clears it', () => {
  const g = readyForPhoto({failEncoding: true});
  g.click('shutter');
  assert.equal(g.inspect().s.photo, null);
  assert.match(g.nodes.get('phone-status').textContent, /暂时无法生成图片/);
  g.tick(.5);
  assert.match(g.nodes.get('phone-status').textContent, /暂时无法生成图片/);
  assert.equal(g.nodes.get('keepsake').querySelector('a'), null);
  g.failEncoding(false);
  g.click('shutter');
  g.tick(.2);
  assert.ok(g.inspect().s.photo);
  assert.equal(g.nodes.get('keepsake').querySelector('a').href, PNG);
  assert.doesNotMatch(g.nodes.get('phone-status').textContent, /无法生成图片/);
  assert.match(g.nodes.get('phone-status').textContent, /纪念截图已拍下/);
});

test('completion includes the saved card and restarting removes its image and record from this playthrough', () => {
  const photo = {birthStamp: CLOCK - 5000, capturedAt: CLOCK - 1000};
  const g = setup({
    seed: {
      stage: 11, elapsed: 20, time: 200, born: true, witness: 1, contact: true,
      birthStamp: photo.birthStamp, photo, complete: true, recorded: true,
      called: true, confirmed: true, read: ['mother', 'baby'], hand: 4, rest: 3
    },
    photoCard: {...photo, image: PNG}
  });
  const finalCard = g.nodes.get('final-photo');
  assert.ok(finalCard);
  assert.equal(g.nodes.get('dialog').open, true);
  assert.equal(finalCard.querySelector('img').src, PNG);
  assert.equal(finalCard.querySelector('a').href, PNG);
  assert.match(g.nodes.get('dialog-content').innerHTML, /adventure\.html\?chapter=handover/);
  g.click('again');
  assert.equal(g.nodes.get('dialog').open, false);
  assert.equal(g.inspect().s.stage, 0);
  assert.equal(g.inspect().s.photo, null);
  assert.equal(g.inspect().s.birthStamp, null);
  assert.equal(g.inspect().photoCard, null);
  assert.equal(g.storage.has(PHOTO_KEY), false);
  assert.equal(g.nodes.get('keepsake').hidden, true);
  assert.equal(g.nodes.get('keepsake').querySelector('img'), null);
  const reloaded = setup({storage: g.storage});
  assert.equal(reloaded.inspect().s.photo, null);
  assert.equal(reloaded.nodes.get('keepsake').querySelector('a'), null);
});

test('an already-born legacy save clearly explains its missing timestamp and disables photography', () => {
  const g = setup({legacy: true, seed: {born: true, witness: 1, elapsed: 29}});
  g.click('phone-toggle');
  g.frame(55);
  g.tick(1);
  assert.equal(g.inspect().s.birthStamp, null);
  assert.match(g.nodes.get('phone-status').textContent, /旧进度没有保存出生时刻/);
  assert.equal(g.nodes.get('shutter').disabled, true);
  assert.equal(g.nodes.get('next').disabled, false, 'missing historical time must not block the story');
  assert.equal(g.cards.length, 0);
});

test('keepsake matching rejects another birth, an older retake and invalid image payloads', () => {
  const g = setup(), K = g.env.window.BirthKeepsake;
  const photo = {birthStamp: CLOCK, capturedAt: CLOCK + 1000};
  const card = {...photo, image: PNG};
  assert.equal(K.matches(card, photo), true);
  for (const wrong of [
    null, {...card, birthStamp: CLOCK - 1}, {...card, capturedAt: CLOCK + 999},
    {...card, image: 'https://example.com/photo.png'},
    {...card, image: 'data:image/svg+xml;base64,PHN2Zz4='},
    {...card, image: 'data:image/png;base64,'},
    {...card, image: 'data:image/png;base64,<script>'},
    {...card, image: 'data:image/png;base64,' + 'A'.repeat(2000000)}
  ]) assert.equal(K.matches(wrong, photo), false);
  assert.equal(K.matches(card, null), false);
});

test('an unrelated saved image is not displayed under the current birth record', () => {
  const photo = {birthStamp: CLOCK - 5000, capturedAt: CLOCK - 1000};
  const g = setup({
    seed: {born: true, witness: 1, elapsed: 29, birthStamp: photo.birthStamp, photo},
    photoCard: {...photo, capturedAt: photo.capturedAt - 1, image: PNG}
  });
  assert.equal(g.inspect().photoCard, null);
  assert.equal(g.nodes.get('keepsake').querySelector('img'), null);
  assert.equal(g.nodes.get('keepsake').querySelector('a'), null);
  assert.match(g.nodes.get('keepsake').innerHTML, /出生时刻仍在/);
});
