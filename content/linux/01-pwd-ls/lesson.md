---
title: Where am I?
summary: pwd, ls and cd.
xp: 15
---
The window on the right is a **terminal**: a real Linux computer running inside this tab. You talk to it by typing **commands** and pressing Enter.

Three commands help you find your way:

- `pwd` (*print working directory*) shows the folder you're in.
- `ls` (*list*) shows what's in it.
- `cd` (*change directory*) moves into another folder: `cd trail`. `cd ..` goes back up one level, and `cd` on its own takes you home.

Try them now: type `pwd`, then `ls`.

Folders can hold more folders. `ls -a` also shows hidden files, whose names start with a dot.

## Your task

Somewhere inside the `trail` folder there's a folder called `summit`. In it is a hidden file. Find out its name, then go back to your home folder and create a file called `answer.txt` that contains just that name:

```sh
echo NAME-OF-THE-FILE > answer.txt
```

Press **Check my work** when you're done.
