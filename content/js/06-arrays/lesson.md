---
title: Working with arrays
summary: filter and map.
xp: 20
---
An **array** is a list of values: `const names = ["Ada", "Linus", "Grace"];`

- `names.length` is how many items there are.
- `names[0]` is the first item.

Two array methods save you from writing loops by hand. Both take a small function and give back a **new** array:

```js
const nums = [3, 8, 1, 10];
nums.filter(n => n > 5);   // [8, 10]       keep the items where the test is true
nums.map(n => n * 2);      // [6, 16, 2, 20] change every item
```

`n => n > 5` is an **arrow function**: a short way to write a function that takes `n` and returns `n > 5`.

## Your task

1. `longNames(names)` returns only the names with **more than 4 letters**.
2. `shout(names)` returns every name in capital letters. Strings have a `.toUpperCase()` method.
