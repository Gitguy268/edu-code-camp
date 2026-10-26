@test("counts done tasks")
def _():
    tasks = [{"title": "A", "done": True}, {"title": "B", "done": False}, {"title": "C", "done": True}]
    assert summary(tasks) == "2 of 3 done", f"got {summary(tasks)!r}"

@test("nothing done yet")
def _():
    assert summary([{"title": "A", "done": False}]) == "0 of 1 done", f"got {summary([{'title': 'A', 'done': False}])!r}"

@test("empty list")
def _():
    assert summary([]) == "Nothing to do. Go swimming!", f"got {summary([])!r}"
