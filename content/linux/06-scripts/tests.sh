check "hello.sh exists" "Create it with nano hello.sh" test -f hello.sh
check "hello.sh is executable" "Run chmod +x hello.sh" test -x hello.sh
out=$(as_camper ./hello.sh 2>&1)
if [ "$out" = "Hello from my script" ]; then pass "./hello.sh prints Hello from my script"; else fail "./hello.sh prints Hello from my script" "It printed: $out"; fi
