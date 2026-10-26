---
title: "Final challenge: the scoreboard"
summary: Put arrays, objects and sorting together.
xp: 30
---
Time to combine what you know. At the end of the camp games, every result looks like this:

```js
{ name: "Ada", points: 7 }
```

Arrays have a `.sort()` method that takes a **compare function**. It gets two items, `a` and `b`, and returns a negative number if `a` should go first, a positive number if `b` should go first, and `0` if they're equal:

```js
[3, 1, 2].sort((a, b) => a - b);   // [1, 2, 3]
[3, 1, 2].sort((a, b) => b - a);   // [3, 2, 1]
"Ada".localeCompare("Ken");        // negative: "Ada" comes first
```

Careful: `.sort()` changes the array it's called on. Copy it first with `[...results]`.

## Your task

Write `scoreboard(results)` that returns the **names** in order of points, highest first. When two campers have the same points, put them in alphabetical order.

```js
scoreboard([
  { name: "Linus", points: 5 },
  { name: "Ada", points: 7 },
  { name: "Grace", points: 5 },
]);
// ["Ada", "Grace", "Linus"]
```
