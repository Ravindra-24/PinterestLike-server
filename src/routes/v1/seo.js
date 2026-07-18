import { Router } from "express";
import { asyncHandler } from "../../utils/response.js";
import { collectionsSitemap, postsSitemap, profilesSitemap, sitemapIndex } from "../../controllers/v1/seo.js";

const router = Router();
router.get("/sitemap.xml", asyncHandler(sitemapIndex));
router.get("/sitemaps/posts.xml", asyncHandler(postsSitemap));
router.get("/sitemaps/profiles.xml", asyncHandler(profilesSitemap));
router.get("/sitemaps/collections.xml", asyncHandler(collectionsSitemap));

export default router;
