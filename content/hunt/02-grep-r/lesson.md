---
title: "Step 2: the logbooks"
summary: grep through many files.
xp: 25
---
The `hunt/logs` folder has thirty logbooks. One line in one of them says where *X marks the spot*.

Opening thirty files one by one is slow. `grep -r` searches every file in a folder and shows which file each match came from:

```sh
grep -r "beans" hunt/logs
```

## Your task

Find the line that says **X marks the spot** and save the word at the end of it into `word2.txt`.
