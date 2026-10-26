// One worker per language. A run that takes too long is stopped by terminating the worker,
// which works without SharedArrayBuffer (GitHub Pages can't send the headers it needs).

const BASE = new URL(import.meta.env.BASE_URL, location.href).href;
const spawn = {
  js: () => new Worker(new URL("./js.worker.js", import.meta.url), { type: "module", name: BASE }),
  py: () => new Worker(new URL("./py.worker.js", import.meta.url), { type: "module", name: BASE }),
  sql: () => new Worker(new URL("./sql.worker.js", import.meta.url), { type: "module", name: BASE }),
};
const LIMIT_MS = { js: 4000, py: 8000, sql: 4000 };
const LOADING = { py: "Loading Python (first time only)…", sql: "Loading SQLite…" };

class Runner {
  constructor(lang) {
    this.lang = lang;
    this.worker = null;
    this.ready = null;
    this.seq = 0;
  }

  start(onStatus) {
    if (this.ready) return this.ready;
    this.worker = spawn[this.lang]();
    this.ready = new Promise((resolve, reject) => {
      this.worker.addEventListener("message", function first({ data }) {
        if (data.type === "ready") { this.removeEventListener("message", first); resolve(); }
        if (data.type === "failed") { this.removeEventListener("message", first); reject(new Error(data.error)); }
      });
      this.worker.addEventListener("error", e => reject(new Error(e.message || "The runner failed to start")));
    });
    if (LOADING[this.lang]) onStatus?.(LOADING[this.lang]);
    this.ready.catch(() => this.kill());
    return this.ready;
  }

  kill() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
  }

  /** @returns {Promise<{pass:boolean, results:any[], output?:string, error?:string, tables?:any[], timedOut?:boolean}>} */
  async run({ code, tests = null, seed = null }, { onLog, onStatus } = {}) {
    await this.start(onStatus);
    onStatus?.("Running…");
    const id = ++this.seq;
    const worker = this.worker;
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        worker.removeEventListener("message", onMessage);
        this.kill();
        resolve({ pass: false, timedOut: true, results: [], error: `Stopped after ${LIMIT_MS[this.lang] / 1000} seconds. Is there a loop that never ends?` });
      }, LIMIT_MS[this.lang]);
      const onMessage = ({ data }) => {
        if (data.id !== id) return;
        if (data.type === "log") onLog?.(data.text, data.level, data.raw);
        if (data.type === "done") {
          clearTimeout(timer);
          worker.removeEventListener("message", onMessage);
          resolve(data.result);
        }
      };
      worker.addEventListener("message", onMessage);
      worker.postMessage({ id, code, tests, seed });
    });
  }
}

const runners = {};
export const runnerFor = lang => (runners[lang] ??= new Runner(lang));
