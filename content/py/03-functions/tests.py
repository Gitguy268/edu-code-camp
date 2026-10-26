@test('greet("Linus") returns "Hello, Linus!"')
def _():
    got = greet("Linus")
    assert got == "Hello, Linus!", f"greet('Linus') returned {got!r}"

@test("works for any name")
def _():
    for name in ["Ada", "Barbara", "Ken"]:
        assert greet(name) == f"Hello, {name}!", f"greet({name!r}) returned {greet(name)!r}"
