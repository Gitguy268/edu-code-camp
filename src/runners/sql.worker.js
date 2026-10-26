import initSqlJs from "sql.js/dist/sql-wasm.js";
import { runSql } from "./sql-harness.js";

let SQL;
const ready = initSqlJs({ locateFile: () => new URL("vendor/sql.js/sql-wasm.wasm", self.name || self.location.href).href })
  .then(m => { SQL = m; self.postMessage({ type: "ready" }); })
  .catch(err => self.postMessage({ type: "failed", error: String(err?.message ?? err) }));

self.onmessage = async ({ data: { id, code, tests, seed } }) => {
  await ready;
  self.postMessage({ id, type: "done", result: runSql(SQL, seed, code, tests) });
};
