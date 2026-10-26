// Runs learner JavaScript, then the lesson's hidden tests in the same scope.
// Shared by the JS worker and scripts/selfcheck.mjs, so it must not touch the DOM.

export function show(value, seen = new Set()) {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "function") return `[function ${value.name || "anonymous"}]`;
  if (typeof value === "bigint") return `${value}n`;
  if (value === null || typeof value !== "object") return String(value);
  if (seen.has(value)) return "[circular]";
  seen.add(value);
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (Array.isArray(value)) return `[${value.map(v => show(v, seen)).join(", ")}]`;
  if (value instanceof Map) return `Map(${[...value].map(([k, v]) => `${show(k, seen)} => ${show(v, seen)}`).join(", ")})`;
  if (value instanceof Set) return `Set(${[...value].map(v => show(v, seen)).join(", ")})`;
  const entries = Object.entries(value).map(([k, v]) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${show(v, seen)}`);
  return entries.length ? `{ ${entries.join(", ")} }` : "{}";
}

// What console.log prints: strings bare, everything else shown.
const print = v => (typeof v === "string" ? v : show(v));

function equal(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Map && b instanceof Map) return a.size === b.size && [...a].every(([k, v]) => b.has(k) && equal(v, b.get(k)));
  if (a instanceof Set && b instanceof Set) return a.size === b.size && [...a].every(v => b.has(v));
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every(k => Object.hasOwn(b, k) && equal(a[k], b[k]));
}

class TestFailure extends Error {}

// expect(actual, "what this is").toBe(expected). The label makes failures read like a hint.
export function expect(actual, label) {
  const what = label ?? show(actual);
  const make = negate => {
    const check = (ok, text) => {
      if (ok === negate) throw new TestFailure(`${what} ${negate ? "should not " : "should "}${text}${negate ? "" : `, but got ${show(actual)}`}`);
    };
    return {
      toBe: e => check(Object.is(actual, e), `be ${show(e)}`),
      toEqual: e => check(equal(actual, e), `equal ${show(e)}`),
      toContain: e => check(actual != null && typeof actual.includes === "function" && actual.includes(e), `contain ${show(e)}`),
      toMatch: re => check(typeof actual === "string" && re.test(actual), `match ${re}`),
      toHaveLength: n => check(actual != null && actual.length === n, `have length ${n}`),
      toBeTruthy: () => check(Boolean(actual), "be truthy"),
      toBeFalsy: () => check(!actual, "be falsy"),
      toBeGreaterThan: n => check(actual > n, `be greater than ${n}`),
      toBeLessThan: n => check(actual < n, `be less than ${n}`),
      toBeCloseTo: (n, digits = 2) => check(Math.abs(actual - n) < 10 ** -digits / 2, `be close to ${n}`),
      toBeType: t => check((Array.isArray(actual) ? "array" : typeof actual) === t, `be of type ${t}`),
      toThrow: () => {
        let threw = false;
        try { actual(); } catch { threw = true; }
        if (threw === negate) throw new TestFailure(`${label ?? "the function"} ${negate ? "should not throw" : "should throw an error"}`);
      },
    };
  };
  return Object.assign(make(false), { not: make(true) });
}

// Line numbers in errors count from the learner's first line.
const HEADER_LINES = 2;
function describe(err) {
  if (!(err instanceof Error)) return `Uncaught ${show(err)}`;
  const m = /<anonymous>:(\d+):(\d+)/.exec(err.stack ?? "");
  const line = m ? Number(m[1]) - HEADER_LINES : 0;
  return `${err.name}: ${err.message}${line > 0 ? ` (line ${line})` : ""}`;
}

/**
 * @param {string} code learner code
 * @param {string|null} tests hidden tests, or null to only run the code
 * @param {(text: string, level: string) => void} [onLog]
 */
export async function runJs(code, tests, onLog) {
  const lines = [];
  const logger = level => (...args) => {
    const text = args.map(print).join(" ");
    lines.push(text);
    onLog?.(text, level);
  };
  const con = { log: logger("log"), info: logger("log"), debug: logger("log"), warn: logger("warn"), error: logger("error"), table: logger("log") };
  const queue = [];
  const test = (name, fn) => queue.push({ name, fn });
  const output = () => lines.join("\n");
  const results = [];
  const AsyncFunction = (async () => {}).constructor;
  let fn;
  try {
    // The tests live in a closure after the learner's code: they see the learner's names, and the
    // learner can still name their own things test, expect or output.
    fn = new AsyncFunction("console", `${code}\n;\nreturn async (test, expect, output, source) => {\n${tests ?? ""}\n};`);
  } catch (err) {
    return { pass: false, error: `${err.name}: ${err.message}`, results, output: output() };
  }
  try {
    const runTests = await fn(con);
    await runTests(test, expect, output, code);
  } catch (err) {
    return { pass: false, error: describe(err), results, output: output() };
  }
  for (const t of queue) {
    try {
      await t.fn();
      results.push({ name: t.name, pass: true });
    } catch (err) {
      results.push({ name: t.name, pass: false, message: err instanceof TestFailure ? err.message : describe(err) });
    }
  }
  return { pass: tests == null || (results.length > 0 && results.every(r => r.pass)), results, output: output() };
}
