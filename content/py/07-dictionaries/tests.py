@test("counts each cabin")
def _():
    got = count_cabins([("Ada", "Pine"), ("Grace", "Oak"), ("Linus", "Pine")])
    assert got == {"Pine": 2, "Oak": 1}, f"got {got!r}"

@test("a bigger camp")
def _():
    camp = [("A", "Oak"), ("B", "Birch"), ("C", "Oak"), ("D", "Oak"), ("E", "Birch")]
    got = count_cabins(camp)
    assert got == {"Oak": 3, "Birch": 2}, f"got {got!r}"

@test("no campers, no cabins")
def _():
    assert count_cabins([]) == {}, f"count_cabins([]) returned {count_cabins([])!r}"
