import { Router } from "express";
import { authMiddleware, optionalAuth } from "../../middleware/index.js";
import upload from "../../utils/uploader.js";
import { asyncHandler } from "../../utils/response.js";
import { creatorStats, deleteAccount, exportUserData, followUser, getUser, updateUser } from "../../controllers/v1/users.js";

const router = Router();
router.get("/me/export", authMiddleware, asyncHandler(exportUserData));
router.get("/me/stats", authMiddleware, asyncHandler(creatorStats));
router.patch("/me", authMiddleware, upload.single("image"), asyncHandler(updateUser));
router.delete("/me", authMiddleware, asyncHandler(deleteAccount));
router.patch("/:id/follow", authMiddleware, asyncHandler(followUser));
router.get("/:identifier", optionalAuth, asyncHandler(getUser));

export default router;
