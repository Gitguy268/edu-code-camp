@test("the first line is Python is awake")
def _():
    lines = output().splitlines()
    assert lines and lines[0] == "Python is awake", f"The first line should be 'Python is awake', got {lines[0]!r}" if lines else "Nothing was printed"

@test("the second line is 2 + 2 = 4")
def _():
    lines = output().splitlines()
    assert len(lines) >= 2 and lines[1] == "2 + 2 = 4", "The second line should be '2 + 2 = 4'"

@test("Python did the maths")
def _():
    src = source
    assert "2 + 2" in src and '"2 + 2 = 4"' not in src and "'2 + 2 = 4'" not in src, "Let Python calculate 2 + 2 instead of typing 4 yourself"
