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


def summary(tasks):
    done = len([t for t in tasks if t["done"]])
    if not tasks:
        return "Nothing to do. Go swimming!"
    return f"{done} of {len(tasks)} done"


def run_command(tasks, line):
    command, _, rest = line.strip().partition(" ")
    if command == "add" and rest:
        add_task(tasks, rest)
        return f"Added: {rest}"
    if command == "done":
        if rest.isdigit() and complete_task(tasks, int(rest)):
            return f"Done: {tasks[int(rest) - 1]['title']}"
        return "No such task"
    if command == "list":
        return format_tasks(tasks) or "Nothing to do. Go swimming!"
    if command == "summary":
        return summary(tasks)
    return "Unknown command"


tasks = []
for line in ["add Pitch the tent", "add Find water", "done 1", "list", "summary"]:
    print(">", line)
    print(run_command(tasks, line))
