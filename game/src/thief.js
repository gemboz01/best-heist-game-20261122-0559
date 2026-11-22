// thief.js — Brass the fox: movement, sneaking, and the two tools.
// Tools cost a use and points; smoke hides, EMP silences the cameras.

import { resolveCircle } from './level.js';

export const SMOKE_USES = 2;
export const EMP_USES = 1;
export const SMOKE_RADIUS = 95;
export const SMOKE_SECONDS = 5;
export const EMP_SECONDS = 6;
export const TOOL_POINT_COST = 50;

export function createThief(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    r: 14,
    facing: -Math.PI / 2,
    sneaking: false,
    hasLoot: false,
    smoke: SMOKE_USES,
    emp: EMP_USES,
    smokeClouds: [], // {x, y, r, left}
    empTimer: 0,
    stepTimer: 0,
  };
}

// input: {x, y} normalised move direction, {sneak}, {smokePressed}, {empPressed}.
// Returns events the main loop turns into points and sound.
export function updateThief(thief, input, level, dt) {
  const events = { usedSmoke: false, usedEmp: false, stepped: false };
  const speed = input.sneak ? 95 : 175;
  thief.sneaking = !!input.sneak;
  if (input.x !== 0 || input.y !== 0) {
    const len = Math.hypot(input.x, input.y);
    const nx = input.x / len;
    const ny = input.y / len;
    thief.facing = Math.atan2(ny, nx);
    const p = resolveCircle(level, thief.x + nx * speed * dt, thief.y + ny * speed * dt, thief.r);
    thief.x = p.x;
    thief.y = p.y;
    thief.stepTimer -= dt;
    if (thief.stepTimer <= 0) {
      thief.stepTimer = input.sneak ? 0.55 : 0.34;
      events.stepped = true;
    }
  }
  if (input.smokePressed && thief.smoke > 0) {
    thief.smoke -= 1;
    thief.smokeClouds.push({ x: thief.x, y: thief.y, r: SMOKE_RADIUS, left: SMOKE_SECONDS });
    events.usedSmoke = true;
  }
  if (input.empPressed && thief.emp > 0 && thief.empTimer <= 0) {
    thief.emp -= 1;
    thief.empTimer = EMP_SECONDS;
    events.usedEmp = true;
  }
  if (thief.empTimer > 0) thief.empTimer -= dt;
  for (const cloud of thief.smokeClouds) cloud.left -= dt;
  thief.smokeClouds = thief.smokeClouds.filter((c) => c.left > 0);
  return events;
}

// True while the thief stands inside one of their own smoke clouds.
export function hiddenInSmoke(thief) {
  for (const cloud of thief.smokeClouds) {
    if (Math.hypot(thief.x - cloud.x, thief.y - cloud.y) < cloud.r - 8) return true;
  }
  return false;
}
