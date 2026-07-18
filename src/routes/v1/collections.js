import { Router } from "express";
import { authMiddleware, optionalAuth } from "../../middleware/index.js";
import { asyncHandler } from "../../utils/response.js";
import { addItem, createCollection, getCollection, listCollections, removeItem } from "../../controllers/v1/collections.js";

const router = Router();
router.get("/", optionalAuth, asyncHandler(listCollections));
router.get("/:slugOrId", optionalAuth, asyncHandler(getCollection));
router.post("/", authMiddleware, asyncHandler(createCollection));
router.post("/:id/items", authMiddleware, asyncHandler(addItem));
router.delete("/:id/items/:postId", authMiddleware, asyncHandler(removeItem));

export default router;
