// The active profile, kept in memory and saved to IndexedDB shortly after each change.
import { getProfiles, putProfile, getMeta, setMeta, deleteProfile } from "./store/db.js";
import { newProfile, normalize, questsFor } from "./game/game.js";
import { tracks, allLessons } from "./content.js";

export const ctx = { tracks, lessons: allLessons(), total: allLessons().length };

let profiles = [];
let active = null;
const listeners = new Set();
let saveTimer;

export const profile = () => active;
export const allProfiles = () => profiles;
export const onChange = fn => (listeners.add(fn), () => listeners.delete(fn));

export async function loadState() {
  try {
    profiles = (await getProfiles()).filter(p => typeof p?.id === "string").map(normalize);
  } catch {
    profiles = [];
  }
  const id = await getMeta("active").catch(() => null);
  active = profiles.find(p => p.id === id) ?? profiles[0] ?? null;
  if (!active) await addProfile("Camper");
  questsFor(active);
}

export function changed() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 150);
  for (const fn of listeners) fn(active);
}

/** Writes a pending change now (before an export, or when the page is hidden). */
export function flushSave() {
  if (!saveTimer) return Promise.resolve();
  clearTimeout(saveTimer);
  saveTimer = null;
  return putProfile(active).catch(err => console.warn("edu-code-camp: saving failed", err));
}
addEventListener("pagehide", flushSave);
document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flushSave());

export async function addProfile(name, color) {
  const p = newProfile(name, color);
  profiles.push(p);
  active = p;
  questsFor(p);
  changed();
  await putProfile(p);
  await setMeta("active", p.id).catch(() => {});
  return p;
}

export async function switchProfile(id) {
  active = profiles.find(p => p.id === id) ?? active;
  questsFor(active);
  await setMeta("active", active.id).catch(() => {});
  changed();
}

export async function removeProfile(id) {
  if (profiles.length < 2) return;
  profiles = profiles.filter(p => p.id !== id);
  await deleteProfile(id);
  if (active.id === id) await switchProfile(profiles[0].id);
  else changed();
}

/** Re-reads profiles after an import and switches to `preferId`. An untouched starter profile is dropped. */
export async function reloadProfiles(preferId) {
  const untouched = active && !active.xp && !Object.keys(active.completed).length && active.id !== preferId;
  if (untouched && preferId) await deleteProfile(active.id);
  const id = preferId ?? active?.id;
  profiles = (await getProfiles()).filter(p => typeof p?.id === "string").map(normalize);
  active = profiles.find(p => p.id === id) ?? profiles[0];
  await setMeta("active", active.id).catch(() => {});
  changed();
}
