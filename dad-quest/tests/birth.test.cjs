const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function engine() {
  const context = {window: {}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/js/birth-core.js'), 'utf8'), context);
  return context.window.BirthJourney;
}

function wait(G, state, seconds) {
  for (let i = 0; i < Math.ceil(seconds * 10); i++) state = G.tick(state, .1);
  return state;
}

// Follow the same actions available to a player, without assigning progress flags.
function solve(G, state) {
  switch (state.stage) {
    case 0: return G.act(state, 'curtain', 100);
    case 1: return G.act(state, 'light', 45);
    case 2:
      state = G.act(state, 'move', {x: 350, y: 230});
      state = wait(G, G.act(state, 'hand', true), 4.1);
      return wait(G, G.act(state, 'hand', false), 3.1);
    case 3: return G.act(state, 'chair', {x: 225, y: 450});
    case 4: return G.act(state, 'move', {x: 350, y: 230});
    case 5: return wait(G, state, 12.1);
    case 6: return wait(G, state, 28.1);
    case 7: return G.act(wait(G, state, 8.1), 'contact');
    case 8: return G.act(state, 'blanket', 55);
    case 9:
      state = G.act(state, 'band', 'mother');
      state = G.act(state, 'band', 'baby');
      return G.act(state, 'confirm');
    case 10: return wait(G, G.act(state, 'call'), 8.1);
    case 11:
      state = G.act(state, 'move', {x: 760, y: 435});
      state = G.act(state, 'record');
      return G.act(state, 'move', {x: 350, y: 230});
    default: throw new Error(`Unexpected stage ${state.stage}`);
  }
}

function reach(G, stage) {
  let state = G.initial();
  while (state.stage < stage) {
    state = solve(G, state);
    assert.ok(G.ready(state), `stage ${state.stage} should be ready`);
    state = G.next(state);
  }
  return state;
}

test('all twelve moments can be completed through player actions and narrative time', () => {
  const G = engine();
  let state = G.initial();
  assert.equal(G.moments.length, 12);
  for (let stage = 0; stage < 12; stage++) {
    assert.equal(state.stage, stage);
    assert.equal(state.complete, false);
    assert.ok(G.valid(state));
    state = solve(G, state);
    assert.ok(G.ready(state), `moment ${stage} should be ready`);
    state = G.next(state);
  }
  assert.equal(state.stage, 11);
  assert.equal(state.complete, true);
  assert.equal(state.born, true);
  assert.equal(state.contact, true);
  assert.equal(state.confirmed, true);
  assert.equal(state.recorded, true);
  assert.equal(G.tick(state, .1), state);
  assert.equal(G.next(state), state);
  assert.equal(G.act(state, 'curtain', 0), state);
});

test('privacy and lighting require their own correct actions before continuing', () => {
  const G = engine();
  let state = G.initial();
  state = G.act(state, 'light', 45);
  assert.equal(state.light, 85);
  state = G.act(state, 'curtain', 89);
  assert.equal(G.next(state).stage, 0);
  state = G.next(G.act(state, 'curtain', 90));
  assert.equal(state.stage, 1);
  for (const light of [0, 34, 56, 100]) {
    assert.equal(G.next(G.act(state, 'light', light)).stage, 1);
  }
  assert.equal(G.next(G.act(state, 'light', 35)).stage, 2);
  assert.equal(G.next(G.act(state, 'light', 55)).stage, 2);
});

test('hand support includes responding to the request to let go', () => {
  const G = engine();
  let state = reach(G, 2);
  state = wait(G, state, 10);
  assert.equal(state.hand, 0);
  assert.equal(G.ready(state), false);
  state = G.act(state, 'move', {x: 350, y: 230});
  state = wait(G, G.act(state, 'hand', true), 10);
  assert.equal(state.hand, 4);
  assert.equal(state.rest, 0);
  assert.equal(G.next(state).stage, 2);
  state = wait(G, G.act(state, 'hand', false), 2);
  assert.equal(G.ready(state), false);
  state = wait(G, state, 1.1);
  assert.equal(G.next(state).stage, 3);
});

test('holding hands requires the father to be physically beside her', () => {
  const G = engine();
  let state = reach(G, 2);
  state = G.act(state, 'move', {x: 750, y: 450});
  state = wait(G, G.act(state, 'hand', true), 10);
  assert.equal(state.hand, 0);
  assert.equal(G.ready(state), false);
  state = G.act(state, 'move', {x: 350, y: 230});
  state = wait(G, state, 4.1);
  assert.equal(state.hand, 4);
});

test('clearing the chair and returning to the bedside are separate physical tasks', () => {
  const G = engine();
  let state = reach(G, 3);
  state = G.act(state, 'move', {x: 600, y: 370});
  for (const chair of [{x: 300, y: 450}, {x: 225, y: 400}, {x: 225, y: 490}]) {
    assert.equal(G.next(G.act(state, 'chair', chair)).stage, 3);
  }
  state = G.next(G.act(state, 'chair', {x: 225, y: 450}));
  assert.equal(state.stage, 4);
  assert.equal(G.ready(state), false);
  state = G.act(state, 'move', {x: 550, y: 230});
  assert.equal(G.next(state).stage, 4);
  state = G.act(state, 'move', {x: 350, y: 230});
  assert.equal(G.next(state).stage, 5);
});

test('the clinical briefing cannot be skipped by an unrelated action', () => {
  const G = engine();
  let state = reach(G, 5);
  state = G.act(state, 'confirm');
  state = G.act(state, 'contact');
  state = wait(G, state, 11);
  assert.equal(G.next(state).stage, 5);
  state = wait(G, state, 1.1);
  assert.equal(G.next(state).stage, 6);
});

test('birth is a scripted clinical event and does not depend on hand holding or task performance', () => {
  const G = engine();
  const start = reach(G, 6);
  let quiet = wait(G, start, 27);
  assert.equal(quiet.born, false);
  assert.equal(G.next(quiet).stage, 6);
  quiet = wait(G, quiet, 1.1);
  const holding = wait(G, G.act(start, 'hand', true), 28.1);
  assert.equal(quiet.born, true);
  assert.equal(holding.born, true);
  assert.equal(quiet.witness, 1);
  assert.equal(holding.witness, 1);
  assert.equal(G.next(quiet).stage, 7);
});

test('skin contact waits for the staff confirmation and does not begin on its own', () => {
  const G = engine();
  let state = reach(G, 7);
  state = G.act(state, 'contact');
  assert.equal(state.contact, false);
  state = wait(G, state, 7);
  assert.equal(G.act(state, 'contact').contact, false);
  state = wait(G, state, 1.1);
  assert.equal(state.contact, false);
  assert.equal(G.next(state).stage, 7);
  state = G.act(state, 'contact');
  assert.equal(G.next(state).stage, 8);
});

test('blanket placement accepts the body-covering range and rejects both extremes', () => {
  const G = engine(), state = reach(G, 8);
  for (const placement of [0, 44, 71, 100]) {
    assert.equal(G.next(G.act(state, 'blanket', placement)).stage, 8);
  }
  for (const placement of [45, 55, 70]) {
    assert.equal(G.next(G.act(state, 'blanket', placement)).stage, 9);
  }
});

test('both distinct wristbands must be read before asking the nurse to confirm', () => {
  const G = engine();
  let state = reach(G, 9);
  assert.equal(G.act(state, 'confirm').confirmed, false);
  state = G.act(state, 'band', 'mother');
  state = G.act(state, 'band', 'mother');
  state = G.act(state, 'band', 'unknown');
  assert.equal(state.read.length, 1);
  assert.equal(G.act(state, 'confirm').confirmed, false);
  state = G.act(state, 'band', 'baby');
  assert.equal(G.next(state).stage, 9);
  state = G.act(state, 'confirm');
  assert.equal(G.next(state).stage, 10);
});

test('calling for help starts a response wait even after a long idle period', () => {
  const G = engine();
  let state = wait(G, reach(G, 10), 30);
  assert.equal(G.next(state).stage, 10);
  state = G.act(state, 'call');
  assert.equal(state.elapsed, 0);
  state = wait(G, state, 7);
  assert.equal(G.next(state).stage, 10);
  const elapsed = state.elapsed;
  state = G.act(state, 'call');
  assert.equal(state.elapsed, elapsed, 'repeat clicks do not restart the nurse response');
  state = wait(G, state, 1.1);
  assert.equal(G.next(state).stage, 11);
});

test('the last moment requires both saving the record and returning to her side', () => {
  const G = engine();
  let state = reach(G, 11);
  assert.equal(G.next(state).complete, false);
  state = G.act(state, 'move', {x: 750, y: 450});
  state = G.act(state, 'record');
  assert.equal(G.next(state).complete, false);
  state = G.act(state, 'move', {x: 350, y: 230});
  assert.equal(G.next(state).complete, true);
});

test('the birth record must be collected at the record desk, not from across the room', () => {
  const G = engine();
  let state = reach(G, 11);
  state = G.act(state, 'move', {x: 350, y: 230});
  state = G.act(state, 'record');
  assert.equal(state.recorded, false);
  assert.equal(G.next(state).complete, false);
  state = G.act(state, 'move', {x: 760, y: 435});
  state = G.act(state, 'record');
  assert.equal(state.recorded, true);
  assert.equal(G.next(state).complete, false, 'collecting the record does not replace returning to her side');
});

test('every playable save round-trips and resumes the same progression', () => {
  const G = engine();
  let state = G.initial();
  for (let stage = 0; stage < 12; stage++) {
    const restored = JSON.parse(JSON.stringify(state));
    assert.ok(G.valid(restored));
    assert.equal(JSON.stringify(G.next(solve(G, restored))), JSON.stringify(G.next(solve(G, state))));
    state = G.next(solve(G, restored));
  }
  assert.ok(G.valid(JSON.parse(JSON.stringify(state))));
});

test('malformed saves and impossible post-birth ordering are rejected', () => {
  const G = engine(), initial = G.initial();
  for (const malformed of [
    null, {}, [], {...initial, version: 2}, {...initial, stage: -1},
    {...initial, stage: 12}, {...initial, stage: 1.5}, {...initial, elapsed: NaN},
    {...initial, time: -1}, {...initial, light: '45'}, {...initial, born: 'true'},
    {...initial, player: {x: Infinity, y: 230}}, {...initial, chair: null},
    {...initial, read: ['unknown']}, {...initial, read: null},
    {...initial, stage: 7, born: false}, {...initial, stage: 8, born: true, contact: false}
  ]) assert.equal(Boolean(G.valid(malformed)), false, JSON.stringify(malformed));
});

test('save validation rejects out-of-scene coordinates and inconsistent completion', () => {
  const G = engine(), initial = G.initial();
  for (const malformed of [
    {...initial, player: {x: 100000, y: 230}}, {...initial, chair: {x: 225, y: -500}},
    {...initial, light: 101}, {...initial, curtain: 101}, {...initial, blanket: 101},
    {...initial, witness: 2}, {...initial, hand: 5}, {...initial, rest: 4},
    {...initial, read: ['mother', 'mother']}, {...initial, contact: true},
    {...initial, complete: true},
    {...initial, stage: 11, born: true, contact: true, complete: true, recorded: false}
  ]) assert.equal(Boolean(G.valid(malformed)), false, JSON.stringify(malformed));
});
