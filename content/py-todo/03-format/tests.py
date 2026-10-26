@test("formats each task on its own line")
def _():
    tasks = [{"title": "Pitch the tent", "done": False}, {"title": "Find water", "done": True}, {"title": "Gather firewood", "done": False}]
    want = "1. [ ] Pitch the tent\n2. [x] Find water\n3. [ ] Gather firewood"
    got = format_tasks(tasks)
    assert got == want, f"got:\n{got}"

@test("an empty list is an empty string")
def _():
    assert format_tasks([]) == "", f"got {format_tasks([])!r}"
