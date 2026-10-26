---
title: Functions
summary: def and return.
xp: 15
---
You make a function with `def`. The body is **indented**: Python uses the indentation (4 spaces is the habit) to know which lines belong to the function.

```python
def double(n):
    return n * 2

print(double(4))   # 8
```

`return` sends a value back. A function without `return` gives back `None`.

## Your task

Write `greet(name)` that **returns** `"Hello, NAME!"`:

```python
greet("Linus")    # "Hello, Linus!"
```
