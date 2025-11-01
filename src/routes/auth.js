import { Router } from "express";
import { body } from "express-validator";
import {
  forgotPassword,
  resetPassword,
  login,
  signup,
  validate,
  googleLogin,
  oneTapLogin,
} from "../controllers/auth.js";
import { User } from "../db/schema/User.js";

const router = Router();

router.post("/forgot-password",
body("email").isEmail().withMessage("Please enter a valid email"),
forgotPassword);

router.post("/reset-password/:token",
body("password").trim().isLength({ min: 5 }).withMessage("Password must be at least 5 characters long"),
resetPassword);

router.post(
  "/signup",
  body("email").custom(async (value) => await User.findByEmail(value)),
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long"),
  body("firstName")
    .trim()
    .not()
    .isEmpty()
    .withMessage("First Name is required"),
  body("lastName").trim().not().isEmpty().withMessage("Last Name is required"),
  signup
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Please enter a valid email"),
  login
);

router.post("/google-one-tap", oneTapLogin)
router.post("/google-oauth", googleLogin)

router.get("/validate/:token", validate)

export default router;
