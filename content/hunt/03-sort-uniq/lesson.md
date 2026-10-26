---
title: "Step 3: the bird count"
summary: sort, uniq -c and pipes.
xp: 30
---
The boathouse keeps a bird list, `hunt/lake/boathouse/birds.txt`, one bird per line. The third secret word is **the bird seen most often**.

Chain commands with pipes:

- `sort` puts lines in order, so equal lines end up next to each other.
- `uniq -c` squashes runs of equal lines and counts them.
- `sort -n` sorts by number, and `tail -1` keeps the last line.

```sh
sort birds.txt | uniq -c
```

## Your task

Find the most common bird and save its name (lowercase, just the name) into `word3.txt`.
