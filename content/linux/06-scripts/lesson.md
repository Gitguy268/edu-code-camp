---
title: Your first script
summary: Save commands and run them.
xp: 25
---
A **script** is a file full of commands that run one after another. The first line, `#!/bin/sh`, says which program should run it.

```sh
#!/bin/sh
echo "Good morning"
date
```

Before you can run a file directly, it needs **execute permission**. `chmod +x` gives it that, and `ls -l` shows it as an `x`:

```sh
chmod +x morning.sh
./morning.sh
```

`./` means "in this folder". Without it, the shell only looks in the system's own folders.

To write a file in the terminal, use `nano hello.sh` (Ctrl+O saves, Ctrl+X quits), or build it with `echo` and `>>`.

## Your task

Make an executable script `hello.sh` in your home folder that prints exactly:

```
Hello from my script
```
