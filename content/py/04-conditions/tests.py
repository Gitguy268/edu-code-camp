@test("short trails are easy")
def _():
    assert trail_level(2) == "easy", f"trail_level(2) returned {trail_level(2)!r}"
    assert trail_level(4.9) == "easy", "4.9 km is still easy"

@test("5 to 12 km is medium")
def _():
    for km in (5, 8, 12):
        assert trail_level(km) == "medium", f"trail_level({km}) returned {trail_level(km)!r}"

@test("more than 12 km is hard")
def _():
    assert trail_level(12.5) == "hard", f"trail_level(12.5) returned {trail_level(12.5)!r}"
    assert trail_level(30) == "hard", f"trail_level(30) returned {trail_level(30)!r}"
