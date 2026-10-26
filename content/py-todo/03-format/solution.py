def add_task(tasks, title):
    tasks.append({"title": title, "done": False})
    return tasks


def complete_task(tasks, number):
    if number < 1 or number > len(tasks):
        return False
    tasks[number - 1]["done"] = True
    return True


def format_tasks(tasks):
    lines = []
    for i, task in enumerate(tasks, start=1):
        box = "x" if task["done"] else " "
        lines.append(f"{i}. [{box}] {task['title']}")
    return "\n".join(lines)
