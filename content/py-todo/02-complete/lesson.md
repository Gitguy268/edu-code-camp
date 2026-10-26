---
title: "Step 2: tick it off"
summary: Change an item in a list.
xp: 20
carry: true
---
People count from 1, Python counts from 0. When someone says "task 1" they mean `tasks[0]`.

You can change a dictionary that sits inside a list directly:

```python
tasks[0]["done"] = True
```

`len(tasks)` tells you how many tasks there are.

## Your task

Your code from step 1 is above. Below it, write `complete_task(tasks, number)`:

- `number` counts from 1.
- Mark that task as done and return `True`.
- If there is no task with that number (0, negative, or too big), change nothing and return `False`.
