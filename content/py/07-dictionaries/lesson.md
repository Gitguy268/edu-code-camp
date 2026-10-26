---
title: Dictionaries
summary: Look things up by key.
xp: 20
---
A **dictionary** maps **keys** to **values**:

```python
ages = {"Ada": 12, "Linus": 13}
ages["Ada"]           # 12
ages["Grace"] = 11    # add a new key
"Linus" in ages       # True
ages.get("Ken", 0)    # 0, because Ken isn't there
```

Dictionaries are perfect for counting:

```python
counts = {}
for fruit in ["apple", "pear", "apple"]:
    counts[fruit] = counts.get(fruit, 0) + 1
# {"apple": 2, "pear": 1}
```

Pairs of values often travel as **tuples**: `("Ada", "Pine")`. A loop can unpack them: `for name, cabin in pairs:`

## Your task

Write `count_cabins(campers)`. It gets a list of `(name, cabin)` tuples and returns a dictionary with how many campers sleep in each cabin.
