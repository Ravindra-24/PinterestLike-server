import "dotenv/config";
import mongoose from "mongoose";
import cloudinary from "../src/utils/cloudinary.js";
import { User } from "../src/db/schema/User.js";
import { Post } from "../src/db/schema/Post.js";
import { slugify } from "../src/utils/slug.js";

if (!process.env.DB_URI) throw new Error("DB_URI is required");
await mongoose.connect(process.env.DB_URI);

const usernames = new Set((await User.find({ username: { $exists: true } }).select("username").lean()).map((user) => user.username));
for await (const user of User.find({ $or: [{ username: { $exists: false } }, { displayName: { $exists: false } }] })) {
  const base = slugify(`${user.firstName || "member"}-${user.lastName || ""}`).slice(0, 24) || "member";
  let username = user.username || base;
  let suffix = 1;
  while (usernames.has(username)) username = `${base}-${++suffix}`;
  usernames.add(username);
  user.username = username;
  user.displayName ||= [user.firstName, user.lastName].filter(Boolean).join(" ") || "Canvas member";
  user.followerCount = user.followers?.length || 0;
  user.followingCount = user.following?.length || 0;
  user.postCount = user.posts?.length || 0;
  await user.save();
}

const enrichMedia = process.argv.includes("--with-media");
for await (const post of Post.find({})) {
  post.slug ||= slugify(post.title);
  post.altText ||= post.title;
  post.category ||= "Inspiration";
  post.status ||= "published";
  post.visibility ||= "public";
  post.likeCount = post.likes?.length || 0;
  post.commentCount = post.comments?.length || 0;
  if (!post.media?.url) post.media = { ...(post.media?.toObject?.() || {}), url: post.image, dominantColor: "#ddd6ce" };
  if (enrichMedia && post.media?.publicId) {
    const resource = await cloudinary.api.resource(post.media.publicId, { colors: true });
    post.media.width = resource.width;
    post.media.height = resource.height;
    post.media.aspectRatio = resource.width / resource.height;
    post.media.dominantColor = resource.colors?.[0]?.[0] || post.media.dominantColor;
  }
  await post.save();
}

await mongoose.disconnect();
console.log("v1 backfill completed");
