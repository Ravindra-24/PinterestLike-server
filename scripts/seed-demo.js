import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/db/schema/User.js";
import { Post } from "../src/db/schema/Post.js";
import { Comment } from "../src/db/schema/Comment.js";
import { Collection } from "../src/db/schema/Collection.js";
import { CollectionItem } from "../src/db/schema/CollectionItem.js";
import { Notification } from "../src/db/schema/Notification.js";

const DEMO_PASSWORD = "Demo@12345";

const accountSeeds = [
  {
    key: "maya",
    firstName: "Maya",
    lastName: "Sharma",
    displayName: "Maya Sharma",
    username: "maya-sharma-demo",
    email: "maya@curiofold.local",
    bio: "Interior stylist collecting warm, practical spaces.",
    interests: ["interiors", "architecture", "diy"],
    profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop",
    role: 0,
  },
  {
    key: "arjun",
    firstName: "Arjun",
    lastName: "Mehta",
    displayName: "Arjun Mehta",
    username: "arjun-mehta-demo",
    email: "arjun@curiofold.local",
    bio: "Weekend cook, photographer, and serial trip planner.",
    interests: ["food", "photography", "travel"],
    profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop",
    role: 0,
  },
  {
    key: "demo",
    firstName: "Demo",
    lastName: "User",
    displayName: "Curiofold Demo",
    username: "curiofold-demo",
    email: "demo@curiofold.local",
    bio: "A general-purpose account for demos and acceptance testing.",
    interests: ["design", "recipes", "travel"],
    profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop",
    role: 0,
  },
  {
    key: "moderator",
    firstName: "Morgan",
    lastName: "Lee",
    displayName: "Demo Moderator",
    username: "curiofold-moderator",
    email: "moderator@curiofold.local",
    bio: "Demo account for testing moderation screens.",
    interests: ["design", "community"],
    profilePicture: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop",
    role: 1,
  },
];

const postSeeds = [
  {
    key: "reading-corner",
    owner: "maya",
    title: "A calm reading corner",
    description: "Layered neutrals, a comfortable chair, and a small pool of warm light.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&auto=format&fit=crop",
    category: "Interiors",
    tags: ["reading nook", "home", "neutral"],
    width: 1200,
    height: 1500,
    dominantColor: "#b59c82",
  },
  {
    key: "tiny-balcony",
    owner: "maya",
    title: "Tiny balcony garden",
    description: "A small-space garden using terracotta pots and vertical planting.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&auto=format&fit=crop",
    category: "Gardens",
    tags: ["balcony", "plants", "small spaces"],
    width: 1200,
    height: 1600,
    dominantColor: "#657255",
  },
  {
    key: "summer-pasta",
    owner: "arjun",
    title: "Simple summer pasta",
    description: "Tomatoes, basil, garlic, and olive oil for an easy weeknight plate.",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1200&auto=format&fit=crop",
    category: "Food",
    tags: ["pasta", "dinner", "recipe"],
    width: 1200,
    height: 1500,
    dominantColor: "#b6633e",
  },
  {
    key: "mountain-road",
    owner: "arjun",
    title: "Roads worth taking",
    description: "A misty mountain route saved for the next long weekend.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop",
    category: "Travel",
    tags: ["mountains", "road trip", "nature"],
    width: 1200,
    height: 800,
    dominantColor: "#61706c",
  },
  {
    key: "desk-setup",
    owner: "demo",
    title: "A focused desk setup",
    description: "An uncluttered workspace with natural materials and soft daylight.",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&auto=format&fit=crop",
    category: "Workspace",
    tags: ["desk", "workspace", "productivity"],
    width: 1200,
    height: 800,
    dominantColor: "#a58f79",
  },
  {
    key: "ceramic-palette",
    owner: "demo",
    title: "Earthy ceramic palette",
    description: "Handmade forms and muted glazes for a tactile mood board.",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&auto=format&fit=crop",
    category: "Craft",
    tags: ["ceramics", "craft", "color palette"],
    width: 1200,
    height: 1500,
    dominantColor: "#a77757",
  },
];

const commentSeeds = [
  { user: "arjun", post: "reading-corner", text: "The warm lighting makes this feel so inviting." },
  { user: "demo", post: "reading-corner", text: "Saving this for my next room refresh." },
  { user: "maya", post: "summer-pasta", text: "This looks perfect for a quick dinner." },
  { user: "demo", post: "mountain-road", text: "That view is going straight onto the travel list." },
];

const collectionSeeds = [
  {
    owner: "maya",
    slug: "cozy-home-ideas",
    name: "Cozy home ideas",
    description: "Warm and useful ideas for relaxed rooms.",
    visibility: "public",
    posts: ["reading-corner", "desk-setup", "ceramic-palette"],
  },
  {
    owner: "arjun",
    slug: "weekend-plans",
    name: "Weekend plans",
    description: "Food and places for an unhurried weekend.",
    visibility: "public",
    posts: ["summer-pasta", "mountain-road", "tiny-balcony"],
  },
  {
    owner: "demo",
    slug: "demo-saves",
    name: "Demo saves",
    description: "A private board for testing saved posts.",
    visibility: "private",
    posts: ["reading-corner", "summer-pasta"],
  },
];

if (!process.env.DB_URI) throw new Error("DB_URI is required. Copy .env.example to .env and set a development database URI.");
if (process.env.NODE_ENV === "production" && !process.argv.includes("--allow-production")) {
  throw new Error("Demo seeding is disabled in production. Use a development database (or explicitly pass --allow-production). ");
}

const users = new Map();
const posts = new Map();

try {
  await mongoose.connect(process.env.DB_URI);

  for (const seed of accountSeeds) {
    let user = await User.findOne({ email: seed.email });
    if (!user) user = new User();
    Object.assign(user, seed, {
      password: DEMO_PASSWORD,
      disabled: false,
      deletedAt: null,
      refreshSessions: [],
    });
    await user.save();
    users.set(seed.key, user);
  }

  const followMap = {
    maya: ["arjun", "demo"],
    arjun: ["maya"],
    demo: ["maya", "arjun"],
    moderator: ["maya", "arjun", "demo"],
  };
  for (const [key, followingKeys] of Object.entries(followMap)) {
    const user = users.get(key);
    const following = followingKeys.map((followingKey) => users.get(followingKey)._id);
    const followers = Object.entries(followMap)
      .filter(([, keys]) => keys.includes(key))
      .map(([followerKey]) => users.get(followerKey)._id);
    user.following = following;
    user.followers = followers;
    user.followingCount = following.length;
    user.followerCount = followers.length;
    await user.save();
  }

  const likeMap = {
    "reading-corner": ["arjun", "demo", "moderator"],
    "tiny-balcony": ["arjun", "demo"],
    "summer-pasta": ["maya", "demo"],
    "mountain-road": ["maya", "demo", "moderator"],
    "desk-setup": ["maya", "arjun"],
    "ceramic-palette": ["maya"],
  };
  for (const seed of postSeeds) {
    const owner = users.get(seed.owner);
    let post = await Post.findOne({ user: owner._id, slug: seed.key });
    if (!post) post = new Post();
    const likes = likeMap[seed.key].map((key) => users.get(key)._id);
    Object.assign(post, {
      title: seed.title,
      description: seed.description,
      image: seed.image,
      slug: seed.key,
      altText: seed.title,
      category: seed.category,
      tags: seed.tags,
      visibility: "public",
      status: "published",
      deletedAt: null,
      user: owner._id,
      likes,
      likeCount: likes.length,
      media: {
        url: seed.image,
        width: seed.width,
        height: seed.height,
        aspectRatio: seed.width / seed.height,
        dominantColor: seed.dominantColor,
      },
    });
    await post.save();
    posts.set(seed.key, post);
  }

  for (const seed of commentSeeds) {
    const user = users.get(seed.user);
    const post = posts.get(seed.post);
    let comment = await Comment.findOne({ user: user._id, post: post._id, commentText: seed.text });
    if (!comment) comment = new Comment({ user: user._id, post: post._id, commentText: seed.text });
    comment.status = "published";
    comment.deletedAt = null;
    await comment.save();
  }

  for (const post of posts.values()) {
    const comments = await Comment.find({ post: post._id, status: "published", deletedAt: null }).select("_id");
    post.comments = comments.map(({ _id }) => _id);
    post.commentCount = comments.length;
    post.engagementScore = post.likeCount + comments.length * 2;
    await post.save();
  }

  for (const seed of collectionSeeds) {
    const owner = users.get(seed.owner);
    let collection = await Collection.findOne({ owner: owner._id, slug: seed.slug });
    if (!collection) collection = new Collection({ owner: owner._id, slug: seed.slug });
    Object.assign(collection, {
      name: seed.name,
      description: seed.description,
      visibility: seed.visibility,
      deletedAt: null,
      coverPost: posts.get(seed.posts[0])._id,
      itemCount: seed.posts.length,
    });
    await collection.save();
    for (const postKey of seed.posts) {
      await CollectionItem.updateOne(
        { collection: collection._id, post: posts.get(postKey)._id },
        { $set: { addedBy: owner._id } },
        { upsert: true },
      );
    }
  }

  for (const [key, user] of users) {
    const ownedPosts = [...posts.values()].filter((post) => post.user.equals(user._id));
    const authoredComments = await Comment.find({ user: user._id, status: "published", deletedAt: null }).select("_id");
    user.posts = ownedPosts.map(({ _id }) => _id);
    user.comments = authoredComments.map(({ _id }) => _id);
    user.postCount = ownedPosts.length;
    await user.save();
  }

  const notifications = [
    { recipient: "maya", actor: "arjun", type: "follow", entityType: "user", entity: users.get("arjun")._id },
    { recipient: "maya", actor: "demo", type: "like", entityType: "post", entity: posts.get("reading-corner")._id },
    { recipient: "arjun", actor: "maya", type: "comment", entityType: "post", entity: posts.get("summer-pasta")._id },
  ];
  for (const seed of notifications) {
    await Notification.updateOne(
      {
        recipient: users.get(seed.recipient)._id,
        actor: users.get(seed.actor)._id,
        type: seed.type,
        entityType: seed.entityType,
        entityId: seed.entity,
      },
      { $setOnInsert: { readAt: null } },
      { upsert: true },
    );
  }

  console.log(`Demo data ready: ${users.size} accounts, ${posts.size} posts, ${commentSeeds.length} comments, ${collectionSeeds.length} collections.`);
  console.log("Account credentials are listed in DEMO_ACCOUNTS.md.");
} finally {
  await mongoose.disconnect();
}
