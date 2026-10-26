---
title: Making decisions
summary: if, else if and else.
xp: 15
---
Programs choose what to do with `if`:

```js
function canSwim(age) {
  if (age >= 12) {
    return "yes";
  } else if (age >= 8) {
    return "with a lifeguard";
  } else {
    return "not yet";
  }
}
```

JavaScript checks each condition from the top and runs the first block whose condition is true.

Comparisons you'll use a lot: `<`, `>`, `<=`, `>=`, `===` (equal) and `!==` (not equal).

## Your task

Write `packFor(temperature)` that returns what to wear:

| temperature | return |
|---|---|
| below 10 | `"jacket"` |
| 10 up to (not including) 20 | `"sweater"` |
| 20 or more | `"t-shirt"` |
