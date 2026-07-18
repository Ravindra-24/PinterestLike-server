import mongoose from "mongoose";
import cloudinary from "../../utils/cloudinary.js";
import { User } from "../../db/schema/User.js";
import { Post } from "../../db/schema/Post.js";
import { Comment } from "../../db/schema/Comment.js";
import { Collection } from "../../db/schema/Collection.js";
import { Notification } from "../../db/schema/Notification.js";
import { fail, ok } from "../../utils/response.js";
import { postSummary, publicUser } from "../../utils/serializers.js";
import { slugify } from "../../utils/slug.js";

const userFields = "username displayName firstName lastName bio profilePicture createdAt followerCount followingCount postCount followers following";

const findUser = (identifier) => mongoose.isValidObjectId(identifier)
  ? User.findById(identifier).select(userFields)
  : User.findOne({ username: identifier.toLowerCase(), deletedAt: null }).select(userFields);

export const getUser = async (req, res) => {
  const user = await findUser(req.params.identifier);
  if (!user) return fail(res, 404, "Profile not found", "USER_NOT_FOUND");
  const posts = await Post.find({ user: user._id, status: "published", visibility: "public" }).sort({ createdAt: -1 }).limit(120).populate("user", userFields).lean();
  return ok(res, { ...publicUser(user, req.user?.id), posts: posts.map((post) => postSummary(post, req.user?.id)) });
};

export const followUser = async (req, res) => {
  if (String(req.params.id) === String(req.user.id)) return fail(res, 400, "You cannot follow yourself", "INVALID_FOLLOW");
  const target = await User.findById(req.params.id).select(userFields);
  const viewer = await User.findById(req.user.id).select("following");
  if (!target || !viewer) return fail(res, 404, "Profile not found", "USER_NOT_FOUND");
  const following = viewer.following.some((id) => String(id) === String(target._id));
  if (following) {
    await Promise.all([
      User.updateOne({ _id: viewer._id }, { $pull: { following: target._id }, $inc: { followingCount: -1 } }),
      User.updateOne({ _id: target._id }, { $pull: { followers: viewer._id }, $inc: { followerCount: -1 } }),
    ]);
  } else {
    await Promise.all([
      User.updateOne({ _id: viewer._id }, { $addToSet: { following: target._id }, $inc: { followingCount: 1 } }),
      User.updateOne({ _id: target._id }, { $addToSet: { followers: viewer._id }, $inc: { followerCount: 1 } }),
      Notification.create({ recipient: target._id, actor: viewer._id, type: "follow", entityType: "user", entityId: viewer._id }).catch(() => undefined),
    ]);
  }
  const updated = await User.findById(target._id).select(userFields);
  return ok(res, { ...publicUser(updated, viewer._id), isFollowing: !following });
};

export const updateUser = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return fail(res, 404, "Account not found", "USER_NOT_FOUND");
  for (const field of ["firstName", "lastName", "displayName", "bio"]) {
    if (typeof req.body[field] === "string") user[field] = req.body[field].trim().slice(0, field === "bio" ? 500 : 80);
  }
  if (req.body.interests) {
    let interests = req.body.interests;
    if (typeof interests === "string") { try { interests = JSON.parse(interests); } catch { interests = interests.split(","); } }
    if (Array.isArray(interests)) user.interests = [...new Set(interests.map((item) => String(item).trim()).filter(Boolean))].slice(0, 12);
  }
  if (typeof req.body.username === "string") {
    const username = slugify(req.body.username).slice(0, 30);
    if (username.length < 3) return fail(res, 400, "Username must be at least three characters", "INVALID_USERNAME");
    if (await User.exists({ username, _id: { $ne: user._id } })) return fail(res, 409, "That username is already taken", "USERNAME_IN_USE");
    user.username = username;
  }
  if (req.file) {
    const upload = await new Promise((resolve, reject) => cloudinary.uploader.upload_stream({ folder: "users", resource_type: "image", transformation: [{ width: 512, height: 512, crop: "fill", gravity: "face", quality: "auto", fetch_format: "auto" }] }, (error, result) => error ? reject(error) : resolve(result)).end(req.file.buffer));
    user.profilePicture = upload.secure_url;
  }
  await user.save();
  return ok(res, { ...publicUser(user), interests: user.interests || [], permissions: Number(user.role || 0) >= 1 ? ["moderate"] : [] });
};

export const exportUserData = async (req, res) => {
  const [user, posts, comments, collections] = await Promise.all([
    User.findById(req.user.id).select("firstName lastName displayName username email bio profilePicture createdAt updatedAt").lean(),
    Post.find({ user: req.user.id }).select("title description altText category tags visibility status createdAt updatedAt").lean(),
    Comment.find({ user: req.user.id }).select("commentText status createdAt updatedAt").lean(),
    Collection.find({ owner: req.user.id }).select("name description visibility createdAt updatedAt").lean(),
  ]);
  return ok(res, { exportedAt: new Date().toISOString(), account: user, posts, comments, collections });
};

export const deleteAccount = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return fail(res, 404, "Account not found", "USER_NOT_FOUND");
  user.deletedAt = new Date();
  user.disabled = true;
  user.refreshSessions = [];
  user.email = `deleted-${user._id}@invalid.local`;
  user.firstName = "Deleted";
  user.lastName = "Member";
  user.displayName = "Deleted member";
  user.bio = null;
  user.profilePicture = null;
  await user.save();
  await Post.updateMany({ user: user._id }, { $set: { status: "deleted", deletedAt: new Date() } });
  return ok(res, { deleted: true });
};

export const creatorStats = async (req, res) => {
  const [totals] = await Post.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.user.id), status: "published" } },
    { $group: { _id: null, posts: { $sum: 1 }, likes: { $sum: "$likeCount" }, comments: { $sum: "$commentCount" }, saves: { $sum: "$saveCount" } } },
  ]);
  return ok(res, totals || { posts: 0, likes: 0, comments: 0, saves: 0 });
};
