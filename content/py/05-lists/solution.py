def total_weight(items):
    total = 0
    for w in items:
        total = total + w
    return total


def heavy(items, limit):
    result = []
    for w in items:
        if w > limit:
            result.append(w)
    return result
