---
title: "Step 4: how far along?"
summary: Count with a comprehension.
xp: 25
carry: true
---
A **list comprehension** builds a list in one line:

```python
done = [t for t in tasks if t["done"]]
```

It reads like English: *t, for each t in tasks, if t is done*.

## Your task

Write `summary(tasks)`:

- normally it returns `"2 of 3 done"` (with the real numbers)
- for an empty list it returns `"Nothing to do. Go swimming!"`
