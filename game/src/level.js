// level.js — the Meridian Vault: room, cover, loot, entry and exit, plus collision
// and line-of-sight helpers. Everything is plain data; no drawing here.

export const VIEW = { w: 1280, h: 720, hud: 56 };

// The room the thief crosses, in canvas pixels.
export function createLevel() {
  return {
    room: { x: 24, y: 64, w: 1232, h: 640 },
    // Cover that blocks movement and sight. Rects and circles.
    // Three ways through the room: left past the crates, middle between the
    // display cases, right past the pillars.
    covers: [
      { kind: 'rect', label: 'crates', x: 110, y: 280, w: 80, h: 80 },
      { kind: 'rect', label: 'crates', x: 110, y: 420, w: 70, h: 70 },
      { kind: 'rect', label: 'crates', x: 230, y: 520, w: 70, h: 70 },
      { kind: 'rect', label: 'display case', x: 500, y: 160, w: 170, h: 55 },
      { kind: 'rect', label: 'display case', x: 500, y: 520, w: 170, h: 55 },
      { kind: 'circle', label: 'pillar', x: 1000, y: 240, r: 32 },
      { kind: 'circle', label: 'pillar', x: 1000, y: 520, r: 32 },
      { kind: 'rect', label: 'plinth', x: 1020, y: 160, w: 55, h: 55 },
    ],
    entry: { x: 70, y: 640, r: 22 },
    exit: { x: 70, y: 120, r: 24 },
    loot: { x: 1150, y: 130, r: 20 },
    spawn: { x: 70, y: 640 },
  };
}

// Push a circle (x, y, r) out of the room walls and every cover object.
// Returns the corrected position. Mutates nothing.
export function resolveCircle(level, x, y, r) {
  const room = level.room;
  x = Math.max(room.x + r, Math.min(room.x + room.w - r, x));
  y = Math.max(room.y + r, Math.min(room.y + room.h - r, y));
  for (const c of level.covers) {
    if (c.kind === 'rect') {
      const cx = Math.max(c.x, Math.min(c.x + c.w, x));
      const cy = Math.max(c.y, Math.min(c.y + c.h, y));
      const dx = x - cx;
      const dy = y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 < r * r) {
        if (d2 > 0.0001) {
          const d = Math.sqrt(d2);
          x = cx + (dx / d) * r;
          y = cy + (dy / d) * r;
        } else {
          // Centre inside the rect: push out along the smallest overlap.
          const left = x - c.x;
          const right = c.x + c.w - x;
          const top = y - c.y;
          const bottom = c.y + c.h - y;
          const m = Math.min(left, right, top, bottom);
          if (m === left) x = c.x - r;
          else if (m === right) x = c.x + c.w + r;
          else if (m === top) y = c.y - r;
          else y = c.y + c.h + r;
        }
      }
    } else {
      const dx = x - c.x;
      const dy = y - c.y;
      const d = Math.hypot(dx, dy);
      const min = r + c.r;
      if (d < min && d > 0.0001) {
        x = c.x + (dx / d) * min;
        y = c.y + (dy / d) * min;
      }
    }
  }
  return { x, y };
}

// True when the segment (ax,ay)-(bx,by) is cut by any cover object.
export function blocksSight(level, ax, ay, bx, by) {
  for (const c of level.covers) {
    if (c.kind === 'rect') {
      if (segmentHitsRect(ax, ay, bx, by, c.x, c.y, c.w, c.h)) return true;
    } else if (segmentHitsCircle(ax, ay, bx, by, c.x, c.y, c.r)) {
      return true;
    }
  }
  return false;
}

// Liang-Barsky slab test for a segment against an axis-aligned rectangle.
function segmentHitsRect(ax, ay, bx, by, rx, ry, rw, rh) {
  let t0 = 0;
  let t1 = 1;
  const dx = bx - ax;
  const dy = by - ay;
  const p = [-dx, dx, -dy, dy];
  const q = [ax - rx, rx + rw - ax, ay - ry, ry + rh - ay];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return true;
}

function segmentHitsCircle(ax, ay, bx, by, cx, cy, r) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = 0;
  if (len2 > 0) {
    t = Math.max(0, Math.min(1, ((cx - ax) * dx + (cy - ay) * dy) / len2));
  }
  const px = ax + t * dx;
  const py = ay + t * dy;
  const ddx = px - cx;
  const ddy = py - cy;
  return ddx * ddx + ddy * ddy < r * r;
}

// Distance from a point to the loot pedestal or the exit vent.
export function distTo(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}
