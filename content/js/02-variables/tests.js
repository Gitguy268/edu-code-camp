test("camper is Ada", () => {
  expect(camper, "camper").toBe("Ada");
});
test("marshmallows ends up at 7", () => {
  expect(marshmallows, "marshmallows").toBe(7);
});
test("prints Ada toasted 7 marshmallows", () => {
  expect(output().trim(), "What you printed").toBe("Ada toasted 7 marshmallows");
});
test("uses a template string", () => {
  expect(source.includes("${"), "Your code uses ${...}").toBe(true);
});
