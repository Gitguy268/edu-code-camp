import { test } from "node:test";
import assert from "node:assert/strict";
import { newProfile, levelInfo, completeLesson, currentStreak, openChest, buyFreeze, questsFor, recordAttempt, recordStat, normalize, dayKey } from "../../src/game/game.js";

const lessons = Array.from({ length: 6 }, (_, i) => ({ id: `t/l${i}`, xp: 10, lang: i === 5 ? "sh" : "js" }));
const ctx = { tracks: [{ lessons }], lessons, total: lessons.length };
const at = d => new Date(`${d}T15:00`);

test("levels start at 0, 50, 150, 300 XP", () => {
  assert.equal(levelInfo(0).level, 1);
  assert.equal(levelInfo(49).level, 1);
  assert.equal(levelInfo(50).level, 2);
  assert.equal(levelInfo(150).level, 3);
  assert.deepEqual(levelInfo(75), { level: 2, into: 25, need: 100, pct: 0.25 });
});

test("a first-try lesson earns its XP plus 5, once", () => {
  const p = newProfile("Ada");
  recordAttempt(p, "t/l0");
  const events = completeLesson(p, lessons[0], ctx, at("2026-10-20"));
  assert.equal(p.xp, 15);
  assert.ok(events.some(e => e.type === "achievement" && e.name === "First Steps"));
  assert.deepEqual(completeLesson(p, lessons[0], ctx, at("2026-10-20")), []);
  assert.equal(p.xp, 15);
});

test("a second attempt loses the first-try bonus", () => {
  const p = newProfile("Ada");
  recordAttempt(p, "t/l0");
  recordAttempt(p, "t/l0");
  completeLesson(p, lessons[0], ctx, at("2026-10-20"));
  assert.equal(p.xp, 10);
});

test("streaks grow day by day and reset after a gap", () => {
  const p = newProfile("Ada");
  completeLesson(p, lessons[0], ctx, at("2026-10-20"));
  completeLesson(p, lessons[1], ctx, at("2026-10-21"));
  assert.equal(p.streak.count, 2);
  assert.equal(currentStreak(p, "2026-10-22"), 2);
  assert.equal(currentStreak(p, "2026-10-23"), 0);
  completeLesson(p, lessons[2], ctx, at("2026-10-24"));
  assert.equal(p.streak.count, 1);
  assert.equal(p.streak.best, 2);
});

test("a streak freeze covers a missed day", () => {
  const p = newProfile("Ada");
  p.gems = 40;
  assert.ok(buyFreeze(p));
  assert.equal(p.gems, 20);
  completeLesson(p, lessons[0], ctx, at("2026-10-20"));
  assert.equal(currentStreak(p, "2026-10-22"), 1);
  const events = completeLesson(p, lessons[1], ctx, at("2026-10-22"));
  assert.ok(events.some(e => e.type === "freeze"));
  assert.equal(p.streak.count, 2);
  assert.equal(p.streak.freezes, 0);
});

test("every fifth lesson earns a chest that can be opened", () => {
  const p = newProfile("Ada");
  for (const l of lessons.slice(0, 5)) completeLesson(p, l, ctx, at("2026-10-20"));
  assert.equal(p.chests.ready, 1);
  const gemsBefore = p.gems;
  const [reward] = openChest(p, ctx, 0.1);
  assert.equal(reward.kind, "gems");
  assert.ok(p.gems > gemsBefore);
  assert.equal(p.chests.ready, 0);
  assert.deepEqual(openChest(p, ctx), []);
});

test("a boost from a chest doubles XP for three lessons", () => {
  const p = newProfile("Ada");
  p.chests.ready = 1;
  openChest(p, ctx, 0.7);
  assert.equal(p.boost, 3);
  completeLesson(p, lessons[0], ctx, at("2026-10-20"));
  assert.equal(p.xp, 30);
  assert.equal(p.boost, 2);
});

test("three different daily quests, the same all day", () => {
  const p = newProfile("Ada");
  const a = questsFor(p, "2026-10-20").map(q => q.id);
  assert.equal(a.length, 3);
  assert.equal(new Set(questsFor(p, "2026-10-20").map(q => q.stat)).size, 3);
  assert.deepEqual(questsFor(p, "2026-10-20").map(q => q.id), a);
});

test("looks tried are counted once each", () => {
  const p = newProfile("Ada");
  for (const l of ["win98", "glass", "win98", "paper"]) recordStat(p, "looks", ctx, l);
  assert.deepEqual(p.stats.looks, ["win98", "glass", "paper"]);
  const events = recordStat(p, "looks", ctx, "yard");
  assert.ok(events.some(e => e.name === "Interior Decorator"));
});

test("old or imported profiles get missing fields", () => {
  const p = normalize({ id: "x", name: "Old", xp: 12 });
  assert.equal(p.xp, 12);
  assert.deepEqual(p.stats.looks, []);
  assert.equal(p.streak.count, 0);
});

test("dayKey uses the local date", () => {
  assert.equal(dayKey(new Date(2026, 0, 5, 23, 30)), "2026-01-05");
});
