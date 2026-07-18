import mongoose from "mongoose";
import { Report } from "../../db/schema/Report.js";
import { Notification } from "../../db/schema/Notification.js";
import { Post } from "../../db/schema/Post.js";
import { Comment } from "../../db/schema/Comment.js";
import { User } from "../../db/schema/User.js";
import { fail, ok } from "../../utils/response.js";
import { publicUser } from "../../utils/serializers.js";

export const createReport = async (req, res) => {
  const { targetType, targetId, reason } = req.body;
  if (!["post", "comment", "user"].includes(targetType) || !mongoose.isValidObjectId(targetId)) return fail(res, 400, "Choose valid content to report", "INVALID_TARGET");
  if (!String(reason || "").trim()) return fail(res, 400, "Choose a report reason", "INVALID_REASON");
  try {
    const report = await Report.create({ reporter: req.user.id, targetType, targetId, reason: String(reason).trim().slice(0, 120), details: String(req.body.details || "").trim().slice(0, 1000) });
    return ok(res, { id: report._id.toString(), status: report.status }, undefined, 201);
  } catch (error) {
    if (error?.code === 11000) return fail(res, 409, "You have already reported this content", "REPORT_EXISTS");
    throw error;
  }
};

export const listReports = async (req, res) => {
  const reports = await Report.find(req.query.status ? { status: req.query.status } : {}).sort({ createdAt: -1 }).limit(100).populate("reporter", "username displayName firstName lastName profilePicture").lean();
  return ok(res, reports.map((report) => ({ id: report._id.toString(), reporter: publicUser(report.reporter), targetType: report.targetType, targetId: report.targetId.toString(), reason: report.reason, details: report.details, status: report.status, createdAt: report.createdAt })));
};

export const resolveReport = async (req, res) => {
  const status = ["reviewing", "resolved", "dismissed"].includes(req.body.status) ? req.body.status : "reviewing";
  const report = await Report.findByIdAndUpdate(req.params.id, { status, reviewedBy: req.user.id, resolutionNote: String(req.body.resolutionNote || "").slice(0, 1000) }, { new: true });
  if (!report) return fail(res, 404, "Report not found", "REPORT_NOT_FOUND");
  return ok(res, { id: report._id.toString(), status: report.status });
};

export const moderateContent = async (req, res) => {
  const { targetType, targetId, action } = req.body;
  if (!mongoose.isValidObjectId(targetId) || !["hide", "restore", "disable"].includes(action)) return fail(res, 400, "Invalid moderation action", "INVALID_ACTION");
  let recipient;
  if (targetType === "post") {
    const post = await Post.findByIdAndUpdate(targetId, { status: action === "restore" ? "published" : "hidden" }, { new: true }).select("user").lean();
    recipient = post?.user;
  } else if (targetType === "comment") {
    const comment = await Comment.findByIdAndUpdate(targetId, { status: action === "restore" ? "published" : "hidden" }, { new: true }).select("user").lean();
    recipient = comment?.user;
  } else if (targetType === "user") {
    const user = await User.findByIdAndUpdate(targetId, { disabled: action !== "restore" }, { new: true }).select("_id").lean();
    recipient = user?._id;
  } else return fail(res, 400, "Invalid moderation target", "INVALID_TARGET");
  if (!recipient) return fail(res, 404, "Moderation target not found", "TARGET_NOT_FOUND");
  if (String(recipient) !== String(req.user.id)) {
    await Notification.create({ recipient, actor: req.user.id, type: "moderation", entityType: targetType, entityId: targetId }).catch(() => undefined);
  }
  return ok(res, { moderated: true, action });
};

export const listNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 }).limit(50).populate("actor", "username displayName firstName lastName profilePicture").lean();
  return ok(res, notifications.map((item) => ({ id: item._id.toString(), actor: publicUser(item.actor), type: item.type, entityType: item.entityType, entityId: item.entityId.toString(), readAt: item.readAt, createdAt: item.createdAt })));
};

export const markNotificationsRead = async (req, res) => {
  await Notification.updateMany({ recipient: req.user.id, readAt: null }, { $set: { readAt: new Date() } });
  return ok(res, { read: true });
};
