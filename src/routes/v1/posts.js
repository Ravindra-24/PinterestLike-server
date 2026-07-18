import { Router } from "express";
import { authMiddleware, optionalAuth } from "../../middleware/index.js";
import upload from "../../utils/uploader.js";
import { asyncHandler } from "../../utils/response.js";
import { addComment, createPost, deletePost, getPost, getPosts, searchPosts, toggleLike, updatePost } from "../../controllers/v1/posts.js";

const router = Router();

router.get("/", optionalAuth, asyncHandler(getPosts));
router.get("/search", optionalAuth, asyncHandler(searchPosts));
router.get("/:slugOrId", optionalAuth, asyncHandler(getPost));
router.post("/", authMiddleware, upload.single("image"), asyncHandler(createPost));
router.patch("/:id", authMiddleware, asyncHandler(updatePost));
router.delete("/:id", authMiddleware, asyncHandler(deletePost));
router.patch("/:id/like", authMiddleware, asyncHandler(toggleLike));
router.post("/:id/comments", authMiddleware, asyncHandler(addComment));

export default router;
