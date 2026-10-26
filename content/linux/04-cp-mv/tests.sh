check "the photos are in photos/" "mkdir photos, then mv inbox/*.jpg photos/" sh -c 'test -f photos/lake.jpg && test -f photos/campfire.jpg && test -f photos/canoe.jpg'
check "no photos left in inbox" "Move them, don't copy them" sh -c '! ls inbox/*.jpg >/dev/null 2>&1'
check "backup/notes.txt is a copy" "mkdir backup, then cp inbox/notes.txt backup/" cmp -s inbox/notes.txt backup/notes.txt
