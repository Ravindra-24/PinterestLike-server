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

const catalogPostSeeds = [
  ["sunlit-living-room", "maya", "Sunlit living room", "Soft linen, pale timber, and an easy layout built around natural light.", "1524758631624-e2822e304c36", "Interiors", ["living room", "natural light", "minimal"]],
  ["warm-bedroom-layers", "maya", "Warm bedroom layers", "A restful bedroom palette with tactile throws and quiet earth tones.", "1600566753086-00f18fb6b3ea", "Interiors", ["bedroom", "textiles", "cozy"]],
  ["modern-dining-space", "maya", "Modern dining space", "Clean lines and warm wood make this dining room feel welcoming rather than formal.", "1600210492486-724fe5c67fb0", "Interiors", ["dining room", "wood", "modern"]],
  ["creative-studio-desk", "demo", "Creative studio desk", "A practical studio setup with room for sketches, samples, and focused work.", "1497366216548-37526070297c", "Interiors", ["studio", "desk", "creative"]],
  ["quiet-kitchen-details", "maya", "Quiet kitchen details", "Simple storage and honest materials for a kitchen that works hard without visual noise.", "1449844908441-8829872d2607", "Interiors", ["kitchen", "storage", "details"]],
  ["courtyard-house", "maya", "Courtyard house geometry", "Strong geometric forms softened by greenery and an open central courtyard.", "1487958449943-2429e8be8625", "Architecture", ["courtyard", "modern house", "geometry"]],
  ["concrete-and-sky", "demo", "Concrete and open sky", "An architectural study in shadow, scale, and crisp concrete planes.", "1518005020951-eccb494ad742", "Architecture", ["concrete", "minimalism", "facade"]],
  ["city-facade-rhythm", "arjun", "City facade rhythm", "Repeating windows and balconies turn an everyday elevation into a graphic pattern.", "1480714378408-67cf0d13bc1b", "Architecture", ["city", "facade", "pattern"]],
  ["desert-modern-home", "maya", "Desert modern home", "Low forms, sandy color, and deep shade designed for a dry landscape.", "1549490349-8643362247b5", "Architecture", ["desert", "house", "landscape"]],
  ["museum-lines", "demo", "Museum lines", "A quiet perspective where structure, light, and negative space do the talking.", "1511818966892-d7d671e672a2", "Architecture", ["museum", "lines", "perspective"]],
  ["misty-forest-path", "arjun", "Misty forest path", "A green trail disappearing into fog—ideal inspiration for a slow weekend outdoors.", "1441974231531-c6227db76b6e", "Nature", ["forest", "mist", "trail"]],
  ["alpine-lake-morning", "arjun", "Alpine lake morning", "Still water and sharp mountain air captured just after sunrise.", "1469474968028-56623f02e42e", "Nature", ["lake", "mountains", "morning"]],
  ["golden-field", "demo", "A field at golden hour", "Late sunlight turns a simple open field into layers of warm color.", "1470252649378-9c29740c9fa8", "Nature", ["golden hour", "field", "sunset"]],
  ["highland-valley", "arjun", "Highland valley", "A broad green valley with enough distance to make everything feel unhurried.", "1501785888041-af3ef285b470", "Nature", ["valley", "hiking", "landscape"]],
  ["snowy-ridge", "arjun", "Snowy ridge study", "A cool-toned mountain study balancing dramatic peaks with a soft sky.", "1493246507139-91e8fad9978e", "Nature", ["snow", "ridge", "mountains"]],
  ["wild-meadow", "maya", "Wild meadow notes", "Loose grasses and small blooms make a naturally textured planting reference.", "1472214103451-9374bd1c798e", "Nature", ["meadow", "wildflowers", "garden"]],
  ["street-style-neutral", "demo", "Street style in neutrals", "Relaxed tailoring and a restrained palette for an easy everyday uniform.", "1529139574466-a303027c1d8b", "Fashion", ["street style", "neutral", "tailoring"]],
  ["colorful-wardrobe", "maya", "A more colorful wardrobe", "A cheerful edit of color, texture, and pieces that layer well together.", "1483985988355-763728e1935b", "Fashion", ["wardrobe", "color", "style"]],
  ["weekend-layers", "demo", "Weekend layers", "Comfortable proportions and light layers for an adaptable weekend look.", "1490481651871-ab68de25d43d", "Fashion", ["layers", "weekend", "outfit"]],
  ["monochrome-look", "maya", "Monochrome with texture", "One-color dressing made interesting through shape, weave, and subtle contrast.", "1515886657613-9f3515b0c78f", "Fashion", ["monochrome", "texture", "minimal"]],
  ["shared-table", "arjun", "A table made for sharing", "A generous spread of colorful plates for a long meal with friends.", "1504674900247-0877df9cc836", "Food", ["dinner", "sharing", "table"]],
  ["fresh-market-bowl", "arjun", "Fresh market bowl", "Crisp vegetables, grains, and a bright dressing for an unfussy lunch.", "1540189549336-e6e99c3679fe", "Food", ["salad", "lunch", "fresh"]],
  ["homemade-pizza-night", "demo", "Homemade pizza night", "A crisp, bubbling pizza that makes a convincing case for staying in.", "1565299624946-b28f40a0ae38", "Food", ["pizza", "weeknight", "recipe"]],
  ["slow-breakfast", "arjun", "A slow breakfast", "Coffee, fruit, and something warm from the oven for an unhurried start.", "1551183053-bf91a1d81141", "Food", ["breakfast", "coffee", "weekend"]],
  ["colorful-vegetable-plate", "maya", "Colorful vegetable plate", "Seasonal vegetables arranged with plenty of texture, herbs, and crunch.", "1476224203421-9ac39bcb3327", "Food", ["vegetables", "healthy", "seasonal"]],
  ["abstract-color-study", "demo", "Abstract color study", "Overlapping forms and confident color combinations for a bold visual reference.", "1547891654-e66ed7ebb968", "Art", ["abstract", "color", "painting"]],
  ["gallery-wall-notes", "maya", "Gallery wall notes", "A collected arrangement that mixes scale and style while keeping a clear rhythm.", "1579783902614-a3fb3927b6a5", "Art", ["gallery wall", "art", "composition"]],
  ["paint-and-motion", "demo", "Paint and motion", "Expressive marks and layered pigment create movement across the surface.", "1541961017774-22349e4a1262", "Art", ["painting", "texture", "movement"]],
  ["camera-on-the-road", "arjun", "Camera on the road", "A compact photography kit ready for long walks and unexpected frames.", "1452780212940-6f5c0d14d848", "Photography", ["camera", "travel", "gear"]],
  ["shadow-and-window", "demo", "Shadow and window", "A reminder that ordinary light can become the entire subject of a photograph.", "1452587925148-ce544e77e70d", "Photography", ["shadow", "light", "composition"]],
  ["quiet-beach", "arjun", "A quiet beach escape", "Clear water, pale sand, and an almost empty horizon saved for later.", "1507525428034-b723cf961d3e", "Travel", ["beach", "island", "escape"]],
  ["coastal-road-trip", "arjun", "Coastal road trip", "A winding route with ocean views and plenty of reasons to stop along the way.", "1476514525535-07fb3b4ae5f1", "Travel", ["coast", "road trip", "ocean"]],
  ["old-city-walk", "maya", "An old-city walk", "Weathered streets, small cafes, and details best discovered without a schedule.", "1488646953014-85cb44e25828", "Travel", ["city", "walking", "architecture"]],
  ["train-window-journey", "demo", "Train-window journey", "Changing landscapes and a window seat make the journey part of the destination.", "1503220317375-aaad61436b1b", "Travel", ["train", "journey", "landscape"]],
  ["paris-side-street", "maya", "Paris side street", "A quieter corner of the city with balconies, bicycles, and morning light.", "1499856871958-5b9627545d1a", "Travel", ["paris", "street", "city"]],
  ["weekend-cabin", "arjun", "Weekend cabin retreat", "A small hideaway surrounded by trees and designed around the view.", "1500835556837-99ac94a94552", "Travel", ["cabin", "weekend", "nature"]],
];

const demoColors = ["#b9a58e", "#7d8b75", "#9e7764", "#71818c", "#c09062", "#69645f"];
postSeeds.push(...catalogPostSeeds.map(([key, owner, title, description, photoId, category, tags], index) => {
  const height = [1500, 900, 1350, 1600][index % 4];
  const image = `https://images.unsplash.com/photo-${photoId}?w=1200&h=${height}&auto=format&fit=crop`;
  return {
    key,
    owner,
    title,
    description,
    image,
    category,
    tags,
    width: 1200,
    height,
    dominantColor: demoColors[index % demoColors.length],
  };
}));

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
  for (const [index, seed] of postSeeds.entries()) {
    const owner = users.get(seed.owner);
    let post = await Post.findOne({ user: owner._id, slug: seed.key });
    if (!post) post = new Post();
    const fallbackLikes = accountSeeds
      .filter(({ key }) => key !== seed.owner)
      .slice(0, (index % 3) + 1)
      .map(({ key }) => key);
    const likes = (likeMap[seed.key] || fallbackLikes).map((key) => users.get(key)._id);
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
