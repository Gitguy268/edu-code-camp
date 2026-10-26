// Loads tracks and lessons from /content at build time. Solutions are never bundled:
// they exist only for scripts/selfcheck.mjs.
const files = import.meta.glob(["/content/**/*", "!/content/**/solution.*", "!/content/**/README.md"], {
  query: "?raw",
  import: "default",
  eager: true,
});

export function frontMatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    const v = kv[2].trim();
    meta[kv[1]] = /^-?\d+$/.test(v) ? Number(v) : v === "true" ? true : v === "false" ? false : v.replace(/^"(.*)"$/, "$1");
  }
  return { meta, body: text.slice(m[0].length) };
}

const EXT = { js: "js", py: "py", sql: "sql", sh: "sh" };

function build() {
  const tracks = new Map();
  for (const [path, text] of Object.entries(files)) {
    const parts = path.split("/"); // ["", "content", track, file] or [..., lesson, file]
    const trackId = parts[2];
    if (parts.length !== 4) continue;
    const track = tracks.get(trackId) ?? { lessons: [], id: trackId };
    tracks.set(trackId, track);
    // Track-wide files: a database every SQL lesson starts from, or setup every Linux lesson runs first.
    if (parts[3] === "track.json") Object.assign(track, JSON.parse(text), { id: trackId });
    else if (parts[3] === "seed.sql") track.seed = text;
    else if (parts[3] === "setup.sh") track.setup = text;
  }
  for (const [path, text] of Object.entries(files)) {
    const parts = path.split("/");
    if (parts.length !== 5) continue;
    const [, , trackId, folder, file] = parts;
    const track = tracks.get(trackId);
    if (!track) continue;
    let lesson = track.lessons.find(l => l.folder === folder);
    if (!lesson) {
      lesson = { folder, id: `${trackId}/${folder.replace(/^\d+-/, "")}`, track: trackId, n: parseInt(folder, 10), lang: track.lang };
      track.lessons.push(lesson);
    }
    const name = file.replace(/\.[^.]+$/, "");
    if (file === "lesson.md") {
      const { meta, body } = frontMatter(text);
      Object.assign(lesson, meta, { body });
    } else if (name === "tests" && file.endsWith(".json")) lesson.tests = JSON.parse(text);
    else if (["starter", "tests", "seed", "setup"].includes(name)) lesson[name] = text;
  }
  const list = [...tracks.values()].sort((a, b) => a.order - b.order);
  for (const t of list) {
    t.lessons.sort((a, b) => a.n - b.n);
    t.lessons.forEach((l, i) => {
      l.index = i;
      l.xp ??= 10;
      l.ext = EXT[l.lang];
      l.seed ??= t.seed;
      if (t.setup) l.setup = `${t.setup}\n${l.setup ?? ""}`;
    });
  }
  return list;
}

export const tracks = build();
export const lessonById = id => tracks.flatMap(t => t.lessons).find(l => l.id === id);
export const trackById = id => tracks.find(t => t.id === id);
export const allLessons = () => tracks.flatMap(t => t.lessons);
