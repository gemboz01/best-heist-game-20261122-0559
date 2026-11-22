// main.js — Brass Fox Heist: wires the level, thief, guards, cameras, alarm,
// audio and renderer into one playable game. Also serves the staged
// screenshot moments (?shot=start|play|end) as a single deterministic frame.

import { VIEW, createLevel, distTo } from './level.js';
import { createThief, updateThief, TOOL_POINT_COST } from './thief.js';
import { createGuards, updateGuards } from './guards.js';
import { createCameras, updateCameras } from './cameras.js';
import { createAlarm, updateAlarm, ALARM_MAX } from './alarm.js';
import {
  createAudio,
  playStep,
  playPickup,
  playSpotted,
  playAlarm,
  playSmoke,
  playEmp,
  playWin,
  playClick,
} from './audio.js';
import { drawGame } from './render.js';
import { applyShot, SHOT_NAMES } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = VIEW.w;
canvas.height = VIEW.h;
const ctx = canvas.getContext('2d');

function newGame() {
  const level = createLevel();
  return {
    level,
    thief: createThief(level.spawn),
    guards: createGuards(),
    cameras: createCameras(),
    alarm: createAlarm(),
    audio: createAudio(),
    score: 1000,
    time: 0,
    state: 'title',
    message: '',
    messageTimer: 0,
    toolsUsed: 0,
    winBreakdown: null,
    wasSpotted: false,
  };
}

let s = newGame();

// Keyboard input: a held set plus an edge-triggered set consumed each frame.
const held = new Set();
const pressed = new Set();
const MOVE_KEYS = {
  KeyW: [0, -1], ArrowUp: [0, -1],
  KeyS: [0, 1], ArrowDown: [0, 1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0],
  KeyD: [1, 0], ArrowRight: [1, 0],
};

window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }
  if (!e.repeat) pressed.add(e.code);
  held.add(e.code);
});
window.addEventListener('keyup', (e) => held.delete(e.code));
canvas.addEventListener('click', () => {
  if (s.state === 'title') {
    startGame();
  } else if (s.state === 'caught' || s.state === 'win') {
    restart();
  }
});

function startGame() {
  playClick(s.audio);
  s.state = 'playing';
  s.message = 'Steal the Meridian Diamond — stay out of the cones';
  s.messageTimer = 4;
}

function restart() {
  playClick(s.audio);
  s = newGame();
  s.state = 'playing';
  s.message = 'Steal the Meridian Diamond — stay out of the cones';
  s.messageTimer = 4;
}

function readInput() {
  let x = 0;
  let y = 0;
  for (const code of held) {
    const dir = MOVE_KEYS[code];
    if (dir) {
      x += dir[0];
      y += dir[1];
    }
  }
  const input = {
    x,
    y,
    sneak: held.has('ShiftLeft') || held.has('ShiftRight'),
    smokePressed: pressed.has('Space') || pressed.has('KeyE'),
    empPressed: pressed.has('KeyQ'),
  };
  pressed.clear();
  return input;
}

function update(dt) {
  if (s.state === 'title') {
    if (pressed.has('Enter')) startGame();
    pressed.clear();
    return;
  }
  if (s.state === 'caught' || s.state === 'win') {
    if (pressed.has('KeyR')) restart();
    pressed.clear();
    return;
  }
  // Playing.
  s.time += dt;
  if (s.messageTimer > 0) s.messageTimer -= dt;
  const input = readInput();
  const events = updateThief(s.thief, input, s.level, dt);
  if (events.stepped) playStep(s.audio);
  if (events.usedSmoke) {
    s.score -= TOOL_POINT_COST;
    s.toolsUsed += 1;
    playSmoke(s.audio);
    s.message = 'Smoke! The cones cannot see through it';
    s.messageTimer = 2.5;
  }
  if (events.usedEmp) {
    s.score -= TOOL_POINT_COST;
    s.toolsUsed += 1;
    playEmp(s.audio);
    s.message = 'EMP! The cameras are frozen';
    s.messageTimer = 2.5;
  }
  const seenByGuard = updateGuards(s.guards, dt, s.level, s.thief);
  const seenByCamera = updateCameras(s.cameras, dt, s.level, s.thief, s.thief.empTimer);
  const seen = seenByGuard || seenByCamera;
  if (seen && !s.wasSpotted) playSpotted(s.audio);
  s.wasSpotted = seen;
  const caught = updateAlarm(s.alarm, seen, dt);
  if (caught) {
    s.state = 'caught';
    playAlarm(s.audio);
    return;
  }
  // Loot pickup.
  if (!s.thief.hasLoot && distTo(s.thief.x, s.thief.y, s.level.loot.x, s.level.loot.y) < s.level.loot.r + s.thief.r + 6) {
    s.thief.hasLoot = true;
    s.score += 500;
    playPickup(s.audio);
    s.message = 'Diamond secured! Reach the green EXIT';
    s.messageTimer = 4;
  }
  // Getaway.
  if (s.thief.hasLoot && distTo(s.thief.x, s.thief.y, s.level.exit.x, s.level.exit.y) < s.level.exit.r + s.thief.r) {
    const timeBonus = Math.max(0, 300 - Math.floor(s.time) * 2);
    const toolCost = s.toolsUsed * TOOL_POINT_COST;
    s.score += timeBonus;
    s.winBreakdown = { loot: 500, timeBonus, toolCost, total: s.score };
    s.state = 'win';
    playWin(s.audio);
  }
}

// Staged screenshot mode: one deterministic frame, no loop.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot && SHOT_NAMES.includes(shot)) {
  applyShot(s, shot);
  drawGame(ctx, s);
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    drawGame(ctx, s);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
