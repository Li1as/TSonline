const adjectives = [
  "Amber",
  "Brisk",
  "Clever",
  "Daring",
  "Echo",
  "Frost",
  "Golden",
  "Harbor",
  "Ivory",
  "Jade",
];

const nouns = [
  "Atlas",
  "Beacon",
  "Comet",
  "Drifter",
  "Ember",
  "Falcon",
  "Grove",
  "Harrier",
  "Ledger",
  "Nova",
];

export function createRandomName() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${adjective} ${noun} ${suffix}`;
}
