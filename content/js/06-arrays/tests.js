const campers = ["Ada", "Linus", "Grace", "Alan", "Margaret"];
test("longNames keeps names longer than 4 letters", () => {
  expect(longNames(campers), "longNames([...])").toEqual(["Linus", "Grace", "Margaret"]);
});
test("longNames of an empty list is empty", () => {
  expect(longNames([]), "longNames([])").toEqual([]);
});
test("shout makes every name uppercase", () => {
  expect(shout(["Ada", "Ken"]), 'shout(["Ada", "Ken"])').toEqual(["ADA", "KEN"]);
});
test("shout doesn't change the original array", () => {
  const list = ["Ada"];
  shout(list);
  expect(list, "the array you passed in").toEqual(["Ada"]);
});
