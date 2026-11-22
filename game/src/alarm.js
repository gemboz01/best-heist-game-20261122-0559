// alarm.js — the alarm meter. Being seen is not an instant fail: the first
// sighting opens a short grace window (the "!" above the watcher) and the
// meter only climbs fast after it. Break sight and the meter cools down.

export const ALARM_MAX = 100;
const GRACE_SECONDS = 1.0;
const RISE_SPOTTED = 42; // per second once the grace window closes
const RISE_GRACE = 10; // per second during the grace window
const FALL_HIDDEN = 12; // per second while unseen

export function createAlarm() {
  return {
    level: 0,
    grace: 0,
    spotted: false,
    caught: false,
  };
}

// seen: true while any guard or camera has the thief in its cone.
// Returns true the moment the alarm maxes out.
export function updateAlarm(alarm, seen, dt) {
  if (alarm.caught) return true;
  if (seen) {
    if (!alarm.spotted) {
      alarm.spotted = true;
      alarm.grace = GRACE_SECONDS;
    }
    if (alarm.grace > 0) {
      alarm.grace -= dt;
      alarm.level += RISE_GRACE * dt;
    } else {
      alarm.level += RISE_SPOTTED * dt;
    }
  } else {
    alarm.spotted = false;
    alarm.grace = 0;
    alarm.level -= FALL_HIDDEN * dt;
  }
  if (alarm.level < 0) alarm.level = 0;
  if (alarm.level >= ALARM_MAX) {
    alarm.level = ALARM_MAX;
    alarm.caught = true;
  }
  return alarm.caught;
}
