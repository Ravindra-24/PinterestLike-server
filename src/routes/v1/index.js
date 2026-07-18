import { Router } from "express";
import auth from "./auth.js";
import posts from "./posts.js";
import users from "./users.js";
import collections from "./collections.js";
import trust from "./trust.js";
import seo from "./seo.js";
import { optionalAuth } from "../../middleware/index.js";
import { asyncHandler } from "../../utils/response.js";
import { searchPosts } from "../../controllers/v1/posts.js";

const router = Router();
router.use("/auth", auth);
router.use("/posts", posts);
router.use("/users", users);
router.use("/collections", collections);
router.use("/seo", seo);
router.use("/", trust);
router.get("/search", optionalAuth, asyncHandler(searchPosts));

export default router;
