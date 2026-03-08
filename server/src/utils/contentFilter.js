const Filter = require("bad-words").Filter;
const filter = new Filter();

function containsProfanity(text) {
  if (text == null || typeof text !== "string") return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  return filter.isProfane(trimmed);
}

module.exports = { containsProfanity };
