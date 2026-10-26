// Spot's engine: wllama (llama.cpp in WebAssembly, WebGPU when the browser has it) running the
// language model of MiniCPM-V 4.7 1B, text only. Ported from Paint97's src/lib/localAi/runtime.ts.
//
// The GGUF comes from Hugging Face at a pinned revision in 64 MiB ranges. Each range is checked
// against the SHA-256 in model.json before it is cached, so a pause keeps every finished range
// and a tampered one never reaches the cache. After that Spot works offline.
import manifest from "./model.json";

export const MODEL_NAME = "MiniCPM-V 4.7 1B";
const BASE = `https://huggingface.co/${manifest.repo}/resolve/${manifest.revision}/`;
const RANGES = Object.entries(manifest.files).flatMap(([name, f]) => {
  let start = 0;
  return f.chunks.map((c, i) => {
    const r = { url: BASE + name, key: `${BASE}${name}?part=${i}`, start, size: c.size, sha256: c.sha256 };
    start += c.size;
    return r;
  });
});
const MODEL_BYTES = RANGES.reduce((n, r) => n + r.size, 0);
const CACHE = `edu-code-camp-tutor-${manifest.revision.slice(0, 8)}`;
const VENDOR = new URL(`${import.meta.env.BASE_URL}vendor/wllama/`, location.href).href;
export const GENERATION = { temperature: 0.6, max_tokens: 220 };

export const modelSizeLabel = () => `${Math.round(MODEL_BYTES / 1e6)} MB`;
export const isAbortError = e => e instanceof Error && e.name === "AbortError";

async function sha256Hex(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function isModelCached() {
  // Test seam for the e2e suite: a scripted engine (no GPU, no download). The app never sets it.
  if (globalThis.__eccEngineFactory) return true;
  if (typeof caches === "undefined") return false;
  for (const name of await caches.keys()) if (name !== CACHE && name.startsWith("edu-code-camp-tutor-")) caches.delete(name);
  return (await (await caches.open(CACHE)).keys()).length === RANGES.length;
}

export const deleteModel = () => caches.delete(CACHE);

async function download(cache, onProgress, signal) {
  let loaded = 0;
  const report = extra => onProgress?.({ loadedBytes: loaded + extra, totalBytes: MODEL_BYTES });
  for (const [i, r] of RANGES.entries()) {
    const where = `part ${i + 1} of ${RANGES.length}`;
    if (await cache.match(r.key)) {
      loaded += r.size;
      report(0);
      continue;
    }
    let res;
    try {
      res = await fetch(r.url, { headers: { Range: `bytes=${r.start}-${r.start + r.size - 1}` }, signal });
    } catch (e) {
      if (isAbortError(e)) throw e;
      throw new Error(`Couldn't reach Hugging Face for ${where}. Check your connection.`, { cause: e });
    }
    if (!res.ok || !res.body) throw new Error(`Downloading ${where} failed (HTTP ${res.status}).`);
    const reader = res.body.getReader();
    const pieces = [];
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      pieces.push(value);
      got += value.byteLength;
      report(got);
    }
    if (got !== r.size) throw new Error(`The model's ${where} came back as ${got} bytes, expected ${r.size}.`);
    const bytes = new Uint8Array(got);
    let at = 0;
    for (const p of pieces) { bytes.set(p, at); at += p.byteLength; }
    if ((await sha256Hex(bytes)) !== r.sha256) throw new Error(`The model's ${where} failed its integrity check.`);
    await cache.put(r.key, new Response(bytes));
    loaded += r.size;
    report(0);
  }
}

/** Downloads what isn't cached yet, then loads the model. Aborting pauses; finished ranges stay. */
export async function createEngine(onProgress, signal) {
  if (globalThis.__eccEngineFactory) return globalThis.__eccEngineFactory(onProgress, signal);
  signal?.throwIfAborted();
  const cache = await caches.open(CACHE);
  await download(cache, onProgress, signal);
  const parts = [];
  for (const r of RANGES) {
    const hit = await cache.match(r.key);
    if (!hit) throw new Error("Part of the model is missing from this device. Download it again.");
    parts.push(await hit.blob());
  }
  signal?.throwIfAborted();
  const { Wllama } = await import(/* @vite-ignore */ `${VENDOR}wllama.js`);
  const w = new Wllama({ default: `${VENDOR}wllama.wasm` }, { suppressNativeLog: true });
  w.setCompat({ worker: `${VENDOR}wllama-compat.js`, wasm: `${VENDOR}wllama-compat.wasm` });
  try {
    // MiniCPM reasons out loud first unless its chat template is told not to.
    await w.loadModel([new Blob(parts)], { n_ctx: 4096, default_template_kwargs: { enable_thinking: false } });
  } catch (e) {
    await w.exit().catch(() => {});
    if (e instanceof Error && /NotReadableError/.test(e.message)) throw new Error("This window couldn't hold the model. If it's a private window, try a normal one.", { cause: e });
    throw e;
  }
  return {
    async chat(messages, onDelta, stop) {
      const stream = await w.createChatCompletion({ messages, stream: true, abortSignal: stop, ...GENERATION });
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta.content;
        if (text) onDelta(text);
      }
    },
    close: () => w.exit().catch(() => {}),
  };
}
