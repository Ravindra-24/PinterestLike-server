import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export const verifyAuthToken = (token) => {
  try {
    const payload = jwt.verify(token, process.env.AUTH_SECRET, { issuer: "curiofold-api", audience: "curiofold-web" });
    return payload;
  } catch (error) {
    try {
      // Compatibility for access tokens issued before the v1 session migration.
      return jwt.verify(token, process.env.AUTH_SECRET);
    } catch {
      return false;
    }
  }
};

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.AUTH_SECRET, { expiresIn: "15m", issuer: "curiofold-api", audience: "curiofold-web" });
};

export const generateRefreshToken = () => crypto.randomBytes(48).toString("base64url");

export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const refreshTokenExpiry = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

export const generateResetToken = (payload) => {
  return jwt.sign(payload, process.env.RESET_PASSWORD_SECRET, {
    expiresIn: "5m",
  });
};

export const verifyResetToken = (token) => {
  try {
    const payload = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
};
