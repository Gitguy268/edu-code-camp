test("countdown(5) gives [5, 4, 3, 2, 1]", () => {
  expect(countdown(5), "countdown(5)").toEqual([5, 4, 3, 2, 1]);
});
test("countdown(1) gives [1]", () => {
  expect(countdown(1), "countdown(1)").toEqual([1]);
});
test("countdown(0) gives an empty array", () => {
  expect(countdown(0), "countdown(0)").toEqual([]);
});
test("works for bigger numbers", () => {
  expect(countdown(12), "countdown(12)").toHaveLength(12);
  expect(countdown(12)[0], "the first number of countdown(12)").toBe(12);
});
