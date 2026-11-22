// render.js — draws the whole scene on one canvas: the vault room, its cover,
// the guards and their cones, the cameras, the diamond, the thief, and the
// HUD with the alarm meter. Safe cover, danger and loot read at a glance.

import { VIEW } from './level.js';

const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function conePath(ctx, x, y, angle, range, half) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
}

export function drawGame(ctx, s) {
  const { level } = s;
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);
  drawFloor(ctx, level);
  drawCarpet(ctx, level);
  drawLoot(ctx, level, s);
  drawExit(ctx, level, s);
  drawEntry(ctx, level);
  drawCover(ctx, level);
  drawSmoke(ctx, s);
  // Cones first, so the watchers and the thief sit on top of them.
  for (const g of s.guards) drawCone(ctx, g.x, g.y, g.facing, g.range, g.halfAngle, g.seen);
  for (const c of s.cameras) drawCameraCone(ctx, c);
  for (const c of s.cameras) drawCamera(ctx, c);
  for (const g of s.guards) drawGuard(ctx, g);
  drawThief(ctx, s.thief);
  drawHud(ctx, s);
  if (s.state === 'title') drawTitle(ctx, s);
  if (s.state === 'caught') drawCaught(ctx, s);
  if (s.state === 'win') drawWin(ctx, s);
  if (s.message && s.messageTimer > 0) drawMessage(ctx, s);
}

function drawFloor(ctx, level) {
  const room = level.room;
  ctx.fillStyle = '#0b0e14';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.fillStyle = '#1a2233';
  ctx.fillRect(room.x, room.y, room.w, room.h);
  // Tile seams.
  ctx.strokeStyle = '#232f47';
  ctx.lineWidth = 1;
  for (let x = room.x + 88; x < room.x + room.w; x += 88) {
    ctx.beginPath();
    ctx.moveTo(x, room.y);
    ctx.lineTo(x, room.y + room.h);
    ctx.stroke();
  }
  for (let y = room.y + 88; y < room.y + room.h; y += 88) {
    ctx.beginPath();
    ctx.moveTo(room.x, y);
    ctx.lineTo(room.x + room.w, y);
    ctx.stroke();
  }
  // Walls.
  ctx.strokeStyle = '#46587a';
  ctx.lineWidth = 6;
  ctx.strokeRect(room.x - 3, room.y - 3, room.w + 6, room.h + 6);
}

function drawCarpet(ctx, level) {
  // A red runner from the entry door up the left side toward the vault.
  ctx.fillStyle = '#6d2430';
  ctx.fillRect(48, 120, 64, 560);
  ctx.strokeStyle = '#8a2f3d';
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 120, 64, 560);
}

function drawCover(ctx, level) {
  for (const c of level.covers) {
    if (c.kind === 'rect') {
      if (c.label === 'crates') {
        ctx.fillStyle = '#8a6a3b';
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeStyle = '#5d4526';
        ctx.lineWidth = 3;
        ctx.strokeRect(c.x, c.y, c.w, c.h);
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + c.w, c.y + c.h);
        ctx.moveTo(c.x + c.w, c.y);
        ctx.lineTo(c.x, c.y + c.h);
        ctx.stroke();
      } else if (c.label === 'display case') {
        ctx.fillStyle = '#2f4d6b';
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeStyle = '#5a7ba6';
        ctx.lineWidth = 3;
        ctx.strokeRect(c.x, c.y, c.w, c.h);
        ctx.fillStyle = 'rgba(150, 200, 255, 0.28)';
        ctx.fillRect(c.x + 6, c.y + 6, c.w - 12, (c.h - 12) / 2);
      } else {
        ctx.fillStyle = '#5b4a68';
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeStyle = '#7a6890';
        ctx.lineWidth = 3;
        ctx.strokeRect(c.x, c.y, c.w, c.h);
      }
    } else {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fillStyle = '#4a5568';
      ctx.fill();
      ctx.strokeStyle = '#71809a';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r - 10, 0, Math.PI * 2);
      ctx.strokeStyle = '#5b6b84';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

function drawLoot(ctx, level, s) {
  const loot = level.loot;
  // Pedestal.
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(loot.x, loot.y, loot.r + 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  ctx.stroke();
  if (!s.thief.hasLoot) {
    // The Meridian Diamond, glowing.
    const t = s.time * 2;
    const pulse = 0.75 + 0.25 * Math.sin(t);
    ctx.save();
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 22 * pulse;
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.moveTo(loot.x, loot.y - 16);
    ctx.lineTo(loot.x + 12, loot.y);
    ctx.lineTo(loot.x, loot.y + 16);
    ctx.lineTo(loot.x - 12, loot.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(loot.x, loot.y - 16);
    ctx.lineTo(loot.x + 5, loot.y - 4);
    ctx.lineTo(loot.x - 5, loot.y - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#a5f3fc';
    ctx.font = `bold 13px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('MERIDIAN DIAMOND', loot.x, loot.y + 34);
  }
}

function drawExit(ctx, level, s) {
  const exit = level.exit;
  ctx.fillStyle = s.thief.hasLoot ? '#16a34a' : '#14532d';
  roundRect(ctx, exit.x - 24, exit.y - 24, 48, 48, 8);
  ctx.fill();
  ctx.strokeStyle = s.thief.hasLoot ? '#4ade80' : '#22c55e';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 12px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', exit.x, exit.y - 30);
  // Arrow pointing out.
  ctx.beginPath();
  ctx.moveTo(exit.x - 8, exit.y - 6);
  ctx.lineTo(exit.x + 8, exit.y);
  ctx.lineTo(exit.x - 8, exit.y + 6);
  ctx.closePath();
  ctx.fill();
}

function drawEntry(ctx, level) {
  const e = level.entry;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.font = `bold 11px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('IN', e.x, e.y + 4);
}

function drawSmoke(ctx, s) {
  for (const cloud of s.thief.smokeClouds) {
    const alpha = Math.min(0.55, 0.25 + (cloud.left / 5) * 0.3);
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(203, 213, 225, ${alpha})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cloud.x - 30, cloud.y + 12, cloud.r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cloud.x + 28, cloud.y - 14, cloud.r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCone(ctx, x, y, angle, range, half, seen) {
  conePath(ctx, x, y, angle, range, half);
  ctx.fillStyle = seen ? 'rgba(250, 204, 21, 0.38)' : 'rgba(250, 204, 21, 0.18)';
  ctx.fill();
  ctx.strokeStyle = seen ? 'rgba(250, 204, 21, 0.6)' : 'rgba(250, 204, 21, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawCameraCone(ctx, c) {
  if (c.disabled > 0) {
    conePath(ctx, c.x, c.y, c.angle, c.range, c.halfAngle);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    return;
  }
  conePath(ctx, c.x, c.y, c.angle, c.range, c.halfAngle);
  ctx.fillStyle = c.seen ? 'rgba(239, 68, 68, 0.34)' : 'rgba(239, 68, 68, 0.15)';
  ctx.fill();
  ctx.strokeStyle = c.seen ? 'rgba(239, 68, 68, 0.6)' : 'rgba(239, 68, 68, 0.38)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawGuard(ctx, g) {
  // Body.
  ctx.beginPath();
  ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
  ctx.fillStyle = '#3b82f6';
  ctx.fill();
  ctx.strokeStyle = '#dbeafe';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Facing tick.
  ctx.beginPath();
  ctx.moveTo(g.x, g.y);
  ctx.lineTo(g.x + Math.cos(g.facing) * (g.r + 8), g.y + Math.sin(g.facing) * (g.r + 8));
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Name.
  ctx.fillStyle = '#dbeafe';
  ctx.font = `bold 11px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(g.name, g.x, g.y - g.r - 8);
  if (g.seen) {
    ctx.fillStyle = '#facc15';
    ctx.font = `bold 22px ${FONT}`;
    ctx.fillText('!', g.x, g.y - g.r - 22);
  }
}

function drawCamera(ctx, c) {
  // Wall mount + lens.
  ctx.fillStyle = '#374151';
  roundRect(ctx, c.x - 14, c.y - 10, 28, 20, 4);
  ctx.fill();
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(c.x + Math.cos(c.angle) * 12, c.y + Math.sin(c.angle) * 12, 4, 0, Math.PI * 2);
  ctx.fillStyle = c.disabled > 0 ? '#6b7280' : '#ef4444';
  ctx.fill();
  ctx.fillStyle = '#fca5a5';
  ctx.font = `bold 10px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(c.name, c.x, c.y - 16);
  if (c.disabled > 0) {
    ctx.fillStyle = '#e2e8f0';
    ctx.font = `bold 11px ${FONT}`;
    ctx.fillText(`EMP ${Math.ceil(c.disabled)}s`, c.x, c.y + 26);
  }
}

function drawThief(ctx, thief) {
  const t = thief;
  // Tail.
  ctx.beginPath();
  ctx.moveTo(t.x - Math.cos(t.facing) * 6, t.y - Math.sin(t.facing) * 6);
  ctx.lineTo(t.x - Math.cos(t.facing) * 24, t.y - Math.sin(t.facing) * 24 - 8);
  ctx.lineTo(t.x - Math.cos(t.facing) * 24, t.y - Math.sin(t.facing) * 24 + 8);
  ctx.closePath();
  ctx.fillStyle = '#d97706';
  ctx.fill();
  // Body.
  ctx.beginPath();
  ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Ears.
  const earA = t.facing - 0.5;
  const earB = t.facing + 0.5;
  for (const a of [earA, earB]) {
    ctx.beginPath();
    ctx.moveTo(t.x + Math.cos(a) * 8, t.y + Math.sin(a) * 8);
    ctx.lineTo(t.x + Math.cos(a - 0.35) * 18, t.y + Math.sin(a - 0.35) * 18);
    ctx.lineTo(t.x + Math.cos(a + 0.35) * 18, t.y + Math.sin(a + 0.35) * 18);
    ctx.closePath();
    ctx.fillStyle = '#d97706';
    ctx.fill();
  }
  // Eyes.
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.arc(t.x + Math.cos(t.facing) * 5 - Math.sin(t.facing) * 4, t.y + Math.sin(t.facing) * 5 + Math.cos(t.facing) * 4, 2.2, 0, Math.PI * 2);
  ctx.arc(t.x + Math.cos(t.facing) * 5 + Math.sin(t.facing) * 4, t.y + Math.sin(t.facing) * 5 - Math.cos(t.facing) * 4, 2.2, 0, Math.PI * 2);
  ctx.fill();
  if (t.sneaking) {
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.r + 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (t.hasLoot) {
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.moveTo(t.x, t.y - t.r - 12);
    ctx.lineTo(t.x + 6, t.y - t.r - 4);
    ctx.lineTo(t.x, t.y - t.r + 4);
    ctx.lineTo(t.x - 6, t.y - t.r - 4);
    ctx.closePath();
    ctx.fill();
  }
}

function drawHud(ctx, s) {
  // Top bar.
  ctx.fillStyle = 'rgba(10, 14, 24, 0.94)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.hud);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, VIEW.hud);
  ctx.lineTo(VIEW.w, VIEW.hud);
  ctx.stroke();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f59e0b';
  ctx.font = `bold 19px ${FONT}`;
  ctx.fillText('BRASS FOX HEIST', 18, 34);
  // Alarm meter.
  const ax = 260;
  const ay = 16;
  const aw = 300;
  const ah = 22;
  ctx.fillStyle = '#94a3b8';
  ctx.font = `bold 13px ${FONT}`;
  ctx.fillText('ALARM', ax, ay + 16);
  ctx.fillStyle = '#334155';
  roundRect(ctx, ax + 62, ay, aw, ah, 6);
  ctx.fill();
  const frac = s.alarm.level / 100;
  const fillColor = frac < 0.4 ? '#22c55e' : frac < 0.7 ? '#eab308' : '#ef4444';
  if (frac > 0) {
    ctx.fillStyle = fillColor;
    roundRect(ctx, ax + 62, ay, Math.max(10, aw * frac), ah, 6);
    ctx.fill();
  }
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  roundRect(ctx, ax + 62, ay, aw, ah, 6);
  ctx.stroke();
  ctx.fillStyle = '#e2e8f0';
  ctx.font = `bold 13px ${FONT}`;
  ctx.fillText(`${Math.round(s.alarm.level)}%`, ax + 62 + aw + 10, ay + 16);
  // Loot status.
  ctx.fillStyle = s.thief.hasLoot ? '#22d3ee' : '#64748b';
  ctx.font = `bold 13px ${FONT}`;
  ctx.fillText(s.thief.hasLoot ? '◆ DIAMOND SECURED — REACH THE EXIT' : '◇ STEAL THE DIAMOND', 700, 34);
  // Tools.
  ctx.fillStyle = '#e2e8f0';
  ctx.font = `bold 13px ${FONT}`;
  ctx.fillText(`SMOKE [Space] ×${s.thief.smoke}   EMP [Q] ×${s.thief.emp}`, 990, 20);
  ctx.fillStyle = '#94a3b8';
  ctx.font = `12px ${FONT}`;
  ctx.fillText(`SCORE ${s.score}   TIME ${formatTime(s.time)}`, 990, 40);
  if (s.alarm.spotted && !s.alarm.caught) {
    ctx.fillStyle = '#facc15';
    ctx.font = `bold 20px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED! BREAK LINE OF SIGHT!', VIEW.w / 2, VIEW.hud + 30);
  }
}

function formatTime(t) {
  const m = Math.floor(t / 60);
  const sec = Math.floor(t % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function drawMessage(ctx, s) {
  ctx.fillStyle = 'rgba(10, 14, 24, 0.85)';
  const text = s.message;
  ctx.font = `bold 17px ${FONT}`;
  const w = ctx.measureText(text).width + 36;
  roundRect(ctx, (VIEW.w - w) / 2, VIEW.h - 64, w, 40, 8);
  ctx.fill();
  ctx.fillStyle = '#fde68a';
  ctx.textAlign = 'center';
  ctx.fillText(text, VIEW.w / 2, VIEW.h - 37);
}

function overlayPanel(ctx) {
  ctx.fillStyle = 'rgba(5, 8, 14, 0.72)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
}

function drawTitle(ctx, s) {
  overlayPanel(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f59e0b';
  ctx.font = `bold 52px ${FONT}`;
  ctx.fillText('BRASS FOX HEIST', VIEW.w / 2, 220);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = `20px ${FONT}`;
  ctx.fillText('One fox. One vault. One very shiny diamond.', VIEW.w / 2, 262);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = `16px ${FONT}`;
  ctx.fillText('Move: WASD / Arrows    Sneak: Shift (slower, harder to spot)', VIEW.w / 2, 320);
  ctx.fillText('Smoke bomb: Space (2 uses)    EMP: Q (1 use, freezes cameras)', VIEW.w / 2, 348);
  ctx.fillText('Steal the Meridian Diamond, then reach the green EXIT. If the alarm', VIEW.w / 2, 376);
  ctx.fillText('hits 100%, the vault locks and Brass is caught.', VIEW.w / 2, 404);
  ctx.fillStyle = '#facc15';
  ctx.font = `bold 20px ${FONT}`;
  ctx.fillText('Click or press Enter to start', VIEW.w / 2, 470);
}

function drawCaught(ctx, s) {
  overlayPanel(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ef4444';
  ctx.font = `bold 56px ${FONT}`;
  ctx.fillText('CAUGHT!', VIEW.w / 2, 300);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = `20px ${FONT}`;
  ctx.fillText('The alarm hit 100% and the vault sealed shut.', VIEW.w / 2, 344);
  ctx.fillText(`Score ${s.score} — the diamond stays in its case.`, VIEW.w / 2, 376);
  ctx.fillStyle = '#facc15';
  ctx.font = `bold 20px ${FONT}`;
  ctx.fillText('Press R to try again', VIEW.w / 2, 440);
}

function drawWin(ctx, s) {
  overlayPanel(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#22c55e';
  ctx.font = `bold 52px ${FONT}`;
  ctx.fillText('CLEAN GETAWAY!', VIEW.w / 2, 250);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = `20px ${FONT}`;
  ctx.fillText('Brass slipped out with the Meridian Diamond.', VIEW.w / 2, 292);
  const b = s.winBreakdown || { loot: 500, timeBonus: 0, toolCost: 0, total: 0 };
  ctx.fillStyle = '#cbd5e1';
  ctx.font = `17px ${FONT}`;
  ctx.fillText(`Loot +${b.loot}    Time bonus +${b.timeBonus}    Tools −${b.toolCost}`, VIEW.w / 2, 340);
  ctx.fillStyle = '#facc15';
  ctx.font = `bold 26px ${FONT}`;
  ctx.fillText(`FINAL SCORE ${b.total}`, VIEW.w / 2, 388);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = `bold 20px ${FONT}`;
  ctx.fillText('Press R to play again', VIEW.w / 2, 448);
}
