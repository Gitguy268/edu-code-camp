---
title: Filter with WHERE
summary: Only the rows you want.
xp: 15
---
`WHERE` keeps only the rows that match a condition:

```sql
SELECT name FROM campers WHERE age >= 12;
```

Text goes in single quotes: `WHERE cabin = 'Oak'`. Combine conditions with `AND` and `OR`:

```sql
SELECT name FROM campers WHERE cabin = 'Oak' AND age < 12;
```

The camp database has three tables:

- `campers` (id, name, age, cabin)
- `activities` (id, title, place)
- `signups` (camper_id, activity_id): who signed up for what

## Your task

Get the `name` and `age` of every camper in the **Pine** cabin who is **older than 11**.
