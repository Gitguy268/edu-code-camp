// Runs learner SQL against a fresh copy of the lesson's database, then the hidden checks.
// Shared by the SQL worker and scripts/selfcheck.mjs.

const norm = v => (typeof v === "number" ? Math.round(v * 1e6) / 1e6 : v);
const key = row => JSON.stringify(row.map(norm));

function sameRows(got, want, ordered) {
  if (got.length !== want.length) return false;
  const a = got.map(key), b = want.map(key);
  if (!ordered) { a.sort(); b.sort(); }
  return a.every((k, i) => k === b[i]);
}

/**
 * tests: [{ name, query?, rows, columns?, ordered?, hint? }]. Without `query`, a check looks at
 * the last result that returned rows from the learner's own SQL.
 */
export function runSql(SQL, seed, code, tests) {
  const db = new SQL.Database();
  try {
    if (seed) db.exec(seed);
    let tables;
    try {
      tables = db.exec(code);
    } catch (err) {
      return { pass: false, error: `SQL error: ${err.message}`, results: [], tables: [] };
    }
    if (tests == null) return { pass: true, results: [], tables };
    const last = tables.at(-1);
    const results = tests.map(t => {
      let got = last;
      if (t.query) got = db.exec(t.query)[0] ?? { columns: [], values: [] };
      if (!got) return { name: t.name, pass: false, message: t.hint ?? "Your SQL didn't return any rows" };
      if (t.columns && (got.columns.length !== t.columns.length || got.columns.some((c, i) => c.toLowerCase() !== t.columns[i].toLowerCase())))
        return { name: t.name, pass: false, message: `Expected columns ${t.columns.join(", ")}, got ${got.columns.join(", ")}` };
      if (!sameRows(got.values, t.rows, t.ordered))
        return { name: t.name, pass: false, message: t.hint ?? `Expected ${t.rows.length} row(s), got ${got.values.length}` };
      return { name: t.name, pass: true };
    });
    return { pass: results.every(r => r.pass), results, tables };
  } finally {
    db.close();
  }
}
