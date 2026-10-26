const games = [
  { name: "Linus", points: 5 },
  { name: "Ada", points: 7 },
  { name: "Grace", points: 5 },
  { name: "Radia", points: 9 },
];
test("highest points first", () => {
  expect(scoreboard(games)[0], "the winner").toBe("Radia");
});
test("ties go in alphabetical order", () => {
  expect(scoreboard(games), "scoreboard(games)").toEqual(["Radia", "Ada", "Grace", "Linus"]);
});
test("returns names, not objects", () => {
  expect(typeof scoreboard(games)[0], "each item").toBe("string");
});
test("doesn't change the results array", () => {
  const copy = games.map(g => g.name);
  scoreboard(games);
  expect(games.map(g => g.name), "the original order").toEqual(copy);
});
test("an empty game has an empty scoreboard", () => {
  expect(scoreboard([]), "scoreboard([])").toEqual([]);
});
