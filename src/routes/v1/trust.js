import { Router } from "express";
import { authMiddleware, requireRole } from "../../middleware/index.js";
import { asyncHandler } from "../../utils/response.js";
import { createReport, listNotifications, listReports, markNotificationsRead, moderateContent, resolveReport } from "../../controllers/v1/trust.js";

const router = Router();
router.post("/reports", authMiddleware, asyncHandler(createReport));
router.get("/notifications", authMiddleware, asyncHandler(listNotifications));
router.patch("/notifications/read", authMiddleware, asyncHandler(markNotificationsRead));
router.get("/moderation/reports", authMiddleware, requireRole(1), asyncHandler(listReports));
router.patch("/moderation/reports/:id", authMiddleware, requireRole(1), asyncHandler(resolveReport));
router.post("/moderation/actions", authMiddleware, requireRole(1), asyncHandler(moderateContent));

export default router;
