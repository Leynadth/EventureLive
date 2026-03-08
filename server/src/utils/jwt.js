const jwt = require("jsonwebtoken");

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function signToken(payload) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_MS,
  });
}

module.exports = {
  signToken,
  setAuthCookie
};