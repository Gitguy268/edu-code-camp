@test("add")
def _():
    tasks = []
    assert run_command(tasks, "add Buy snacks") == "Added: Buy snacks", "add should answer 'Added: Buy snacks'"
    assert tasks == [{"title": "Buy snacks", "done": False}], f"tasks is {tasks!r}"

@test("done")
def _():
    tasks = [{"title": "Find water", "done": False}]
    assert run_command(tasks, "done 1") == "Done: Find water", f"got {run_command([{'title': 'Find water', 'done': False}], 'done 1')!r}"
    assert tasks[0]["done"] is True, "done 1 should complete task 1"
    assert run_command(tasks, "done 7") == "No such task", "done 7 should answer 'No such task'"
    assert run_command(tasks, "done x") == "No such task", "done x should answer 'No such task'"

@test("list")
def _():
    tasks = [{"title": "A", "done": True}]
    assert run_command(tasks, "list") == "1. [x] A", f"got {run_command(tasks, 'list')!r}"
    assert run_command([], "list") == "Nothing to do. Go swimming!", "an empty list should say 'Nothing to do. Go swimming!'"

@test("summary")
def _():
    tasks = [{"title": "A", "done": True}, {"title": "B", "done": False}]
    assert run_command(tasks, "summary") == "1 of 2 done", f"got {run_command(tasks, 'summary')!r}"

@test("unknown commands")
def _():
    assert run_command([], "dance") == "Unknown command", "Anything else should answer 'Unknown command'"
