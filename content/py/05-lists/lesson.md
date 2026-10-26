---
title: Lists and for loops
summary: Go through every item.
xp: 20
---
A **list** holds values in order: `weights = [2, 7, 1, 4]`

A `for` loop takes each item in turn:

```python
total = 0
for w in weights:
    total = total + w
print(total)   # 14
```

You can build a new list as you go with `.append()`:

```python
big = []
for w in weights:
    if w > 3:
        big.append(w)
# big is [7, 4]
```

## Your task

Backpack items are weights in kilos.

1. `total_weight(items)` returns the sum of the list. Write the loop yourself (no `sum()` this time).
2. `heavy(items, limit)` returns a new list with the weights that are **more than** `limit`.
