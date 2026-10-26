---
title: Search with grep and pipes
summary: Find lines and count them.
xp: 25
---
`grep word file` prints every line of `file` that contains `word`:

```sh
grep owl logbook.txt
```

A **pipe** `|` sends one command's output into the next command. `wc -l` counts lines:

```sh
grep owl logbook.txt | wc -l
```

Useful options: `grep -i` ignores upper and lower case, and `grep -c` counts matching lines by itself.

## Your task

The camp's `logbook.txt` notes every animal anyone saw. How many lines mention a **bear**? Some say "Bear", some say "bear".

Write just the number into `bears.txt`. You can redirect a whole pipe: `... | wc -l > bears.txt`
