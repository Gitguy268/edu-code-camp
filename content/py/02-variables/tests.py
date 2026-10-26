@test("camper is Grace")
def _():
    assert camper == "Grace", f"camper should be 'Grace', got {camper!r}"

@test("marshmallows ends up at 7")
def _():
    assert marshmallows == 7, f"marshmallows should be 7, got {marshmallows!r}"

@test("prints Grace toasted 7 marshmallows")
def _():
    assert output().strip() == "Grace toasted 7 marshmallows", f"You printed {output().strip()!r}"

@test("uses an f-string")
def _():
    assert 'f"' in source or "f'" in source, "Put an f before the quotes"
