---
title: Variables and template strings
summary: Give values a name.
xp: 15
---
A **variable** is a name for a value, so you can use it again later.

```js
const camp = "Pine Lake";
let tents = 3;
tents = tents + 1;   // let can change, const can't
```

Use `const` for values that stay the same and `let` for values that change.

To build text out of values, use a **template string**: backticks instead of quotes, and `${...}` around each value:

```js
console.log(`${camp} has ${tents} tents`);   // Pine Lake has 4 tents
```

## Your task

1. Make a `const` called `camper` with the value `"Ada"`.
2. Make a `let` called `marshmallows` with the value `5`, then add `2` to it on the next line.
3. Print `Ada toasted 7 marshmallows` with a template string that uses both variables.
