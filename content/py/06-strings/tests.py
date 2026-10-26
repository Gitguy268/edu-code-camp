@test('initials("ada lovelace") is "A.L."')
def _():
    assert initials("ada lovelace") == "A.L.", f"got {initials('ada lovelace')!r}"

@test("initials works for three names")
def _():
    assert initials("Grace Brewster Hopper") == "G.B.H.", f"got {initials('Grace Brewster Hopper')!r}"

@test("palindromes ignore case")
def _():
    assert is_palindrome("Kayak") is True, "Kayak is a palindrome"
    assert is_palindrome("level") is True, "level is a palindrome"

@test("other words are not palindromes")
def _():
    assert is_palindrome("canoe") is False, "canoe is not a palindrome"
