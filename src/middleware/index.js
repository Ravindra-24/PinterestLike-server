import { verifyAuthToken } from "../utils/token.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required", success: false, data: null });
    }
    const token = authorization.slice(7);
    const payload = verifyAuthToken(token);
    if (!payload) {
      return res.status(401).json({
        message: "Invalid or expired token",
        success: false,
        data: null,
      });
    }
    req.user = { id: payload.id, role: payload.role || 0 };
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Authentication required",
      success: false,
      data: null,
    });
  }
};

export const optionalAuth = (req, _res, next) => {
  const authorization = req.headers.authorization;
  if (authorization?.startsWith("Bearer ")) {
    const payload = verifyAuthToken(authorization.slice(7));
    if (payload) req.user = { id: payload.id, role: payload.role || 0 };
  }
  next();
};

export const requireRole = (minimumRole) => (req, res, next) => {
  if (!req.user || Number(req.user.role || 0) < minimumRole) {
    return res.status(403).json({ data: null, error: { code: "FORBIDDEN", message: "You do not have permission to perform this action" } });
  }
  next();
};
