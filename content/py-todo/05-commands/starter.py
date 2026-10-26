def run_command(tasks, line):
    pass


tasks = []
for line in ["add Pitch the tent", "add Find water", "done 1", "list", "summary"]:
    print(">", line)
    print(run_command(tasks, line))
