check "bears.txt exists" "Redirect the count with > bears.txt" test -f bears.txt
check "it holds the right number" "Use grep -i so Bear and bear both count, then wc -l" sh -c '[ "$(tr -d " \n" < bears.txt)" = 4 ]'
