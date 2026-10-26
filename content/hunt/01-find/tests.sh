check "word1.txt exists" "Save the word with echo WORD > word1.txt" test -f word1.txt
check "it's the word from the compass" "Find the file with find hunt -name compass.txt, then cat it" grep -qx NORTHSTAR word1.txt
