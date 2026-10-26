---
title: "Step 3: show the list"
summary: Build text with enumerate.
xp: 25
carry: true
---
Now let's print the list nicely, like this:

```
1. [ ] Pitch the tent
2. [x] Find water
3. [ ] Gather firewood
```

`enumerate` gives you a counter along with each item. `start=1` makes it count from 1:

```python
for i, task in enumerate(tasks, start=1):
    ...
```

Collect the lines in a list, then glue them together with newlines: `"\n".join(lines)`.

## Your task

Write `format_tasks(tasks)` that **returns** the text above (no newline at the very end). Done tasks get `[x]`, the others `[ ]`. An empty list gives an empty string.
