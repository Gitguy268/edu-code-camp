// Makes the README images: one shot per look, lesson close-ups and a short demo.
// Needs a build served on :5281 (npm run build && npx vite preview) and Playwright's Chromium.
import { chromium } from "@playwright/test";
import { mkdirSync, rmSync, readdirSync, renameSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const URL = "http://localhost:5281/";
const OUT = "docs/images";
const TMP = "test-results/shots";
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });
const webp = (png, name) => execFileSync("cwebp", ["-quiet", "-q", "82", png, "-o", join(OUT, `${name}.webp`)]);

const day = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
const done = ["js/hello", "js/variables", "js/functions", "js/conditions", "py/print", "py/variables", "sql/select", "sql/where", "linux/pwd-ls"];
const camper = {
  id: "demo-camper", name: "Ada", color: "#008080", createdAt: Date.now(), xp: 245, gems: 63,
  completed: Object.fromEntries(done.map((id, i) => [id, { at: Date.now() - i * 3600e3, firstTry: i % 2 === 0 }])),
  attempts: {}, streak: { count: 5, best: 5, last: day(0), freezes: 1 }, chests: { ready: 1, opened: 1 }, boost: 0,
  achievements: { first: Date.now(), five: Date.now(), streak3: Date.now(), chest: Date.now(), polyglot: Date.now() },
  quests: { day: null, list: [] }, stats: { runs: 12, hints: 2, looks: ["win98", "glass"], loopsKilled: 0, exports: 0 }, weekly: {},
};

async function seed(page) {
  await page.goto(URL);
  // Let the app finish creating its default camper first, so ours stays the active one.
  await page.waitForSelector(".hero");
  await page.waitForTimeout(300);
  await page.evaluate(async p => {
    const db = await new Promise((res, rej) => { const r = indexedDB.open("edu-code-camp", 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    await new Promise(res => { const t = db.transaction(["profiles", "meta"], "readwrite"); t.objectStore("profiles").put(p); t.objectStore("meta").put(p.id, "active"); t.oncomplete = res; });
  }, camper);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await seed(page);
const setLook = async (look, tint) => {
  await page.evaluate(([l, t]) => { localStorage.setItem("ecc-look", l); if (t) localStorage.setItem("ecc-tint", t); }, [look, tint]);
};

for (const look of ["win98", "glass", "terminal", "arcade", "yard", "hose", "hifi", "paper"]) {
  await setLook(look, "mint");
  await page.goto(URL + "#/");
  await page.reload();
  await page.waitForSelector(".hero");
  await page.waitForTimeout(400);
  const png = join(TMP, `${look}.png`);
  await page.screenshot({ path: png });
  webp(png, `look-${look}`);
}

async function lesson(look, path, code, name, { submit = true } = {}) {
  await setLook(look);
  await page.goto(URL + path);
  await page.reload();
  await page.waitForSelector(".cm-content");
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText(code);
  await page.getByRole("button", { name: submit ? "Submit" : "Run", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector(".console .status"), null, { timeout: 60000 });
  await page.waitForTimeout(600);
  await page.keyboard.press("Escape");
  const png = join(TMP, `${name}.png`);
  await page.screenshot({ path: png });
  webp(png, name);
}
await lesson("glass", "#/lesson/py/functions", 'def greet(name):\n    return "Hello " + name\n\n\nprint(greet("Linus"))\n', "lesson-python");
await lesson("paper", "#/lesson/sql/order", "SELECT name, age\nFROM campers\nORDER BY age DESC, name\nLIMIT 3;\n", "lesson-sql", { submit: false });
await ctx.close();

// The demo: a failing submit, the fix, the celebration. Recorded as video, then turned into a GIF.
const vctx = await browser.newContext({ viewport: { width: 1200, height: 750 }, recordVideo: { dir: TMP, size: { width: 1200, height: 750 } } });
const v = await vctx.newPage();
await seed(v);
await v.evaluate(() => localStorage.setItem("ecc-look", "win98"));
await v.goto(URL + "#/lesson/js/loops");
await v.reload();
await v.waitForSelector(".cm-content");
await v.waitForTimeout(1200);
await v.locator(".cm-content").click();
await v.keyboard.press("ControlOrMeta+a");
await v.keyboard.insertText("function countdown(n) {\n  const numbers = [];\n  for (let i = n; i > 1; i--) {\n    numbers.push(i);\n  }\n  return numbers;\n}\n");
await v.waitForTimeout(800);
await v.getByRole("button", { name: "Submit", exact: true }).click();
await v.waitForTimeout(2500);
// Fix the off-by-one: > becomes >=.
await v.locator(".cm-content").click();
await v.keyboard.press("ControlOrMeta+a");
await v.keyboard.insertText("function countdown(n) {\n  const numbers = [];\n  for (let i = n; i >= 1; i--) {\n    numbers.push(i);\n  }\n  return numbers;\n}\n");
await v.waitForTimeout(900);
await v.getByRole("button", { name: "Submit", exact: true }).click();
await v.waitForTimeout(3000);
await vctx.close();
await browser.close();

const video = readdirSync(TMP).find(f => f.endsWith(".webm"));
renameSync(join(TMP, video), join(TMP, "demo.webm"));
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", join(TMP, "demo.webm"), "-vf", "fps=12,scale=900:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer", join(OUT, "demo.gif")]);
rmSync(TMP, { recursive: true, force: true });
console.log("screenshots: done");
