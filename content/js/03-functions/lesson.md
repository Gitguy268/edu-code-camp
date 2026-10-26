---
title: Functions
summary: Package up code you can reuse.
xp: 15
---
A **function** is a named piece of code. You give it **parameters** going in and it can **return** a value coming out:

```js
function double(n) {
  return n * 2;
}

console.log(double(4));   // 8
```

`return` hands a value back to whoever called the function, and stops the function right there. A function that only *prints* doesn't return anything, so its result is `undefined`.

## Your task

Write a function `greet(name)` that **returns** a greeting like this:

```js
greet("Grace")   // "Hello, Grace!"
greet("Linus")   // "Hello, Linus!"
```

The checks call your function with names they choose, so don't print inside it, return the text.
