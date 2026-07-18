import { onSchedule } from "firebase-functions/v2/scheduler";
import { Post } from "../db/schema/Post.js";
import { Report } from "../db/schema/Report.js";
import { connectDB } from "../utils/db.utils.js";

export const updateEngagementScores = onSchedule({ schedule: "every 6 hours", region: "asia-south1", timeZone: "Asia/Kolkata", memory: "256MiB" }, async () => {
  await connectDB();
  const reports = await Report.aggregate([{ $match: { targetType: "post", status: { $in: ["open", "reviewing", "resolved"] } } }, { $group: { _id: "$targetId", count: { $sum: 1 } } }]);
  const reportCounts = new Map(reports.map((item) => [String(item._id), item.count]));
  const posts = await Post.find({ status: "published", visibility: "public" }).select("likeCount commentCount saveCount createdAt").lean();
  const now = Date.now();
  if (!posts.length) return;
  await Post.bulkWrite(posts.map((post) => {
    const ageDays = Math.max(0, (now - new Date(post.createdAt).getTime()) / 86_400_000);
    const raw = (post.likeCount || 0) * 2 + (post.commentCount || 0) * 2.5 + (post.saveCount || 0) * 3 - Math.log1p(ageDays) * 1.2 - (reportCounts.get(String(post._id)) || 0) * 12;
    return { updateOne: { filter: { _id: post._id }, update: { $set: { engagementScore: Math.max(0, Number(raw.toFixed(4))) } } } };
  }));
});
