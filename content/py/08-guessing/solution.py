def guesses(secret):
    low = 1
    high = 100
    tries = []
    while True:
        guess = (low + high) // 2
        tries.append(guess)
        if guess == secret:
            return tries
        if guess < secret:
            low = guess + 1
        else:
            high = guess - 1
