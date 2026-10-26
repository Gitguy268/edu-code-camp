---
title: Count with GROUP BY
summary: Summaries instead of rows.
xp: 20
---
**Aggregate** functions squash many rows into one value: `COUNT(*)`, `SUM(age)`, `AVG(age)`, `MIN(age)`, `MAX(age)`.

```sql
SELECT COUNT(*) FROM campers;   -- 8
```

`GROUP BY` makes one group per value and runs the aggregate for each group:

```sql
SELECT cabin, MAX(age) FROM campers GROUP BY cabin;
```

Give a result column a name with `AS`: `COUNT(*) AS total`.

The camp database has three tables:

- `campers` (id, name, age, cabin)
- `activities` (id, title, place)
- `signups` (camper_id, activity_id): who signed up for what

## Your task

For each cabin, show the cabin and how many campers sleep there. Name the count column `campers`.
