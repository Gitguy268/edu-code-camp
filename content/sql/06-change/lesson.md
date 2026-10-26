---
title: Change data with INSERT and UPDATE
summary: Add rows and edit them.
xp: 25
---
So far you've only read data. These statements change it:

```sql
INSERT INTO campers (name, age, cabin) VALUES ('Ken', 11, 'Birch');

UPDATE campers SET cabin = 'Oak' WHERE name = 'Ada';

DELETE FROM signups WHERE camper_id = 5;
```

Always check the `WHERE` on an `UPDATE` or `DELETE`. Without it, *every* row changes.

You can write several statements, one after the other, each ending with `;`.

The camp database has three tables:

- `campers` (id, name, age, cabin)
- `activities` (id, title, place)
- `signups` (camper_id, activity_id): who signed up for what

## Your task

1. A new camper arrives: **Katherine**, age **12**, cabin **Birch**. Add her.
2. **Alan** moves to the **Pine** cabin. Update his row, and only his.
