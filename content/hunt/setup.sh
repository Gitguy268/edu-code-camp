# Builds the hunt once; every step of this project shares it.
if [ ! -d hunt ]; then
  mkdir -p hunt/woods/old-oak hunt/woods/birch-grove/hollow hunt/lake/dock hunt/lake/boathouse hunt/cave/deep/deeper hunt/logs
  echo "Not here. Try deeper." > hunt/cave/note.txt
  echo "Still not here." > hunt/cave/deep/note.txt
  printf 'You found the compass!\nThe first word is: NORTHSTAR\n' > hunt/cave/deep/deeper/compass.txt
  echo "A squirrel watches you." > hunt/woods/old-oak/squirrel.txt
  echo "Wet planks." > hunt/lake/dock/planks.txt
  i=1
  while [ $i -le 30 ]; do
    printf 'Day %s: quiet day at camp.\nDay %s: someone burned the beans.\n' "$i" "$i" > hunt/logs/day-$i.log
    i=$((i + 1))
  done
  echo "Day 17: X marks the spot: CEDAR" >> hunt/logs/day-17.log
  for b in robin heron robin loon heron wren heron robin heron loon heron wren robin heron; do echo $b; done > hunt/lake/boathouse/birds.txt
  cat > hunt/chest.sh <<'CHEST'
#!/bin/sh
# The treasure chest. Run it with the three secret words.
if [ "$1" = NORTHSTAR ] && [ "$2" = CEDAR ] && [ "$3" = heron ]; then
  echo "*creak* The chest opens! Inside: a golden marshmallow."
  echo "opened by $(whoami)" > "$(dirname "$0")/opened"
else
  echo "The chest stays shut. Check your three words."
  exit 1
fi
CHEST
  chmod -x hunt/chest.sh
fi
