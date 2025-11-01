import { Router } from "express";
import { followUser, getUser, getUserPosts, updateUser } from "../controllers/user.js";
import { authMiddleware } from "../middleware/index.js";
import upload from "../utils/uploader.js";

const router = Router();

router.get("/:id", getUser )
router.get("/user-posts/:id", getUserPosts)
router.patch("/follow/:userId", authMiddleware, followUser )
router.patch("/update",upload.single("image"), authMiddleware, updateUser)

export default router;