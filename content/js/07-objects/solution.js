function describe(camper) {
  return `${camper.name} (${camper.age}) sleeps in ${camper.cabin}`;
}

function birthday(camper) {
  return { ...camper, age: camper.age + 1 };
}
