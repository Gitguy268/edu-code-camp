function packFor(temperature) {
  if (temperature < 10) return "jacket";
  if (temperature < 20) return "sweater";
  return "t-shirt";
}
