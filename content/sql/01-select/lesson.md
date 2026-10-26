---
title: SELECT your first rows
summary: Ask a table for its data.
xp: 10
---
A **database** keeps data in **tables**. A table is like a spreadsheet: every **row** is one thing, every **column** is one fact about it.

This lesson's database has a table called `campers`:

| id | name | age | cabin |
|---|---|---|---|
| 1 | Ada | 12 | Pine |
| 2 | Grace | 11 | Oak |
| … | … | … | … |

You ask a database for data with **SQL**. The most important word is `SELECT`:

```sql
SELECT name, age FROM campers;
```

That reads: *give me the name and age columns from the campers table.* Use `*` to get every column:

```sql
SELECT * FROM campers;
```

The semicolon `;` ends a statement.

## Your task

Get the `name` and `cabin` of every camper, in that column order.
