import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import multer from "multer";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/post.js";
import commentRoutes from "./routes/comment.js";
import userRoutes from "./routes/user.js";
import v1Routes from "./routes/v1/index.js";
import { connectDB } from "./utils/db.utils.js";
import { fail, requestId } from "./utils/response.js";

dotenv.config();
const app = express();

const configuredOrigins = (process.env.ALLOWED_ORIGINS || process.env.SITE_URL || "https://pinterest-clone-tau.vercel.app,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(requestId);
app.use(async (_req, _res, next) => { try { await connectDB(); next(); } catch (error) { next(error); } });
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || configuredOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed"));
  },
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());

const apiLimiter = rateLimit({ windowMs: 60_000, limit: 180, standardHeaders: "draft-8", legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false });
app.use("/api", apiLimiter);
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/signup", authLimiter);
app.use("/api/v1/auth/refresh", authLimiter);

app.use("/api/v1", v1Routes);

// Compatibility adapters for the existing deployed client.
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);

app.get("/", (_req, res) => res.status(200).json({ status: "ok", service: "canvas-api", version: "v1" }));
app.get("/health", (_req, res) => res.status(200).json({ status: "ok", timestamp: new Date().toISOString() }));

app.use((req, res) => fail(res, 404, "Route not found", "NOT_FOUND"));
app.use((error, req, res, _next) => {
  console.error(JSON.stringify({ level: "error", requestId: req.requestId, method: req.method, path: req.path, message: error.message, stack: process.env.NODE_ENV === "development" ? error.stack : undefined }));
  if (error instanceof multer.MulterError) return fail(res, 400, error.code === "LIMIT_FILE_SIZE" ? "Images must be smaller than 10 MB" : "Unsupported image upload", error.code);
  if (error?.message === "Origin is not allowed") return fail(res, 403, "Origin is not allowed", "ORIGIN_DENIED");
  return fail(res, 500, process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred", "INTERNAL_ERROR");
});

export { app };
