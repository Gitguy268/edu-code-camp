import harness from "./py-harness.py?raw";

let pyodide, emitId;
const ready = (async () => {
  const base = new URL("vendor/pyodide/", self.name || self.location.href).href;
  const { loadPyodide } = await import(/* @vite-ignore */ base + "pyodide.mjs");
  pyodide = await loadPyodide({ indexURL: base });
  pyodide.globals.set("_camp_emit", text => self.postMessage({ id: emitId, type: "log", text, level: "log", raw: true }));
  pyodide.runPython(harness);
  self.postMessage({ type: "ready" });
})().catch(err => self.postMessage({ type: "failed", error: String(err?.message ?? err) }));

self.onmessage = async ({ data: { id, code, tests } }) => {
  await ready;
  emitId = id;
  const run = pyodide.globals.get("_camp_run");
  const result = JSON.parse(run(code, tests ?? undefined));
  run.destroy();
  self.postMessage({ id, type: "done", result });
};
