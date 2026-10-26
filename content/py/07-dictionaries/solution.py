def count_cabins(campers):
    counts = {}
    for name, cabin in campers:
        counts[cabin] = counts.get(cabin, 0) + 1
    return counts


print(count_cabins([("Ada", "Pine"), ("Grace", "Oak"), ("Linus", "Pine")]))
