import { Router } from "express";
import { followUser, getUser, getUserPosts } from "../controllers/user";
import { authMiddleware } from "../middleware";

const router = Router();

router.get("/:id", getUser )

router.get("/user-posts/:id", getUserPosts)

router.patch("/follow/:userId", authMiddleware, followUser )

export default router;