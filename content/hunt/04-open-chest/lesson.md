---
title: "Step 4: open the chest"
summary: chmod and arguments.
xp: 40
---
You have all three words. The chest is the script `hunt/chest.sh`, but it isn't executable yet. Check with `ls -l hunt/chest.sh`: there's no `x`.

A script can take **arguments**: words you type after its name. The script reads them as `$1`, `$2` and `$3`. Have a look inside with `cat hunt/chest.sh`.

You can even read your saved words back with `$(cat word1.txt)`, which puts a command's output right into another command.

## Your task

Make `hunt/chest.sh` executable, then run it with your three words, in order.
