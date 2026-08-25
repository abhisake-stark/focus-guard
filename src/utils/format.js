export function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function formatDisplayDate(key) {
  const today = getTodayKey();
  if (key === today) return 'Today';
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatDigital(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

export function formatHuman(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m`;
  return `${s % 60}s`;
}

export function playChime(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === 'start') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);
    } else {
      osc.frequency.setValueAtTime(392, now);
      osc.frequency.exponentialRampToValueAtTime(587, now + 0.15);
    }
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {
    // AudioContext unavailable — silently ignore
  }
}

export const DEFAULT_TARGET_HOURS = 8;

export const CATEGORIES = [
  'Social Media',
  'Entertainment',
  'Gaming',
  'Browsing',
  'Procrastination',
  'Phone / Messaging',
  'Daydreaming',
  'Other',
];

export function emptyDay(dateKey, targetHours) {
  return {
    date: dateKey,
    wastedSessions: [],
    tasks: [],
    targetHours: targetHours || DEFAULT_TARGET_HOURS,
  };
}

export function computeStreak(sessions, targetHours) {
  const targetMs = targetHours * 60 * 60 * 1000;

  const byDay = {};
  sessions.forEach((s) => {
    if (!s.startTime) return;
    const key = new Date(s.startTime).toDateString();
    byDay[key] = (byDay[key] || 0) + s.durationMs;
  });

  let streak = 0;
  const cursor = new Date();

  for (let i = 0; i < 365; i++) {
    const key = cursor.toDateString();
    const isToday = i === 0;
    const hasData = key in byDay;
    const dayTotal = byDay[key] || 0;

    if (isToday) {
      // Today only counts once it has at least one logged session under goal.
      // If nothing logged yet today, just skip it without breaking the streak.
      if (hasData && dayTotal < targetMs) {
        streak++;
      } else if (!hasData) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      } else {
        break;
      }
    } else {
      // Past days: no data means the streak has no evidence to continue — stop.
      if (!hasData) break;
      if (dayTotal < targetMs) {
        streak++;
      } else {
        break;
      }
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
