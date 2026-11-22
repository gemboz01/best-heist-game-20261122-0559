// guards.js — the vault's patrols: waypoint routes, sweeping vision cones,
// and the check that decides whether a guard sees the thief.
// A guard reads the cone before the thief moves: the cone is always drawn,
// so the patrol is fair.

import { blocksSight } from './level.js';
import { hiddenInSmoke } from './thief.js';

export function createGuards() {
  return [
    {
      name: 'Rook',
      waypoints: [
        { x: 320, y: 380 },
        { x: 880, y: 380 },
      ],
      wp: 0,
      x: 320,
      y: 380,
      r: 16,
      speed: 62,
      range: 260,
      halfAngle: 0.5,
      facing: 0,
      pause: 0,
      pauseDir: 1,
      seen: false,
    },
    {
      name: 'Bishop',
      waypoints: [
        { x: 1120, y: 220 },
        { x: 1120, y: 580 },
      ],
      wp: 0,
      x: 1120,
      y: 220,
      r: 16,
      speed: 55,
      range: 240,
      halfAngle: 0.5,
      facing: Math.PI / 2,
      pause: 0,
      pauseDir: 1,
      seen: false,
    },
    {
      name: 'Knight',
      waypoints: [
        { x: 700, y: 120 },
        { x: 980, y: 120 },
        { x: 980, y: 200 },
        { x: 700, y: 200 },
      ],
      wp: 0,
      x: 700,
      y: 120,
      r: 16,
      speed: 70,
      range: 220,
      halfAngle: 0.48,
      facing: 0,
      pause: 0,
      pauseDir: 1,
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

// Move every guard along its route and test whether any of them sees the thief.
// Returns true when at least one guard has the thief in its cone right now.
export function updateGuards(guards, dt, level, thief) {
  let anySeen = false;
  const thiefHidden = hiddenInSmoke(thief);
  for (const g of guards) {
    if (g.pause > 0) {
      // At a waypoint: look around, sweeping the cone side to side.
      g.pause -= dt;
      g.facing += g.pauseDir * 0.9 * dt;
      if (g.facing > g.baseFacing + 0.6) g.pauseDir = -1;
      if (g.facing < g.baseFacing - 0.6) g.pauseDir = 1;
    } else {
      const target = g.waypoints[g.wp];
      const dx = target.x - g.x;
      const dy = target.y - g.y;
      const d = Math.hypot(dx, dy);
      if (d < 4) {
        g.wp = (g.wp + 1) % g.waypoints.length;
        g.pause = 0.7;
        g.baseFacing = g.facing;
        g.pauseDir = 1;
      } else {
        const nx = dx / d;
        const ny = dy / d;
        g.facing = Math.atan2(ny, nx);
        g.x += nx * g.speed * dt;
        g.y += ny * g.speed * dt;
      }
    }
    g.seen = false;
    if (!thiefHidden) {
      const dx = thief.x - g.x;
      const dy = thief.y - g.y;
      const dist = Math.hypot(dx, dy);
      // Sneaking shrinks the distance a guard can spot the thief at.
      const range = thief.sneaking ? g.range * 0.65 : g.range;
      if (dist < range && dist > 1) {
        const toThief = Math.atan2(dy, dx);
        if (angleDiff(toThief, g.facing) < g.halfAngle) {
          if (!blocksSight(level, g.x, g.y, thief.x, thief.y)) {
            g.seen = true;
            anySeen = true;
          }
        }
      }
    }
  }
  return anySeen;
}
