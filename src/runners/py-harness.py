# Runs learner Python, then the lesson's hidden tests in the same namespace.
# Loaded by the Python worker and by scripts/selfcheck.mjs. The caller sets _camp_emit first:
# _camp_emit(text) streams printed text out; _camp_run(code, tests) returns the result as JSON.
import builtins, io, json, sys, traceback

_camp_buf = io.StringIO()

class _CampOut:
    def write(self, s):
        _camp_buf.write(s)
        _camp_emit(s)
        return len(s)
    def flush(self):
        pass

def _camp_input(prompt=""):
    raise RuntimeError("input() can't read the keyboard in edu-code-camp; pass values into your functions instead")

def _camp_error(err):
    # Only show frames from the learner's file, with their line numbers.
    frames = [f for f in traceback.extract_tb(err.__traceback__) if f.filename == "main.py"]
    where = f" (line {frames[-1].lineno})" if frames else ""
    if isinstance(err, SyntaxError) and err.filename == "main.py":
        where = f" (line {err.lineno})"
        return f"SyntaxError: {err.msg}{where}"
    return f"{type(err).__name__}: {err}{where}"

def _camp_run(code, tests):
    _camp_buf.seek(0)
    _camp_buf.truncate()
    out = _CampOut()
    old_out, old_err, old_input = sys.stdout, sys.stderr, builtins.input
    sys.stdout = sys.stderr = out
    builtins.input = _camp_input
    ns = {"__name__": "__main__"}
    results = []
    try:
        try:
            exec(compile(code, "main.py", "exec"), ns)
        except BaseException as err:
            return json.dumps({"pass": False, "error": _camp_error(err), "results": [], "output": _camp_buf.getvalue()})
        if tests is None:
            return json.dumps({"pass": True, "results": [], "output": _camp_buf.getvalue()})
        registered = []
        def test(name):
            def deco(fn):
                registered.append((name, fn))
                return fn
            return deco
        ns["test"] = test
        ns["output"] = lambda: _camp_buf.getvalue()
        ns["source"] = code
        exec(compile(tests, "tests.py", "exec"), ns)
        for name, fn in registered:
            try:
                fn()
                results.append({"name": name, "pass": True})
            except AssertionError as err:
                results.append({"name": name, "pass": False, "message": str(err) or "a check failed"})
            except BaseException as err:
                results.append({"name": name, "pass": False, "message": _camp_error(err)})
        ok = bool(results) and all(r["pass"] for r in results)
        return json.dumps({"pass": ok, "results": results, "output": _camp_buf.getvalue()})
    finally:
        sys.stdout, sys.stderr, builtins.input = old_out, old_err, old_input
