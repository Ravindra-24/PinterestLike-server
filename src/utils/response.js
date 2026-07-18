import crypto from "node:crypto";

export const requestId = (req, res, next) => {
  req.requestId = req.get("x-request-id") || crypto.randomUUID();
  res.setHeader("x-request-id", req.requestId);
  next();
};

export const ok = (res, data, meta = undefined, status = 200) =>
  res.status(status).json({ data, ...(meta ? { meta } : {}), error: null });

export const fail = (res, status, message, code = "REQUEST_FAILED", details = undefined) =>
  res.status(status).json({
    data: null,
    error: { code, message, ...(details ? { details } : {}) },
    meta: { requestId: res.getHeader("x-request-id") },
  });

export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
