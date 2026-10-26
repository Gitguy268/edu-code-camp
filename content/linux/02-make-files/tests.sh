check "the gear folder exists" "Make it with mkdir gear" test -d gear
check "gear/tent.txt exists" "touch gear/tent.txt" test -f gear/tent.txt
check "gear/lamp.txt exists" "touch gear/lamp.txt" test -f gear/lamp.txt
check "junk.txt is gone" "Delete it with rm junk.txt" test ! -e junk.txt
