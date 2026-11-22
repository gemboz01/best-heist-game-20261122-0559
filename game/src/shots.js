// shots.js — staged moments for the screenshots (?shot=start|play|end).
// Each one is a fixed, deterministic setup of the same live game: the start
// frame already shows the room, the guards with their cones, the cameras,
// the diamond and the alarm meter, all in one frame.

export const SHOT_NAMES = ['start', 'play', 'end'];

// s is the live game state (level, thief, guards, cameras, alarm, ...).
export function applyShot(s, name) {
  s.state = 'playing';
  s.message = '';
  s.messageTimer = 0;
  if (name === 'start') {
    // Opening frame: Brass at the door, patrols mid-route, cameras sweeping,
    // the diamond glowing, alarm at zero.
    s.thief.x = s.level.spawn.x;
    s.thief.y = s.level.spawn.y;
    s.thief.facing = -Math.PI / 2;
    s.thief.hasLoot = false;
    s.thief.smoke = 2;
    s.thief.emp = 1;
    s.thief.smokeClouds = [];
    s.thief.empTimer = 0;
    s.guards[0].x = 560; s.guards[0].y = 380; s.guards[0].facing = 0; s.guards[0].wp = 1;
    s.guards[1].x = 1120; s.guards[1].y = 400; s.guards[1].facing = Math.PI / 2; s.guards[1].wp = 1;
    s.guards[2].x = 840; s.guards[2].y = 120; s.guards[2].facing = 0; s.guards[2].wp = 1;
    s.cameras[0].angle = Math.PI / 2 - 0.5;
    s.cameras[1].angle = Math.PI - 0.35;
    s.alarm.level = 0;
    s.alarm.spotted = false;
    s.alarm.grace = 0;
    s.alarm.caught = false;
    s.score = 1000;
    s.time = 0;
    s.message = 'Steal the Meridian Diamond — stay out of the cones';
    s.messageTimer = 999;
  } else if (name === 'play') {
    // Mid-heist: Brass has slipped to the display cases, a guard's cone is
    // sweeping close, the alarm is half up, one smoke already spent.
    s.thief.x = 470;
    s.thief.y = 340;
    s.thief.facing = Math.PI / 4;
    s.thief.sneaking = true;
    s.thief.hasLoot = false;
    s.thief.smoke = 1;
    s.thief.emp = 1;
    s.thief.smokeClouds = [{ x: 380, y: 380, r: 95, left: 4 }];
    s.thief.empTimer = 0;
    s.guards[0].x = 700; s.guards[0].y = 380; s.guards[0].facing = Math.PI; s.guards[0].wp = 0;
    s.guards[1].x = 1120; s.guards[1].y = 300; s.guards[1].facing = -Math.PI / 2; s.guards[1].wp = 0;
    s.guards[2].x = 900; s.guards[2].y = 200; s.guards[2].facing = Math.PI / 2; s.guards[2].wp = 3;
    s.cameras[0].angle = Math.PI / 2 + 0.6;
    s.cameras[1].angle = Math.PI + 0.3;
    s.alarm.level = 46;
    s.alarm.spotted = false;
    s.alarm.grace = 0;
    s.alarm.caught = false;
    s.score = 950;
    s.time = 42;
    s.message = 'Sneak! Rook is sweeping back toward you';
    s.messageTimer = 999;
  } else if (name === 'end') {
    // The getaway: diamond secured, Brass at the exit, alarm cooling down.
    s.thief.x = 78;
    s.thief.y = 122;
    s.thief.facing = Math.PI;
    s.thief.hasLoot = true;
    s.thief.smoke = 0;
    s.thief.emp = 0;
    s.thief.smokeClouds = [];
    s.thief.empTimer = 0;
    s.guards[0].x = 500; s.guards[0].y = 380; s.guards[0].facing = Math.PI; s.guards[0].wp = 0;
    s.guards[1].x = 1120; s.guards[1].y = 520; s.guards[1].facing = Math.PI / 2; s.guards[1].wp = 1;
    s.guards[2].x = 760; s.guards[2].y = 160; s.guards[2].facing = Math.PI; s.guards[2].wp = 3;
    s.cameras[0].angle = Math.PI / 2 - 0.8;
    s.cameras[1].angle = Math.PI - 0.5;
    s.alarm.level = 18;
    s.alarm.spotted = false;
    s.alarm.grace = 0;
    s.alarm.caught = false;
    s.score = 1500;
    s.time = 100;
    s.state = 'win';
    s.winBreakdown = { loot: 500, timeBonus: 100, toolCost: 100, total: 1500 };
    s.message = '';
    s.messageTimer = 0;
  }
}
