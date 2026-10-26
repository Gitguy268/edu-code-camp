function longNames(names) {
  return names.filter(name => name.length > 4);
}

function shout(names) {
  return names.map(name => name.toUpperCase());
}
