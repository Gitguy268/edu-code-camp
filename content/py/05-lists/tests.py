@test("total_weight adds the weights")
def _():
    assert total_weight([2, 7, 1, 4]) == 14, f"total_weight([2, 7, 1, 4]) returned {total_weight([2, 7, 1, 4])!r}"

@test("an empty backpack weighs 0")
def _():
    assert total_weight([]) == 0, f"total_weight([]) returned {total_weight([])!r}"

@test("uses a for loop, not sum()")
def _():
    assert "for " in source and "sum(" not in source, "Add the numbers up with a for loop"

@test("heavy keeps items over the limit")
def _():
    got = heavy([2, 7, 1, 4, 3], 3)
    assert got == [7, 4], f"heavy([2, 7, 1, 4, 3], 3) returned {got!r}"
