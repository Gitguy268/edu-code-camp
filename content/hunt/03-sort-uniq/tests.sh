check "word3.txt exists" "Save it with echo NAME > word3.txt" test -f word3.txt
check "it's the most common bird" "sort hunt/lake/boathouse/birds.txt | uniq -c | sort -n" grep -qx heron word3.txt
