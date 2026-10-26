test("cold days need a jacket", () => {
  expect(packFor(3), "packFor(3)").toBe("jacket");
  expect(packFor(-5), "packFor(-5)").toBe("jacket");
});
test("10 is sweater weather", () => {
  expect(packFor(10), "packFor(10)").toBe("sweater");
  expect(packFor(19), "packFor(19)").toBe("sweater");
});
test("20 and up is t-shirt weather", () => {
  expect(packFor(20), "packFor(20)").toBe("t-shirt");
  expect(packFor(31), "packFor(31)").toBe("t-shirt");
});
