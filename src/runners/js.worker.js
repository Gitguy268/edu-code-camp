import { runJs } from "./js-harness.js";

self.onmessage = async ({ data: { id, code, tests } }) => {
  const result = await runJs(code, tests, (text, level) => self.postMessage({ id, type: "log", text, level }));
  self.postMessage({ id, type: "done", result });
};
self.postMessage({ type: "ready" });
