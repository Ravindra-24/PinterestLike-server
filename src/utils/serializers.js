import { postSlug } from "./slug.js";

export const publicUser = (user, viewerId = null) => {
  if (!user) return null;
  const source = user.toObject ? user.toObject({ virtuals: false }) : user;
  const id = String(source._id || source.id);
  const displayName = source.displayName || [source.firstName, source.lastName].filter(Boolean).join(" ") || "Canvas member";
  return {
    id,
    username: source.username || `member-${id.slice(-6)}`,
    displayName,
    firstName: source.firstName,
    lastName: source.lastName,
    bio: source.bio || null,
    profilePicture: source.profilePicture || null,
    joinedAt: source.createdAt,
    followerCount: source.followerCount ?? source.followers?.length ?? 0,
    followingCount: source.followingCount ?? source.following?.length ?? 0,
    postCount: source.postCount ?? source.posts?.length ?? 0,
    ...(viewerId ? { isFollowing: source.followers?.some((id) => String(id) === String(viewerId)) } : {}),
  };
};

export const postSummary = (post, viewerId = null) => {
  const source = post.toObject ? post.toObject({ virtuals: false }) : post;
  const id = String(source._id || source.id);
  return {
    id,
    slug: postSlug(source),
    title: source.title,
    description: source.description || "",
    altText: source.altText || source.title,
    image: source.image,
    media: source.media?.url ? source.media : { url: source.image, dominantColor: "#ddd6ce" },
    user: publicUser(source.user, viewerId),
    category: source.category || "Inspiration",
    tags: source.tags || [],
    createdAt: source.createdAt,
    likeCount: source.likeCount ?? source.likes?.length ?? 0,
    commentCount: source.commentCount ?? source.comments?.length ?? 0,
    saveCount: source.saveCount ?? 0,
    likedByViewer: Boolean(viewerId && source.likes?.some((item) => String(item) === String(viewerId))),
  };
};

export const postDetail = (post, viewerId = null) => {
  const source = post.toObject ? post.toObject({ virtuals: false }) : post;
  return {
    ...postSummary(source, viewerId),
    visibility: source.visibility || "public",
    status: source.status || "published",
    isOwner: Boolean(viewerId && String(source.user?._id || source.user) === String(viewerId)),
    comments: (source.comments || []).map((comment) => ({
      id: String(comment._id || comment.id),
      commentText: comment.commentText,
      user: publicUser(comment.user, viewerId),
      createdAt: comment.createdAt,
      likeCount: comment.likeCount ?? comment.likes?.length ?? 0,
    })),
  };
};

export const collectionSummary = (collection) => {
  const source = collection.toObject ? collection.toObject({ virtuals: false }) : collection;
  return {
    id: String(source._id || source.id),
    slug: `${source.slug}-${source._id || source.id}`,
    name: source.name,
    description: source.description || "",
    visibility: source.visibility,
    owner: publicUser(source.owner),
    cover: source.coverPost?.media?.url ? source.coverPost.media : source.coverPost?.image ? { url: source.coverPost.image } : null,
    itemCount: source.itemCount || 0,
    createdAt: source.createdAt,
  };
};
