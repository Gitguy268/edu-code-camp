// Checks every lesson: its solution must pass its hidden tests, and its starter must not.
// JS, Python and SQL run here in Node; Linux lessons run in a throwaway Alpine container (needs Docker).
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { runJs } from "../src/runners/js-harness.js";
import { runSql } from "../src/runners/sql-harness.js";
import { cleanReply } from "../src/tutor/prompt.js";

const root = "content";
const read = (...p) => (existsSync(join(...p)) ? readFileSync(join(...p), "utf8") : null);
let failures = 0;
const fail = msg => { failures++; console.log(`  ✗ ${msg}`); };

let pyodide = null;
async function py(code, tests) {
  if (!pyodide) {
    const { loadPyodide } = await import("pyodide");
    pyodide = await loadPyodide();
    pyodide.globals.set("_camp_emit", () => {});
    pyodide.runPython(readFileSync("src/runners/py-harness.py", "utf8"));
  }
  const run = pyodide.globals.get("_camp_run");
  const out = JSON.parse(run(code, tests ?? undefined));
  run.destroy();
  return out;
}

let SQL = null;
async function sql(seed, code, tests) {
  SQL ??= await (await import("sql.js")).default();
  return runSql(SQL, seed, code, tests);
}

// Docker is preferred (the same BusyBox as the VM); without it, the Mac or Linux host's own sh stands in.
const docker = (() => {
  try { execFileSync("docker", ["run", "--rm", "docker.io/i386/alpine:3.21.0", "true"], { stdio: "ignore" }); return true; } catch { return false; }
})();
const PRELUDE = readFileSync("src/views/shell-lesson.js", "utf8").match(/const PRELUDE = `([\s\S]*?)`;/)[1].replace(/\\\\/g, "\\");
function sh(setup, solution, tests) {
  // The same steps the app takes: setup as root, the learner's commands as camper, checks as root.
  const script = `set -e
adduser -D -s /bin/sh camper >/dev/null 2>&1
cd /home/camper
${setup ?? ""}
chown -R camper:camper /home/camper
set +e
${PRELUDE}
echo "--before--"
( ${tests} )
su camper -s /bin/sh -c 'cd /home/camper && sh /dev/stdin' <<'CAMPER_EOF'
${solution}
CAMPER_EOF
echo "--after--"
( ${tests} )`;
  const out = docker
    ? execFileSync("docker", ["run", "--rm", "-i", "docker.io/i386/alpine:3.21.0", "sh"], { input: script, encoding: "utf8" })
    : execFileSync("sh", [], { input: localScript(setup, solution, tests), encoding: "utf8" });
  const [before, after] = out.split("--before--")[1].split("--after--");
  const parse = s => s.split("\n").filter(l => /^(PASS|FAIL)\t/.test(l));
  const b = parse(before), a = parse(after);
  return { starter: { pass: b.length > 0 && b.every(l => l.startsWith("PASS")) }, solution: { pass: a.length > 0 && a.every(l => l.startsWith("PASS")), results: a } };
}

function localScript(setup, solution, tests) {
  return `set -e
home=$(mktemp -d)
trap 'rm -rf "$home"' EXIT
cd "$home"
${setup ?? ""}
set +e
${PRELUDE.replace(/^as_camper.*$/m, 'as_camper() { sh -c "cd $home && $1"; }')}
echo "--before--"
( ${tests} )
( ${solution} )
echo "--after--"
( ${tests} )`;
}

let count = 0;
for (const track of readdirSync(root).sort()) {
  if (!existsSync(join(root, track, "track.json"))) continue;
  const meta = JSON.parse(read(root, track, "track.json"));
  console.log(`${meta.title}`);
  for (const lesson of readdirSync(join(root, track)).filter(f => /^\d+-/.test(f)).sort()) {
    const dir = join(root, track, lesson);
    const ext = { js: "js", py: "py", sql: "sql", sh: "sh" }[meta.lang];
    const solution = read(dir, `solution.${ext}`);
    const starter = read(dir, `starter.${ext}`) ?? "";
    const md = read(dir, "lesson.md");
    if (!md || !/^---\n[\s\S]*?title:/.test(md)) { fail(`${lesson}: lesson.md needs front matter with a title`); continue; }
    if (solution == null) { fail(`${lesson}: no solution.${ext}`); continue; }
    count++;
    let good, bad;
    if (meta.lang === "js") {
      const tests = read(dir, "tests.js");
      [good, bad] = [await runJs(solution, tests), await runJs(starter, tests)];
    } else if (meta.lang === "py") {
      const tests = read(dir, "tests.py");
      [good, bad] = [await py(solution, tests), await py(starter, tests)];
    } else if (meta.lang === "sql") {
      const tests = JSON.parse(read(dir, "tests.json"));
      const seed = read(dir, "seed.sql") ?? read(root, track, "seed.sql");
      [good, bad] = [await sql(seed, solution, tests), await sql(seed, starter, tests)];
    } else if (meta.lang === "sh") {
      const setup = [read(root, track, "setup.sh"), read(dir, "setup.sh")].filter(Boolean).join("\n");
      const r = sh(setup, solution, read(dir, "tests.sh"));
      [good, bad] = [r.solution, r.starter];
    }
    if (!good.pass) fail(`${lesson}: the solution fails: ${good.error ?? JSON.stringify(good.results?.filter(r => !r.pass))}`);
    else if (bad.pass) fail(`${lesson}: the starter already passes`);
    else console.log(`  ✓ ${lesson}`);
  }
}

// Spot must never hand over a multi-line answer.
if (!cleanReply("Try this:\n```js\nconst a = 1;\nconsole.log(a);\n```").includes("stopped")) fail("tutor: cleanReply kept a code block");

if (!docker) console.log("\n(Linux lessons ran in this computer's sh: Docker couldn't start a container.)");
console.log(failures ? `\n${failures} problem(s) in ${count} lessons` : `\nAll ${count} lessons check out`);
process.exit(failures ? 1 : 0);
