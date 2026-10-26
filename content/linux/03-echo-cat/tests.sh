check "packing.txt exists" "Create it with echo water > packing.txt" test -f packing.txt
check "it has exactly three lines" "Use > for the first line and >> for the others" sh -c '[ "$(wc -l < packing.txt)" -eq 3 ]'
check "the lines are water, map, snacks" "Run cat packing.txt and compare" sh -c '[ "$(cat packing.txt)" = "$(printf "water\nmap\nsnacks")" ]'
