# Writing lessons

Each track is a folder in `content/` with a `track.json`:

```json
{ "title": "Python basics", "lang": "py", "order": 2, "kind": "course", "description": "One sentence for the track card." }
```

`lang` is `js`, `py`, `sql` or `sh`. `kind` is `course` or `project`. Tracks are listed by `order`.

A track can also hold a `seed.sql` (the database every SQL lesson in it starts from) or a `setup.sh` (run before every Linux lesson in it; keep it safe to run twice).

## A lesson

A lesson is a folder named `<nn>-<slug>`, for example `03-functions`. Its address becomes `#/lesson/<track>/<slug>`. Lessons unlock in number order.

| File | What it is |
|---|---|
| `lesson.md` | Front matter (`title`, `summary`, `xp`, and `carry: true` in projects) and the lesson in Markdown. End with a `## Your task` section. |
| `starter.<ext>` | The code the editor starts with. Not used for Linux lessons. |
| `tests.<ext>` | The hidden checks (`tests.json` for SQL). |
| `solution.<ext>` | A correct answer. It is never shipped; `npm run selfcheck` uses it. |
| `seed.sql` / `setup.sh` | Optional, per lesson. |

`npm run selfcheck` fails if a solution doesn't pass its tests, or if the starter already passes. Run it after every change.

With `carry: true`, a step starts from the learner's code for the previous step, with this step's starter added below it. The solution must be the whole program.

Write the failure messages as hints: say what was expected and what came back, never the answer.

## Test helpers

**JavaScript** (`tests.js`). The tests run after the learner's code and can call anything it defines.

```js
test("greet returns a greeting", () => {
  expect(greet("Ada"), 'greet("Ada")').toBe("Hello, Ada!");
});
```

`expect(value, label)` has `toBe`, `toEqual`, `toContain`, `toMatch`, `toHaveLength`, `toBeTruthy`, `toBeFalsy`, `toBeGreaterThan`, `toBeLessThan`, `toBeCloseTo`, `toBeType`, `toThrow` and `.not`. `output()` is everything printed so far and `source` is the learner's code.

**Python** (`tests.py`).

```python
@test("greet returns a greeting")
def _():
    assert greet("Ada") == "Hello, Ada!", f"greet('Ada') returned {greet('Ada')!r}"
```

The assert message is shown to the learner. `output()` and `source` work as in JavaScript. `input()` is not available.

**SQL** (`tests.json`). Each check compares rows. Without `query` it looks at the last result of the learner's SQL. With `query` it runs that query afterwards, which is how you check INSERT, UPDATE and DELETE.

```json
[{ "name": "the three oldest", "columns": ["name", "age"], "rows": [["Barbara", 13]], "ordered": true, "hint": "ORDER BY age DESC" }]
```

**Linux** (`tests.sh`). Runs as root in `/home/camper` after the learner presses **Check my work**.

```sh
check "the gear folder exists" "Make it with mkdir gear" test -d gear
out=$(as_camper ./hello.sh)
if [ "$out" = "Hello" ]; then pass "it prints Hello"; else fail "it prints Hello" "It printed: $out"; fi
```

`check NAME HINT COMMAND...` passes when the command succeeds. `pass` and `fail` report directly, and `as_camper` runs a command as the learner. `setup.sh` runs as root once per lesson; the files end up owned by `camper`.
