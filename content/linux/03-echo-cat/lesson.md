---
title: Write and read files
summary: echo, cat and redirection.
xp: 20
---
`echo` prints text. `cat` prints what's in a file:

```sh
echo "hello"
cat notes.txt
```

The real trick is **redirection**. `>` sends a command's output into a file instead of the screen, and `>>` adds it to the end:

```sh
echo "water" > list.txt    # list.txt now holds one line: water
echo "map" >> list.txt     # now two lines
cat list.txt
```

Careful: `>` replaces whatever was in the file.

## Your task

Make a file `packing.txt` with exactly these three lines, in this order:

```
water
map
snacks
```

Check it with `cat packing.txt`.
