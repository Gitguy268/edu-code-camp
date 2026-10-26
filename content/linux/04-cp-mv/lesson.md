---
title: Copy and move
summary: cp and mv.
xp: 20
---
- `cp a.txt b.txt` copies a file. `cp a.txt backup/` copies it into a folder.
- `mv a.txt b.txt` renames a file. `mv a.txt photos/` moves it into a folder.
- `*` matches any characters: `*.jpg` means "every name ending in .jpg".

```sh
mv inbox/*.jpg photos/
```

## Your task

Your `inbox` is a mess. Tidy it:

1. Make a folder `photos` and **move** every `.jpg` from `inbox` into it.
2. Make a folder `backup` and **copy** `inbox/notes.txt` into it. The original stays in `inbox`.
