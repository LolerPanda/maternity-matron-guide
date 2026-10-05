const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const BIRTH_TIME = Date.parse('2026-10-05T12:34:56.789Z');
const PHOTO_TIME = BIRTH_TIME + 12000;

function engine() {
  const context = {window: {}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/js/birth-core.js'), 'utf8'), context);
  return context.window.BirthJourney;
}

function beforeBirth(G) {
  return {...G.initial(), stage: 6, elapsed: 27.75, time: 60, player: {x: 350, y: 230}};
}

function born(G) {
  let state = beforeBirth(G);
  state = G.tick(state, .1, BIRTH_TIME - 200);
  state = G.tick(state, .1, BIRTH_TIME - 100);
  return G.tick(state, .1, BIRTH_TIME);
}

function framed(G, state, frame = 55) {
  return G.act(G.act(state, 'phone', true), 'frame', frame);
}

test('the birth event locks the supplied device time exactly once', () => {
  const G = engine();
  let state = beforeBirth(G);
  assert.equal(state.birthStamp, null);
  state = G.tick(state, .1, BIRTH_TIME - 200);
  state = G.tick(state, .1, BIRTH_TIME - 100);
  assert.equal(state.born, false);
  assert.equal(state.birthStamp, null, 'the clock must not be recorded before the birth event');
  state = G.tick(state, .1, BIRTH_TIME);
  assert.equal(state.born, true);
  assert.equal(state.birthStamp, BIRTH_TIME);
  state = G.tick(state, .1, BIRTH_TIME + 60000);
  assert.equal(state.birthStamp, BIRTH_TIME, 'waiting in the birth moment does not move the timestamp');
  state = G.tick(G.next(state), .1, BIRTH_TIME + 120000);
  assert.equal(state.stage, 7);
  assert.equal(state.birthStamp, BIRTH_TIME);
});

test('other stages and optional interactions do not cause an early birth event', () => {
  const G = engine();
  let state = {...G.initial(), stage: 5, elapsed: 100};
  state = G.tick(state, .1, BIRTH_TIME);
  assert.equal(state.born, false);
  assert.equal(state.birthStamp, null);
  state = {...beforeBirth(G), elapsed: 0};
  state = G.act(state, 'phone', true);
  state = G.act(state, 'frame', 55);
  state = G.act(state, 'capture', PHOTO_TIME);
  state = G.act(state, 'cuddle', true);
  assert.equal(state.born, false);
  assert.equal(state.birthStamp, null);
  assert.equal(state.photo, null);
  assert.equal(G.ready(state), false);
});

test('omitting the device clock preserves narrative progression without inventing a timestamp', () => {
  const G = engine();
  let state = {...beforeBirth(G), elapsed: 27.95};
  state = G.tick(state, .1);
  assert.equal(state.born, true);
  assert.equal(state.birthStamp, null);
  assert.equal(G.ready(state), true);
  state = G.tick(state, .1, BIRTH_TIME);
  assert.equal(state.birthStamp, null, 'a later clock reading is not evidence of the prior event time');
});

test('phone interactions are limited to the birth and immediate greeting moments', () => {
  const G = engine();
  for (const stage of [6, 7]) {
    let state = {...born(G), stage, held: true, cuddle: true};
    state = G.act(state, 'phone', true);
    assert.equal(state.phoneOpen, true);
    assert.equal(state.held, false);
    assert.equal(state.cuddle, false);
    state = G.act(state, 'phone', false);
    assert.equal(state.phoneOpen, false);
  }
  assert.equal(G.act(G.initial(), 'phone', true).phoneOpen, false);
  assert.equal(G.act({...born(G), stage: 8, contact: true}, 'phone', true).phoneOpen, false);
});

test('capturing a keepsake requires birth, a recorded birth time, an open phone and valid framing', () => {
  const G = engine();
  const start = born(G);
  assert.equal(G.act(start, 'capture', PHOTO_TIME).photo, null, 'a closed phone cannot take a photo');
  assert.equal(G.act(framed(G, {...start, birthStamp: null}), 'capture', PHOTO_TIME).photo, null);
  assert.equal(G.act(framed(G, beforeBirth(G)), 'capture', PHOTO_TIME).photo, null);
  for (const invalidTime of [BIRTH_TIME - 1, NaN, Infinity, 'later']) {
    assert.equal(G.act(framed(G, start), 'capture', invalidTime).photo, null);
  }
  for (const frame of [0, 44, 66, 100]) {
    assert.equal(G.act(framed(G, start, frame), 'capture', PHOTO_TIME).photo, null, `frame ${frame}`);
  }
  for (const frame of [45, 55, 65]) {
    const state = G.act(framed(G, start, frame), 'capture', PHOTO_TIME);
    assert.ok(state.photo, `frame ${frame} includes the intended view`);
    assert.equal(state.photo.birthStamp, BIRTH_TIME);
    assert.equal(state.photo.capturedAt, PHOTO_TIME);
    assert.equal(state.birthStamp, BIRTH_TIME, 'photo time never replaces the birth time');
  }
});

test('cuddling requires being beside her and cannot coexist with holding the phone or hand', () => {
  const G = engine();
  let state = {...beforeBirth(G), player: {x: 750, y: 450}};
  state = G.act(state, 'cuddle', true);
  assert.equal(state.cuddle, false);
  for (const stage of [6, 7]) {
    let nearby = {...born(G), stage, phoneOpen: true, held: true};
    nearby = G.act(nearby, 'cuddle', true);
    assert.equal(nearby.cuddle, true);
    assert.equal(nearby.phoneOpen, false);
    assert.equal(nearby.held, false);
    nearby = G.act(nearby, 'cuddle', false);
    assert.equal(nearby.cuddle, false);
  }
  assert.equal(G.act({...G.initial(), player: {x: 350, y: 230}}, 'cuddle', true).cuddle, false);
  assert.equal(G.act({...born(G), stage: 8, contact: true}, 'cuddle', true).cuddle, false);
});

test('moving away ends a cuddle without erasing the birth record', () => {
  const G = engine();
  let state = G.act(born(G), 'cuddle', true);
  state = G.act(state, 'move', {x: 300, y: 430});
  assert.equal(state.cuddle, false);
  assert.equal(state.player.x, 300);
  assert.equal(state.player.y, 430);
  assert.equal(state.birthStamp, BIRTH_TIME);
});

test('advancing closes optional interactions while preserving the keepsake', () => {
  const G = engine();
  let state = G.act(framed(G, born(G)), 'capture', PHOTO_TIME);
  const photo = JSON.stringify(state.photo);
  const nextWithPhone = G.next(state);
  assert.equal(nextWithPhone.stage, 7);
  assert.equal(nextWithPhone.phoneOpen, false);
  assert.equal(nextWithPhone.cuddle, false);
  assert.equal(JSON.stringify(nextWithPhone.photo), photo);
  state = G.act(state, 'cuddle', true);
  const nextWithCuddle = G.next(state);
  assert.equal(nextWithCuddle.cuddle, false);
  assert.equal(nextWithCuddle.held, false);
  assert.equal(JSON.stringify(nextWithCuddle.photo), photo);
});

test('photography and cuddling remain optional for the established progression', () => {
  const G = engine();
  let state = born(G);
  assert.equal(state.photo, null);
  assert.equal(state.cuddle, false);
  assert.equal(G.ready(state), true);
  state = G.next(state);
  state = {...state, elapsed: 8.1};
  state = G.act(state, 'contact');
  assert.equal(state.photo, null);
  assert.equal(G.ready(state), true);
  assert.equal(G.next(state).stage, 8);
});

test('current saves restore their original event and photo timestamps without rewriting them', () => {
  const G = engine();
  const state = G.act(framed(G, born(G)), 'capture', PHOTO_TIME);
  const restored = G.restore(JSON.parse(JSON.stringify(state)));
  assert.ok(restored);
  assert.ok(G.valid(restored));
  assert.equal(restored.birthStamp, BIRTH_TIME);
  assert.equal(restored.photo.birthStamp, BIRTH_TIME);
  assert.equal(restored.photo.capturedAt, PHOTO_TIME);
  const later = G.tick(restored, .1, PHOTO_TIME + 3600000);
  assert.equal(later.birthStamp, BIRTH_TIME);
  assert.equal(later.photo.capturedAt, PHOTO_TIME);
});

test('legacy saves migrate without inventing an already-born baby timestamp or keepsake', () => {
  const G = engine();
  // Freeze the former version-1 shape, rather than copying unknown new fields.
  const legacy = {
    version: 1, stage: 7, elapsed: 2, time: 80,
    player: {x: 350, y: 230}, chair: {x: 225, y: 450},
    light: 45, curtain: 100, born: true, contact: false,
    blanket: 10, nurseHere: true, witness: 1, held: false,
    hand: 4, rest: 3, read: [], called: false, confirmed: false,
    recorded: false, complete: false
  };
  const restored = G.restore(JSON.parse(JSON.stringify(legacy)));
  assert.ok(restored);
  assert.ok(G.valid(restored));
  assert.equal(restored.stage, legacy.stage);
  assert.equal(restored.born, true);
  assert.equal(restored.birthStamp, null);
  assert.equal(restored.photo, null);
  assert.equal(restored.phoneOpen, false);
  assert.equal(restored.cuddle, false);
  assert.equal(G.tick(restored, .1, BIRTH_TIME).birthStamp, null);
  const sameMoment = G.restore({...legacy, stage: 6, elapsed: 29});
  assert.equal(G.tick(sameMoment, .1, BIRTH_TIME).birthStamp, null, 'revisiting the old birth moment must not synthesize a time');
  assert.equal(G.act(framed(G, restored), 'capture', PHOTO_TIME).photo, null);
});

test('legacy saves from before birth can record the actual later event time', () => {
  const G = engine();
  const legacy = {
    version: 1, stage: 6, elapsed: 27.95, time: 80,
    player: {x: 350, y: 230}, chair: {x: 225, y: 450},
    light: 45, curtain: 100, born: false, contact: false,
    blanket: 10, nurseHere: true, witness: 27.95 / 28, held: false,
    hand: 4, rest: 3, read: [], called: false, confirmed: false,
    recorded: false, complete: false
  };
  const restored = G.restore(legacy);
  assert.ok(restored);
  assert.equal(restored.birthStamp, null);
  const state = G.tick(restored, .1, BIRTH_TIME);
  assert.equal(state.birthStamp, BIRTH_TIME);
  assert.equal(state.born, true);
});

test('malformed time records are rejected instead of silently becoming a trusted keepsake', () => {
  const G = engine(), state = born(G);
  for (const invalid of [
    {...state, birthStamp: '2026-10-05'},
    {...state, birthStamp: NaN},
    {...state, birthStamp: Infinity},
    {...state, photo: {birthStamp: BIRTH_TIME, capturedAt: 'later'}},
    {...state, photo: {birthStamp: BIRTH_TIME + 1, capturedAt: PHOTO_TIME}}
  ]) assert.equal(Boolean(G.restore(invalid)), false, JSON.stringify(invalid));
});
