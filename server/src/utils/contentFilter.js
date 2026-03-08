const leoProfanity = require("leo-profanity");
leoProfanity.loadDictionary("en");

function containsProfanity(text) {
  if (text == null || typeof text !== "string") return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  return leoProfanity.check(trimmed);
}

module.exports = { containsProfanity };
