check "chest.sh is executable" "chmod +x hunt/chest.sh" test -x hunt/chest.sh
check "the chest is open" "Run ./hunt/chest.sh WORD1 WORD2 WORD3" test -f hunt/opened
