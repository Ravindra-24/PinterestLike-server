import { OAuth2Client } from "google-auth-library";
import { validationResult } from "express-validator";
import { User } from "../../db/schema/User.js";
import { comparePassword } from "../../utils/auth.utils.js";
import { generateRefreshToken, generateToken, hashToken, refreshTokenExpiry } from "../../utils/token.js";
import { publicUser } from "../../utils/serializers.js";
import { fail, ok } from "../../utils/response.js";
import { slugify } from "../../utils/slug.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const cookieName = "canvas_refresh";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

const uniqueUsername = async (preferred) => {
  const base = slugify(preferred).slice(0, 24) || "member";
  let candidate = base;
  let suffix = 1;
  while (await User.exists({ username: candidate })) candidate = `${base}-${++suffix}`;
  return candidate;
};

const issueSession = async (req, res, user, status = 200) => {
  const refreshToken = generateRefreshToken();
  const expiresAt = refreshTokenExpiry();
  user.refreshSessions = (user.refreshSessions || []).filter((session) => session.expiresAt > new Date()).slice(-4);
  user.refreshSessions.push({ tokenHash: hashToken(refreshToken), expiresAt, userAgent: req.get("user-agent")?.slice(0, 300) });
  user.lastLogin = new Date();
  if (!user.username) user.username = await uniqueUsername(`${user.firstName}-${user.lastName || ""}`);
  if (!user.displayName) user.displayName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  await user.save();
  const accessToken = generateToken({ id: user._id.toString(), role: user.role || 0 });
  res.cookie(cookieName, refreshToken, cookieOptions());
  return ok(res, { accessToken, user: { ...publicUser(user), permissions: Number(user.role || 0) >= 1 ? ["moderate"] : [], interests: user.interests || [] } }, undefined, status);
};

export const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, 400, "Please correct the highlighted fields", "VALIDATION_ERROR", errors.array());
  const { firstName, lastName, email, password } = req.body;
  if (await User.exists({ email: email.toLowerCase() })) return fail(res, 409, "An account with this email already exists", "EMAIL_IN_USE");
  const username = await uniqueUsername(`${firstName}-${lastName}`);
  const user = await User.create({ firstName, lastName, displayName: `${firstName} ${lastName}`.trim(), username, email: email.toLowerCase(), password });
  return issueSession(req, res, user, 201);
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, 400, "Enter a valid email and password", "VALIDATION_ERROR", errors.array());
  const user = await User.findOne({ email: req.body.email.toLowerCase(), deletedAt: null });
  if (!user || user.disabled || !(await comparePassword(req.body.password, user.password))) return fail(res, 401, "Email or password is incorrect", "INVALID_CREDENTIALS");
  return issueSession(req, res, user);
};

export const googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential || !process.env.GOOGLE_CLIENT_ID) return fail(res, 400, "Google sign-in is not configured", "GOOGLE_AUTH_UNAVAILABLE");
  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload?.email || !payload.email_verified) return fail(res, 401, "Google could not verify this email", "UNVERIFIED_GOOGLE_ACCOUNT");
  let user = await User.findOne({ email: payload.email.toLowerCase() });
  if (!user) {
    const username = await uniqueUsername(payload.name || payload.email.split("@")[0]);
    user = await User.create({ email: payload.email.toLowerCase(), firstName: payload.given_name || payload.name || "Member", lastName: payload.family_name || "", displayName: payload.name, username, profilePicture: payload.picture, password: generateRefreshToken() });
  }
  return issueSession(req, res, user);
};

export const refresh = async (req, res) => {
  const token = req.cookies?.[cookieName];
  if (!token) return fail(res, 401, "Your session has expired", "SESSION_EXPIRED");
  const tokenHash = hashToken(token);
  const user = await User.findOne({ refreshSessions: { $elemMatch: { tokenHash, expiresAt: { $gt: new Date() } } }, disabled: false, deletedAt: null });
  if (!user) { res.clearCookie(cookieName, cookieOptions()); return fail(res, 401, "Your session has expired", "SESSION_EXPIRED"); }
  user.refreshSessions = user.refreshSessions.filter((session) => session.tokenHash !== tokenHash);
  return issueSession(req, res, user);
};

export const me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || user.disabled || user.deletedAt) return fail(res, 401, "Account unavailable", "ACCOUNT_UNAVAILABLE");
  return ok(res, { accessToken: req.headers.authorization.slice(7), user: { ...publicUser(user), permissions: Number(user.role || 0) >= 1 ? ["moderate"] : [], interests: user.interests || [] } });
};

export const logout = async (req, res) => {
  const token = req.cookies?.[cookieName];
  if (token) await User.updateOne({ "refreshSessions.tokenHash": hashToken(token) }, { $pull: { refreshSessions: { tokenHash: hashToken(token) } } });
  res.clearCookie(cookieName, cookieOptions());
  return ok(res, { loggedOut: true });
};
