---
title: Objects
summary: Group facts about one thing.
xp: 20
---
An **object** groups named values, called **properties**:

```js
const camper = { name: "Ada", age: 12, cabin: "Pine" };
camper.name;   // "Ada"
camper.age;    // 12
```

You can make a new object from an old one with the **spread** `...` and change a property on the way:

```js
const older = { ...camper, age: camper.age + 1 };
// camper is unchanged, older.age is 13
```

Making a new object instead of changing the old one avoids surprises when other code still uses the old one.

## Your task

1. `describe(camper)` returns a sentence like `"Ada (12) sleeps in Pine"`.
2. `birthday(camper)` returns a **new** camper object with `age` one higher. The original must not change.
