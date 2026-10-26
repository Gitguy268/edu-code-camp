---
title: JOIN tables together
summary: Combine rows from two tables.
xp: 25
---
The `signups` table only stores numbers: which camper id signed up for which activity id. To see names, **join** the tables on the columns that match:

```sql
SELECT campers.name, signups.activity_id
FROM signups
JOIN campers ON campers.id = signups.camper_id;
```

You can join more than one table in a row:

```sql
FROM signups
JOIN campers ON campers.id = signups.camper_id
JOIN activities ON activities.id = signups.activity_id
```

The camp database has three tables:

- `campers` (id, name, age, cabin)
- `activities` (id, title, place)
- `signups` (camper_id, activity_id): who signed up for what

## Your task

List every signup as the camper's `name` and the activity's `title`, sorted by name and then by title.
