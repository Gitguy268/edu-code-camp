check "word2.txt exists" "Save it with echo WORD > word2.txt" test -f word2.txt
check "it's the word from the logbook" "Try grep -r \"X marks\" hunt/logs" grep -qx CEDAR word2.txt
