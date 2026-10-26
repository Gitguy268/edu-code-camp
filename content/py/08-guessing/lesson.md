---
title: "Final challenge: the guessing game"
summary: while loops and halving.
xp: 30
---
A `while` loop repeats **as long as** a condition is true:

```python
n = 1
while n < 100:
    n = n * 2
print(n)   # 128
```

Make sure something in the loop moves towards the end, or it runs forever. (Try it: edu-code-camp will stop it for you.)

**The game:** I think of a number from 1 to 100. You guess, and I say "higher" or "lower". The smart way is to always guess the middle of what's left. That's called **binary search**: every guess throws away half of the numbers.

`//` divides and rounds down: `(1 + 100) // 2` is `50`.

## Your task

Write `guesses(secret)` that plays the game against `secret` and returns the **list of guesses** it made, ending with the right one:

- start with `low = 1` and `high = 100`
- guess `(low + high) // 2`
- if the guess is too low, set `low = guess + 1`; if too high, set `high = guess - 1`

```python
guesses(50)   # [50]
guesses(75)   # [50, 75]
guesses(1)    # [50, 25, 12, 6, 3, 1]
```
