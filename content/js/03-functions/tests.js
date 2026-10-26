test("greet is a function", () => {
  expect(typeof greet, "typeof greet").toBe("function");
});
test('greet("Grace") returns "Hello, Grace!"', () => {
  expect(greet("Grace"), 'greet("Grace")').toBe("Hello, Grace!");
});
test("works for any name", () => {
  expect(greet("Radia"), 'greet("Radia")').toBe("Hello, Radia!");
  expect(greet("Ken"), 'greet("Ken")').toBe("Hello, Ken!");
});
