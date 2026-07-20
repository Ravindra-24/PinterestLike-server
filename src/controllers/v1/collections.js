import mongoose from "mongoose";
import { Collection } from "../../db/schema/Collection.js";
import { CollectionItem } from "../../db/schema/CollectionItem.js";
import { Post } from "../../db/schema/Post.js";
import { User } from "../../db/schema/User.js";
import { Notification } from "../../db/schema/Notification.js";
import { collectionSummary, postSummary } from "../../utils/serializers.js";
import { fail, ok } from "../../utils/response.js";
import { parseEntityId, slugify } from "../../utils/slug.js";

const populateCollection = (query) => query.populate("owner", "username displayName firstName lastName profilePicture").populate("coverPost", "image media");

export const listCollections = async (req, res) => {
  let ownerId = req.user?.id;
  if (req.query.username) {
    const owner = await User.findOne({ username: String(req.query.username).toLowerCase() }).select("_id");
    if (!owner) return ok(res, []);
    ownerId = owner._id;
  }
  if (!ownerId) return ok(res, []);
  const own = String(ownerId) === String(req.user?.id);
  const filter = { owner: ownerId, deletedAt: null, ...(own ? {} : { visibility: "public" }) };
  const collections = await populateCollection(Collection.find(filter).sort({ updatedAt: -1 }));
  return ok(res, collections.map(collectionSummary));
};

export const getCollection = async (req, res) => {
  const id = parseEntityId(req.params.slugOrId);
  if (!mongoose.isValidObjectId(id)) return fail(res, 404, "Collection not found", "COLLECTION_NOT_FOUND");
  const collection = await populateCollection(Collection.findById(id));
  if (!collection || collection.deletedAt || (collection.visibility === "private" && String(collection.owner?._id) !== String(req.user?.id))) return fail(res, 404, "Collection not found", "COLLECTION_NOT_FOUND");
  const items = await CollectionItem.find({ collection: collection._id }).sort({ createdAt: -1 }).populate({ path: "post", match: { status: "published", visibility: "public" }, populate: { path: "user", select: "username displayName firstName lastName profilePicture" } }).lean();
  return ok(res, { ...collectionSummary(collection), posts: items.filter((item) => item.post).map((item) => postSummary(item.post, req.user?.id)) });
};

export const createCollection = async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (name.length < 2 || name.length > 60) return fail(res, 400, "Collection names must be between 2 and 60 characters", "INVALID_NAME");
  const base = slugify(name);
  let slug = base;
  let suffix = 1;
  while (await Collection.exists({ owner: req.user.id, slug })) slug = `${base}-${++suffix}`;
  const collection = await Collection.create({ owner: req.user.id, name, slug, description: String(req.body.description || "").trim().slice(0, 500), visibility: req.body.visibility === "public" ? "public" : "private" });
  await collection.populate("owner", "username displayName firstName lastName profilePicture");
  return ok(res, collectionSummary(collection), undefined, 201);
};

export const addItem = async (req, res) => {
  const collection = await Collection.findById(req.params.id);
  if (!collection || String(collection.owner) !== String(req.user.id)) return fail(res, 404, "Collection not found", "COLLECTION_NOT_FOUND");
  const post = await Post.findOne({ _id: req.body.postId, status: "published", visibility: "public" });
  if (!post) return fail(res, 404, "Idea not found", "POST_NOT_FOUND");
  const result = await CollectionItem.updateOne({ collection: collection._id, post: post._id }, { $setOnInsert: { addedBy: req.user.id } }, { upsert: true });
  if (result.upsertedCount) {
    collection.itemCount += 1;
    if (!collection.coverPost) collection.coverPost = post._id;
    await collection.save();
    post.saveCount = Number(post.saveCount || 0) + 1;
    await post.save();
    if (String(post.user) !== String(req.user.id)) await Notification.create({ recipient: post.user, actor: req.user.id, type: "save", entityType: "post", entityId: post._id }).catch(() => undefined);
  }
  return ok(res, { saved: true });
};

export const removeItem = async (req, res) => {
  const collection = await Collection.findById(req.params.id);
  if (!collection || String(collection.owner) !== String(req.user.id)) return fail(res, 404, "Collection not found", "COLLECTION_NOT_FOUND");
  const result = await CollectionItem.deleteOne({ collection: collection._id, post: req.params.postId });
  if (result.deletedCount) {
    collection.itemCount = Math.max(0, collection.itemCount - 1);
    if (String(collection.coverPost) === String(req.params.postId)) {
      const nextItem = await CollectionItem.findOne({ collection: collection._id }).sort({ createdAt: -1 }).select("post").lean();
      collection.coverPost = nextItem?.post || null;
    }
    await collection.save();
    await Post.updateOne({ _id: req.params.postId, saveCount: { $gt: 0 } }, { $inc: { saveCount: -1 } });
  }
  return ok(res, { removed: Boolean(result.deletedCount) });
};
