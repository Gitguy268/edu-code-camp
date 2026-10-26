---
title: "Step 1: add a task"
summary: A list of dictionaries.
xp: 20
---
Welcome to your first **project**. Over five steps you'll build a little to-do app for camp chores. Every step starts with your code from the step before, so you're building one real program.

Each task is a dictionary with a title and whether it's done:

```python
{"title": "Pitch the tent", "done": False}
```

All the tasks live in one list, `tasks`.

## Your task

Write `add_task(tasks, title)`. It adds a new task (not done yet) to the end of the list and **returns the list**.

```python
tasks = []
add_task(tasks, "Pitch the tent")
# tasks is now [{"title": "Pitch the tent", "done": False}]
```
