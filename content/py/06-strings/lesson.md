---
title: Strings up close
summary: Split, slice and compare text.
xp: 20
---
Strings come with handy tools:

```python
name = "Ada Lovelace"
name.split()        # ["Ada", "Lovelace"]
name[0]             # "A"   (the first character)
name[-1]            # "e"   (the last one)
name.lower()        # "ada lovelace"
name[::-1]          # "ecalevoL adA"   (reversed)
".".join(["a", "b"])   # "a.b"
```

## Your task

1. `initials(full_name)` returns the first letter of each word in capitals, each followed by a dot: `initials("ada lovelace")` is `"A.L."`
2. `is_palindrome(word)` returns `True` when the word reads the same backwards, ignoring upper and lower case: `is_palindrome("Kayak")` is `True`.
