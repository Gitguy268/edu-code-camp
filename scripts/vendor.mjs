// Copies the runtimes and fonts the app loads at run time from node_modules into public/,
// so nothing comes from a CDN. Runs before dev and build.
import { cpSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const nm = "node_modules";
const copy = (from, to) => { mkdirSync(join(to, ".."), { recursive: true }); cpSync(from, to, { recursive: true }); };

// Pyodide core and standard library only (no extra packages).
for (const f of ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json", "package.json"])
  copy(join(nm, "pyodide", f), join("public/vendor/pyodide", f));
copy(join(nm, "pyodide", "README.md"), "public/vendor/pyodide/README.md");

// sql.js wasm build.
copy(join(nm, "sql.js/dist/sql-wasm.wasm"), "public/vendor/sql.js/sql-wasm.wasm");
copy(join(nm, "sql.js/LICENSE"), "public/vendor/sql.js/LICENSE");

// Fonts: latin woff2 files plus each family's OFL text.
const fonts = {
  "press-start-2p": ["press-start-2p-latin-400-normal.woff2"],
  "lilita-one": ["lilita-one-latin-400-normal.woff2"],
  "atkinson-hyperlegible-next": ["atkinson-hyperlegible-next-latin-400-normal.woff2", "atkinson-hyperlegible-next-latin-700-normal.woff2"],
  "fraunces": ["fraunces-latin-400-normal.woff2", "fraunces-latin-700-normal.woff2", "fraunces-latin-400-italic.woff2"],
  "jetbrains-mono": ["jetbrains-mono-latin-400-normal.woff2", "jetbrains-mono-latin-700-normal.woff2"],
};
for (const [family, files] of Object.entries(fonts)) {
  const dir = join(nm, "@fontsource", family);
  for (const f of files) copy(join(dir, "files", f), join("public/fonts", f));
  const licence = readdirSync(dir).find(f => /^LICEN[CS]E/i.test(f));
  if (licence) copy(join(dir, licence), join("public/fonts", `OFL-${family}.txt`));
}
// The third-party notices, linked from Settings.
copy("NOTICE", "public/NOTICE.txt");

if (!existsSync("public/alpine/fs.json")) console.log("vendor: no Linux image yet; run `npm run image` (needs Docker) for the Linux lessons.");
console.log("vendor: done");
