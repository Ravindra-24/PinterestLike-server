import { Router } from "express";
import { body } from "express-validator";
import { authMiddleware } from "../../middleware/index.js";
import { asyncHandler } from "../../utils/response.js";
import { googleLogin, login, logout, me, refresh, signup } from "../../controllers/v1/auth.js";

const router = Router();
const email = body("email").trim().isEmail().normalizeEmail();
const password = body("password").isString().isLength({ min: 8, max: 128 });

router.post("/signup", [email, password, body("firstName").trim().isLength({ min: 2, max: 50 }), body("lastName").trim().isLength({ min: 1, max: 50 })], asyncHandler(signup));
router.post("/login", [email, password], asyncHandler(login));
router.post("/google", asyncHandler(googleLogin));
router.post("/refresh", asyncHandler(refresh));
router.get("/me", authMiddleware, asyncHandler(me));
router.post("/logout", asyncHandler(logout));

export default router;
