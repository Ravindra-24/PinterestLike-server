import mongoose from "mongoose";
import cloudinary from "../../utils/cloudinary.js";
import { Post } from "../../db/schema/Post.js";
import { User } from "../../db/schema/User.js";
import { Comment } from "../../db/schema/Comment.js";
import { Notification } from "../../db/schema/Notification.js";
import { cursorFilter, encodeCursor } from "../../utils/cursor.js";
import { fail, ok } from "../../utils/response.js";
import { parseEntityId, slugify } from "../../utils/slug.js";
import { postDetail, postSummary } from "../../utils/serializers.js";

const publicUserFields = "username displayName firstName lastName bio profilePicture createdAt followerCount followingCount postCount followers";
const clampLimit = (value) => Math.min(Math.max(Number(value) || 24, 1), 48);

export const getPosts = async (req, res) => {
  const limit = clampLimit(req.query.limit);
  const filter = { status: "published", visibility: "public" };
  if (req.query.category && req.query.category !== "All") filter.category = req.query.category;
  if (req.query.sort === "following" && req.user?.id) {
    const viewer = await User.findById(req.user.id).select("following").lean();
    filter.user = { $in: viewer?.following || [] };
  }
  if (req.query.sort === "for-you" && req.user?.id && !req.query.category) {
    const viewer = await User.findById(req.user.id).select("interests").lean();
    if (viewer?.interests?.length) filter.category = { $in: viewer.interests };
  }
  const ranked = ["popular", "trending", "for-you"].includes(req.query.sort);
  if (!ranked) Object.assign(filter, cursorFilter(req.query.cursor));
  const sort = ranked ? { engagementScore: -1, createdAt: -1 } : { createdAt: -1, _id: -1 };
  const documents = await Post.find(filter).sort(sort).limit(limit + 1).populate("user", publicUserFields).lean();
  const hasMore = documents.length > limit;
  const page = documents.slice(0, limit);
  return ok(res, page.map((post) => postSummary(post, req.user?.id)), {
    nextCursor: hasMore && !ranked ? encodeCursor(page.at(-1)) : null,
    hasMore: hasMore && !ranked,
  });
};

export const getPost = async (req, res) => {
  const id = parseEntityId(req.params.slugOrId);
  if (!mongoose.isValidObjectId(id)) return fail(res, 404, "Idea not found", "POST_NOT_FOUND");
  const post = await Post.findById(id)
    .populate("user", publicUserFields)
    .populate({ path: "comments", match: { status: "published" }, options: { sort: { createdAt: -1 }, limit: 100 }, populate: { path: "user", select: publicUserFields } });
  if (!post || post.status !== "published" || (post.visibility !== "public" && String(post.user?._id) !== String(req.user?.id))) return fail(res, 404, "Idea not found", "POST_NOT_FOUND");
  return ok(res, postDetail(post, req.user?.id));
};

export const createPost = async (req, res) => {
  if (!req.file) return fail(res, 400, "Choose an image to publish", "IMAGE_REQUIRED");
  const { title, description, altText, category } = req.body;
  if (!title?.trim() || title.trim().length < 3) return fail(res, 400, "Use a descriptive title", "INVALID_TITLE");
  if (!description?.trim() || description.trim().length < 10) return fail(res, 400, "Add a useful description", "INVALID_DESCRIPTION");
  if (!altText?.trim() || altText.trim().length < 8) return fail(res, 400, "Describe what is visible in the image", "INVALID_ALT_TEXT");
  const upload = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: "posts", resource_type: "image", transformation: [{ quality: "auto", fetch_format: "auto" }] }, (error, result) => error ? reject(error) : resolve(result)).end(req.file.buffer);
  });
  if (upload.width < 320 || upload.height < 320 || upload.width > 12000 || upload.height > 12000) {
    await cloudinary.uploader.destroy(upload.public_id);
    return fail(res, 400, "Image dimensions must be between 320 and 12,000 pixels", "INVALID_IMAGE_DIMENSIONS");
  }
  let tags = [];
  try { tags = Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags || "[]"); } catch { tags = String(req.body.tags || "").split(","); }
  tags = [...new Set(tags.map((tag) => slugify(tag)).filter(Boolean))].slice(0, 10);
  const post = await Post.create({
    title: title.trim(), description: description.trim(), altText: altText.trim(), category: category || "Inspiration", tags,
    slug: slugify(title), image: upload.secure_url, user: req.user.id,
    media: { url: upload.secure_url, publicId: upload.public_id, width: upload.width, height: upload.height, aspectRatio: upload.width / upload.height, dominantColor: upload.colors?.[0]?.[0] || "#ddd6ce" },
  });
  await User.updateOne({ _id: req.user.id }, { $addToSet: { posts: post._id }, $inc: { postCount: 1 } });
  await post.populate("user", publicUserFields);
  return ok(res, postDetail(post, req.user.id), undefined, 201);
};

export const updatePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.status === "deleted") return fail(res, 404, "Idea not found", "POST_NOT_FOUND");
  if (String(post.user) !== String(req.user.id)) return fail(res, 403, "Only the owner can edit this idea", "FORBIDDEN");
  for (const key of ["title", "description", "altText", "category", "visibility"]) {
    if (typeof req.body[key] === "string") post[key] = req.body[key].trim();
  }
  if (req.body.title) post.slug = slugify(req.body.title);
  if (Array.isArray(req.body.tags)) post.tags = req.body.tags.map(slugify).filter(Boolean).slice(0, 10);
  await post.save();
  await post.populate("user", publicUserFields);
  return ok(res, postDetail(post, req.user.id));
};

export const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return fail(res, 404, "Idea not found", "POST_NOT_FOUND");
  if (String(post.user) !== String(req.user.id) && Number(req.user.role || 0) < 1) return fail(res, 403, "You cannot delete this idea", "FORBIDDEN");
  post.status = "deleted";
  post.deletedAt = new Date();
  await post.save();
  await User.updateOne({ _id: post.user }, { $pull: { posts: post._id }, $inc: { postCount: -1 } });
  if (post.media?.publicId) await cloudinary.uploader.destroy(post.media.publicId).catch(() => undefined);
  return ok(res, { deleted: true });
};

export const toggleLike = async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, status: "published" });
  if (!post) return fail(res, 404, "Idea not found", "POST_NOT_FOUND");
  const index = post.likes.findIndex((id) => String(id) === String(req.user.id));
  if (index >= 0) post.likes.splice(index, 1); else post.likes.push(req.user.id);
  post.likeCount = post.likes.length;
  await post.save();
  if (index < 0 && String(post.user) !== String(req.user.id)) await Notification.create({ recipient: post.user, actor: req.user.id, type: "like", entityType: "post", entityId: post._id }).catch(() => undefined);
  await post.populate("user", publicUserFields);
  return ok(res, postSummary(post, req.user.id));
};

export const addComment = async (req, res) => {
  const commentText = String(req.body.commentText || "").trim();
  if (!commentText || commentText.length > 800) return fail(res, 400, "Comment must be between 1 and 800 characters", "INVALID_COMMENT");
  const post = await Post.findOne({ _id: req.params.id, status: "published" });
  if (!post) return fail(res, 404, "Idea not found", "POST_NOT_FOUND");
  const comment = await Comment.create({ commentText, user: req.user.id, post: post._id });
  post.comments.push(comment._id);
  post.commentCount = post.comments.length;
  await post.save();
  await User.updateOne({ _id: req.user.id }, { $addToSet: { comments: comment._id } });
  if (String(post.user) !== String(req.user.id)) await Notification.create({ recipient: post.user, actor: req.user.id, type: "comment", entityType: "post", entityId: post._id }).catch(() => undefined);
  const populated = await Post.findById(post._id).populate("user", publicUserFields).populate({ path: "comments", match: { status: "published" }, populate: { path: "user", select: publicUserFields } });
  return ok(res, postDetail(populated, req.user.id), undefined, 201);
};

export const searchPosts = async (req, res) => {
  const query = String(req.query.q || "").trim().slice(0, 100);
  if (query.length < 2) return fail(res, 400, "Enter at least two characters", "INVALID_SEARCH");
  const limit = clampLimit(req.query.limit);
  const filter = { $text: { $search: query }, status: "published", visibility: "public", ...cursorFilter(req.query.cursor) };
  if (req.query.category) filter.category = req.query.category;
  const documents = await Post.find(filter, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" }, createdAt: -1 }).limit(limit + 1).populate("user", publicUserFields).lean();
  const hasMore = documents.length > limit;
  const page = documents.slice(0, limit);
  return ok(res, page.map((post) => postSummary(post, req.user?.id)), { nextCursor: hasMore ? encodeCursor(page.at(-1)) : null, hasMore });
};
