check "answer.txt is in your home folder" "Create it with: echo NAME > answer.txt (in your home folder, run cd first)" test -f answer.txt
check "it names the hidden file" "Look in trail/forest/summit with ls -a" grep -qxE '[.]?flag-on-the-peak' answer.txt
