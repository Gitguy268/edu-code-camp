@test("adds a task to an empty list")
def _():
    tasks = []
    add_task(tasks, "Pitch the tent")
    assert tasks == [{"title": "Pitch the tent", "done": False}], f"tasks is {tasks!r}"

@test("adds to the end")
def _():
    tasks = [{"title": "A", "done": True}]
    add_task(tasks, "B")
    assert [t["title"] for t in tasks] == ["A", "B"], f"tasks is {tasks!r}"

@test("returns the list")
def _():
    tasks = []
    assert add_task(tasks, "X") is tasks, "Return the same list you were given"
