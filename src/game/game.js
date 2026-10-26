// XP, levels, streaks, gems, chests, achievements and daily quests. Pure functions on a profile
// object; the caller saves the profile and shows the events that come back.

export const COLORS = ["#c8102e", "#008080", "#e8562a", "#6dbb4f", "#7b4fd6", "#e6c229", "#0a84ff", "#1d1d1b"];
export const FREEZE_COST = 20;
export const MAX_FREEZES = 2;
export const CHEST_EVERY = 5;

export function newProfile(name, color = COLORS[0]) {
  return normalize({ id: crypto.randomUUID(), name: name.trim().slice(0, 24) || "Camper", color, createdAt: Date.now() });
}

/** Fills in fields missing from older or imported profiles. */
export function normalize(p) {
  return {
    xp: 0,
    gems: 0,
    completed: {},
    attempts: {},
    streak: { count: 0, best: 0, last: null, freezes: 0 },
    chests: { ready: 0, opened: 0 },
    boost: 0,
    achievements: {},
    quests: { day: null, list: [] },
    weekly: {},
    ...p,
    stats: { runs: 0, hints: 0, looks: [], loopsKilled: 0, exports: 0, ...p.stats },
  };
}

// Level n starts at 25·n·(n−1) XP: 0, 50, 150, 300, 500…
const levelStart = n => 25 * n * (n - 1);
export function levelInfo(xp) {
  let level = 1;
  while (xp >= levelStart(level + 1)) level++;
  const from = levelStart(level), to = levelStart(level + 1);
  return { level, into: xp - from, need: to - from, pct: (xp - from) / (to - from) };
}

export const RANKS = ["Tenderfoot", "Trail Scout", "Fire Starter", "Map Reader", "Path Finder", "Ranger", "Trail Boss", "Camp Legend"];
export const rankFor = level => RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 2))];

export function dayKey(d = new Date()) {
  const z = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
const daysBetween = (a, b) => Math.round((Date.parse(b + "T12:00") - Date.parse(a + "T12:00")) / 86_400_000);
export function weekKey(d = new Date()) {
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return dayKey(monday);
}

/** The streak as it stands today: a streak whose gap can't be covered by freezes shows as 0. */
export function currentStreak(p, today = dayKey()) {
  const { count, last, freezes } = p.streak;
  if (!last) return 0;
  const missed = daysBetween(last, today) - 1;
  return missed <= freezes ? count : 0;
}

function touchStreak(p, today, events) {
  const s = p.streak;
  if (s.last === today) return;
  if (!s.last) s.count = 1;
  else {
    const missed = daysBetween(s.last, today) - 1;
    if (missed <= 0) s.count += 1;
    else if (missed <= s.freezes) {
      s.freezes -= missed;
      s.count += 1;
      events.push({ type: "freeze", used: missed });
    } else s.count = 1;
  }
  s.last = today;
  s.best = Math.max(s.best, s.count);
  if (s.count > 1) events.push({ type: "streak", count: s.count });
}

// Daily quests: three a day from this pool, picked the same way for the whole day.
const QUESTS = [
  { id: "lessons2", text: "Finish 2 lessons", goal: 2, stat: "lessons", gems: 10 },
  { id: "lessons3", text: "Finish 3 lessons", goal: 3, stat: "lessons", gems: 15 },
  { id: "xp50", text: "Earn 50 XP", goal: 50, stat: "xp", gems: 10 },
  { id: "first1", text: "Pass a lesson on your first try", goal: 1, stat: "firstTry", gems: 10 },
  { id: "runs5", text: "Run your code 5 times", goal: 5, stat: "runs", gems: 5 },
  { id: "hint1", text: "Ask Spot for a hint", goal: 1, stat: "hints", gems: 5 },
  { id: "cli1", text: "Finish a Linux lesson", goal: 1, stat: "cli", gems: 15 },
];
function hash(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
export function questsFor(p, today = dayKey()) {
  if (p.quests.day !== today) {
    const pool = [...QUESTS];
    const list = [];
    let h = hash(p.id + today);
    while (list.length < 3) {
      const [q] = pool.splice(h % pool.length, 1);
      if (!list.some(x => x.stat === q.stat)) list.push({ id: q.id, progress: 0, done: false });
      h = hash(String(h));
    }
    p.quests = { day: today, list };
  }
  return p.quests.list.map(q => ({ ...QUESTS.find(x => x.id === q.id), ...q }));
}
function bumpQuests(p, stat, n, events) {
  for (const q of questsFor(p)) {
    if (q.stat !== stat || q.done) continue;
    const saved = p.quests.list.find(x => x.id === q.id);
    saved.progress = Math.min(q.goal, saved.progress + n);
    if (saved.progress >= q.goal) {
      saved.done = true;
      p.gems += q.gems;
      events.push({ type: "quest", text: q.text, gems: q.gems });
    }
  }
}

export const ACHIEVEMENTS = [
  { id: "first", name: "First Steps", text: "Finish your first lesson", test: p => done(p) >= 1 },
  { id: "five", name: "Getting Warm", text: "Finish 5 lessons", test: p => done(p) >= 5 },
  { id: "twenty", name: "Campfire Regular", text: "Finish 20 lessons", test: p => done(p) >= 20 },
  { id: "all", name: "Camp Legend", text: "Finish every lesson", test: (p, ctx) => done(p) >= ctx.total },
  { id: "track", name: "Trail Blazer", text: "Finish a whole track", test: (p, ctx) => ctx.tracks.some(t => t.lessons.every(l => p.completed[l.id])) },
  { id: "polyglot", name: "Polyglot", text: "Finish a lesson in JavaScript, Python, SQL and the shell", test: (p, ctx) => ["js", "py", "sql", "sh"].every(lang => ctx.lessons.some(l => l.lang === lang && p.completed[l.id])) },
  { id: "streak3", name: "On a Roll", text: "Keep a 3-day streak", test: p => p.streak.best >= 3 },
  { id: "streak7", name: "Week Warrior", text: "Keep a 7-day streak", test: p => p.streak.best >= 7 },
  { id: "streak30", name: "Unstoppable", text: "Keep a 30-day streak", test: p => p.streak.best >= 30 },
  { id: "firsttry5", name: "Sharpshooter", text: "Pass 5 lessons on the first try", test: p => Object.values(p.completed).filter(c => c.firstTry).length >= 5 },
  { id: "level5", name: "Path Finder", text: "Reach level 5", test: p => levelInfo(p.xp).level >= 5 },
  { id: "chest", name: "Treasure Hunter", text: "Open a chest", test: p => p.chests.opened >= 1 },
  { id: "hint", name: "Good Question", text: "Ask Spot for a hint", test: p => p.stats.hints >= 1 },
  { id: "looks4", name: "Interior Decorator", text: "Try 4 different looks", test: p => p.stats.looks.length >= 4 },
  { id: "loop", name: "Halting Problem", text: "Write a loop that never ends (we stopped it)", test: p => p.stats.loopsKilled >= 1 },
  { id: "backup", name: "Safe Keeper", text: "Export a backup of your progress", test: p => p.stats.exports >= 1 },
  { id: "owl", name: "Night Owl", text: "Finish a lesson between midnight and 5 am", test: p => Object.values(p.completed).some(c => new Date(c.at).getHours() < 5) },
];
const done = p => Object.keys(p.completed).length;

function checkAchievements(p, ctx, events) {
  for (const a of ACHIEVEMENTS) {
    if (p.achievements[a.id] || !a.test(p, ctx)) continue;
    p.achievements[a.id] = Date.now();
    p.gems += 5;
    events.push({ type: "achievement", name: a.name, text: a.text });
  }
}

function addXp(p, xp, events) {
  const before = levelInfo(p.xp).level;
  p.xp += xp;
  const wk = weekKey();
  p.weekly[wk] = (p.weekly[wk] ?? 0) + xp;
  bumpQuests(p, "xp", xp, events);
  const after = levelInfo(p.xp).level;
  if (after > before) events.push({ type: "level", level: after, rank: rankFor(after) });
}

/** Counts a submit. Call before completeLesson so "first try" means the first submit. */
export function recordAttempt(p, lessonId) {
  p.attempts[lessonId] = (p.attempts[lessonId] ?? 0) + 1;
}

/**
 * Marks a lesson done. Only the first completion earns XP and gems.
 * ctx: { tracks, lessons, total } from content.js.
 */
export function completeLesson(p, lesson, ctx, now = new Date()) {
  const events = [];
  if (p.completed[lesson.id]) return events;
  const firstTry = (p.attempts[lesson.id] ?? 1) <= 1;
  let xp = lesson.xp + (firstTry ? 5 : 0);
  if (p.boost > 0) {
    xp *= 2;
    p.boost -= 1;
  }
  p.completed[lesson.id] = { at: now.getTime(), firstTry };
  p.gems += 2;
  events.push({ type: "xp", xp, firstTry });
  addXp(p, xp, events);
  touchStreak(p, dayKey(now), events);
  bumpQuests(p, "lessons", 1, events);
  if (firstTry) bumpQuests(p, "firstTry", 1, events);
  if (lesson.lang === "sh") bumpQuests(p, "cli", 1, events);
  if (done(p) % CHEST_EVERY === 0) {
    p.chests.ready += 1;
    events.push({ type: "chest" });
  }
  checkAchievements(p, ctx, events);
  return events;
}

/** Opens one chest: gems, a double-XP boost for 3 lessons, or a streak freeze. */
export function openChest(p, ctx, roll = Math.random()) {
  if (p.chests.ready < 1) return [];
  p.chests.ready -= 1;
  p.chests.opened += 1;
  const events = [];
  let reward;
  if (roll < 0.6) {
    const gems = 10 + Math.floor(roll * 25);
    p.gems += gems;
    reward = { kind: "gems", gems, text: `${gems} gems` };
  } else if (roll < 0.85 || p.streak.freezes >= MAX_FREEZES) {
    p.boost += 3;
    reward = { kind: "boost", text: "Double XP for your next 3 lessons" };
  } else {
    p.streak.freezes += 1;
    reward = { kind: "freeze", text: "A streak freeze" };
  }
  events.push({ type: "reward", ...reward });
  checkAchievements(p, ctx, events);
  return events;
}

export function buyFreeze(p) {
  if (p.gems < FREEZE_COST || p.streak.freezes >= MAX_FREEZES) return false;
  p.gems -= FREEZE_COST;
  p.streak.freezes += 1;
  return true;
}

/** Counts things like runs, hints, looks tried, stopped loops and exports. */
export function recordStat(p, stat, ctx, value) {
  const events = [];
  if (stat === "looks") {
    if (!p.stats.looks.includes(value)) p.stats.looks.push(value);
  } else p.stats[stat] = (p.stats[stat] ?? 0) + 1;
  if (stat === "runs" || stat === "hints") bumpQuests(p, stat, 1, events);
  checkAchievements(p, ctx, events);
  return events;
}

export const isUnlocked = (p, track, index) => index === 0 || Boolean(p.completed[track.lessons[index - 1].id]);
