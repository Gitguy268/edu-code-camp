@test("guesses(50) is [50]")
def _():
    assert guesses(50) == [50], f"guesses(50) returned {guesses(50)!r}"

@test("guesses(75) is [50, 75]")
def _():
    assert guesses(75) == [50, 75], f"guesses(75) returned {guesses(75)!r}"

@test("guesses(1) is [50, 25, 12, 6, 3, 1]")
def _():
    assert guesses(1) == [50, 25, 12, 6, 3, 1], f"guesses(1) returned {guesses(1)!r}"

@test("never needs more than 7 guesses")
def _():
    worst = max(len(guesses(n)) for n in range(1, 101))
    assert worst <= 7, f"One number took {worst} guesses"

@test("always ends on the secret")
def _():
    for n in (2, 37, 99, 100):
        assert guesses(n)[-1] == n, f"guesses({n}) ended on {guesses(n)[-1]!r}"
