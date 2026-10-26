// Everything the app remembers lives in IndexedDB on this device: profiles (progress, XP, badges)
// and code drafts. Export and import move it between browsers as one JSON file.
const DB = "edu-code-camp";
const VERSION = 1;
export const SCHEMA = 1;

let dbp;
function open() {
  dbp ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      db.createObjectStore("profiles", { keyPath: "id" });
      db.createObjectStore("drafts");
      db.createObjectStore("meta");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

async function tx(store, mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    t.oncomplete = () => resolve(req?.result);
    t.onerror = t.onabort = () => reject(t.error);
  });
}

export const getProfiles = () => tx("profiles", "readonly", s => s.getAll());
export const putProfile = p => tx("profiles", "readwrite", s => s.put(structuredClone(p)));
export const deleteProfile = id => tx("profiles", "readwrite", s => s.delete(id));
export const getMeta = k => tx("meta", "readonly", s => s.get(k));
export const setMeta = (k, v) => tx("meta", "readwrite", s => s.put(v, k));
export const getDraft = (pid, lessonId) => tx("drafts", "readonly", s => s.get(`${pid}:${lessonId}`));
export const putDraft = (pid, lessonId, code) => tx("drafts", "readwrite", s => s.put(code, `${pid}:${lessonId}`));
export const deleteDraft = (pid, lessonId) => tx("drafts", "readwrite", s => s.delete(`${pid}:${lessonId}`));

async function allDrafts() {
  const db = await open();
  return new Promise((resolve, reject) => {
    const out = {};
    const req = db.transaction("drafts").objectStore("drafts").openCursor();
    req.onsuccess = () => {
      const c = req.result;
      if (!c) return resolve(out);
      out[c.key] = c.value;
      c.continue();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function exportAll() {
  return { app: "edu-code-camp", schema: SCHEMA, exportedAt: new Date().toISOString(), profiles: await getProfiles(), drafts: await allDrafts() };
}

/** Adds or replaces the profiles in a backup. Profiles that aren't in it are kept. */
export async function importAll(data) {
  if (data?.app !== "edu-code-camp" || !Array.isArray(data.profiles)) throw new Error("This isn't an edu-code-camp backup.");
  if (data.schema > SCHEMA) throw new Error("This backup is from a newer version of edu-code-camp.");
  if (!data.profiles.every(p => typeof p?.id === "string" && typeof p.name === "string")) throw new Error("This backup is damaged.");
  for (const p of data.profiles) await putProfile(p);
  for (const [k, v] of Object.entries(data.drafts ?? {})) await tx("drafts", "readwrite", s => s.put(String(v), k));
  return data.profiles.map(p => p.id);
}
