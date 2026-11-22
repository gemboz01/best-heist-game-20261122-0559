// cameras.js — the wall cameras: they sweep a cone back and forth, and an
// EMP pulse freezes them. A frozen camera shows a grey cone and sees nothing.

import { blocksSight } from './level.js';
import { hiddenInSmoke } from './thief.js';

export function createCameras() {
  return [
    {
      name: 'Cam A',
      x: 640,
      y: 70,
      baseAngle: Math.PI / 2, // looks down into the room
      sweep: 0.95,
      sweepSpeed: 0.55,
      range: 300,
      halfAngle: 0.42,
      angle: Math.PI / 2,
      phase: 0,
      disabled: 0,
      seen: false,
    },
    {
      name: 'Cam B',
      x: 1250,
      y: 420,
      baseAngle: Math.PI, // looks left across the room
      sweep: 0.7,
      sweepSpeed: 0.7,
      range: 280,
      halfAngle: 0.42,
      angle: Math.PI,
      phase: 1.6,
      disabled: 0,
      seen: false,
    },
  ];
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return Math.abs(d);
}

// Sweep every camera and test whether any of them sees the thief.
// empTimer is the thief's remaining EMP time; while it runs the cameras freeze.
export function updateCameras(cameras, dt, level, thief, empTimer) {
  let anySeen = false;
  const thiefHidden = hiddenInSmoke(thief);
  for (const c of cameras) {
    if (empTimer > 0) {
      c.disabled = empTimer;
    } else {
      c.disabled = 0;
      c.phase += dt * c.sweepSpeed;
      c.angle = c.baseAngle + c.sweep * Math.sin(c.phase);
    }
    c.seen = false;
    if (c.disabled <= 0 && !thiefHidden) {
      const dx = thief.x - c.x;
      const dy = thief.y - c.y;
      const dist = Math.hypot(dx, dy);
      const range = thief.sneaking ? c.range * 0.65 : c.range;
      if (dist < range && dist > 1) {
        const toThief = Math.atan2(dy, dx);
        if (angleDiff(toThief, c.angle) < c.halfAngle) {
          if (!blocksSight(level, c.x, c.y, thief.x, thief.y)) {
            c.seen = true;
            anySeen = true;
          }
        }
      }
    }
  }
  return anySeen;
}
