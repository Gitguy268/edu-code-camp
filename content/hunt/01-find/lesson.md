---
title: "Step 1: the lost compass"
summary: find files anywhere.
xp: 25
---
Someone hid the camp's treasure chest in the `hunt` folder. To open it you need **three secret words**. Each step finds one.

`find` searches a folder and every folder inside it:

```sh
find hunt -name "*.txt"          # every .txt file
find hunt -name compass.txt      # one file by name
find hunt -type d                # only folders
```

## Your task

Somewhere deep in `hunt` there's a file called `compass.txt`. Find it, read it with `cat`, and save the first secret word into `word1.txt` in your home folder.
