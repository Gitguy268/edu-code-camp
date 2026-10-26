---
title: ORDER BY and LIMIT
summary: Sort and take the top.
xp: 15
---
Rows come back in no promised order unless you ask with `ORDER BY`:

```sql
SELECT name, age FROM campers ORDER BY age;        -- youngest first
SELECT name, age FROM campers ORDER BY age DESC;   -- oldest first
```

Sort by a second column to break ties: `ORDER BY age DESC, name`.

`LIMIT 3` keeps only the first three rows of the result.

The camp database has three tables:

- `campers` (id, name, age, cabin)
- `activities` (id, title, place)
- `signups` (camper_id, activity_id): who signed up for what

## Your task

List the `name` and `age` of the **three oldest** campers, oldest first. When two campers are the same age, sort them by name (A to Z).
