def camp():
    return [{"title": "Pitch the tent", "done": False}, {"title": "Find water", "done": False}]

@test("marks task 2 as done")
def _():
    tasks = camp()
    assert complete_task(tasks, 2) is True, "complete_task(tasks, 2) should return True"
    assert tasks[1]["done"] is True and tasks[0]["done"] is False, f"tasks is {tasks!r}"

@test("number 1 is the first task")
def _():
    tasks = camp()
    complete_task(tasks, 1)
    assert tasks[0]["done"] is True, "Task 1 is tasks[0]"

@test("returns False for numbers that don't exist")
def _():
    tasks = camp()
    for n in (0, -1, 3, 99):
        assert complete_task(tasks, n) is False, f"complete_task(tasks, {n}) should return False"
    assert not any(t["done"] for t in tasks), "Nothing should change"
