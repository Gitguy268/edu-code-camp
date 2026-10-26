---
title: "Step 5: talk to your app"
summary: Parse commands and finish the app.
xp: 40
carry: true
---
Last step: a command line. A real terminal app reads a line of text, works out the command, and answers. You'll write the part that does the work, so it can be tested.

`partition` splits text at the first space:

```python
"add Buy snacks".partition(" ")   # ("add", " ", "Buy snacks")
"list".partition(" ")             # ("list", "", "")
```

`"12".isdigit()` is `True` and `int("12")` turns text into a number.

## Your task

Write `run_command(tasks, line)` that returns the app's answer. Reuse the functions you already wrote.

| line | does | returns |
|---|---|---|
| `add Buy snacks` | adds the task | `Added: Buy snacks` |
| `done 2` | completes task 2 | `Done: <its title>`, or `No such task` |
| `list` | | the formatted list, or `Nothing to do. Go swimming!` when empty |
| `summary` | | the summary |
| anything else | | `Unknown command` |
