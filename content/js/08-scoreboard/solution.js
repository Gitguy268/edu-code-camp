function scoreboard(results) {
  return [...results]
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
    .map(r => r.name);
}
