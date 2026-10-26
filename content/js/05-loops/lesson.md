---
title: Loops
summary: Do something again and again.
xp: 20
---
A `for` loop repeats code. It has three parts: where to start, when to keep going, and what to do after each round:

```js
for (let i = 1; i <= 3; i++) {
  console.log(`Round ${i}`);
}
// Round 1, Round 2, Round 3
```

`i++` means "add one to `i`". To count down, start high and use `i--`.

Loops are great for building up a result:

```js
let total = 0;
for (let i = 1; i <= 4; i++) {
  total = total + i;
}
// total is 10
```

## Your task

Write `countdown(n)` that returns an **array** of the numbers from `n` down to `1`.

```js
countdown(5)   // [5, 4, 3, 2, 1]
countdown(1)   // [1]
countdown(0)   // []
```

Start with an empty array `[]` and add numbers to it with `.push(number)`.
