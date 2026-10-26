---
title: Variables and f-strings
summary: Name your values.
xp: 15
---
In Python you make a variable just by giving it a value:

```python
camp = "Pine Lake"
tents = 3
tents = tents + 1
```

Names use lowercase words joined by underscores, like `tent_count`.

To put values inside text, use an **f-string**: an `f` before the quotes, and `{...}` around each value:

```python
print(f"{camp} has {tents} tents")   # Pine Lake has 4 tents
```

## Your task

1. Make a variable `camper` with the value `"Grace"`.
2. Make a variable `marshmallows` with the value `4`, then add `3` to it on the next line.
3. Print `Grace toasted 7 marshmallows` with an f-string.
