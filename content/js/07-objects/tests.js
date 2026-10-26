test("describe builds the sentence", () => {
  expect(describe({ name: "Ada", age: 12, cabin: "Pine" }), "describe(Ada)").toBe("Ada (12) sleeps in Pine");
  expect(describe({ name: "Alan", age: 10, cabin: "Oak" }), "describe(Alan)").toBe("Alan (10) sleeps in Oak");
});
test("birthday adds one to age", () => {
  expect(birthday({ name: "Grace", age: 11, cabin: "Oak" }).age, "birthday(Grace).age").toBe(12);
});
test("birthday keeps the other properties", () => {
  expect(birthday({ name: "Grace", age: 11, cabin: "Oak" }), "birthday(Grace)").toEqual({ name: "Grace", age: 12, cabin: "Oak" });
});
test("birthday doesn't change the original", () => {
  const grace = { name: "Grace", age: 11, cabin: "Oak" };
  const result = birthday(grace);
  expect(grace.age, "the original camper's age").toBe(11);
  expect(result === grace, "returning the same object").toBe(false);
});
