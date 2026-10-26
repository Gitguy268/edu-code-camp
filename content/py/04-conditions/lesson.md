---
title: if, elif, else
summary: Choose what happens.
xp: 15
---
Python checks conditions with `if`. Extra cases use `elif` (short for *else if*), and `else` catches everything left:

```python
def can_swim(age):
    if age >= 12:
        return "yes"
    elif age >= 8:
        return "with a lifeguard"
    else:
        return "not yet"
```

Don't forget the colon `:` at the end of each line, and indent the code under it.

## Your task

Write `trail_level(km)` for the trail map:

| km | return |
|---|---|
| less than 5 | `"easy"` |
| 5 up to and including 12 | `"medium"` |
| more than 12 | `"hard"` |
