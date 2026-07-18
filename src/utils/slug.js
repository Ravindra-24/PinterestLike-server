export const slugify = (value = "") =>
  value
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "idea";

export const postSlug = (post) => `${post.slug || slugify(post.title)}-${post._id}`;

export const parseEntityId = (value = "") => {
  const match = value.match(/([a-f\d]{24})$/i);
  return match?.[1] || value;
};
