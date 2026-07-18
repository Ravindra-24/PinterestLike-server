import { Post } from "../../db/schema/Post.js";
import { User } from "../../db/schema/User.js";
import { Collection } from "../../db/schema/Collection.js";
import { postSlug } from "../../utils/slug.js";

const siteUrl = () => (process.env.SITE_URL || "https://pinterest-clone-tau.vercel.app").replace(/\/$/, "");
const escapeXml = (value) => String(value || "").replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]);
const url = (location, lastmod, image = null, title = null) => `<url><loc>${escapeXml(location)}</loc>${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""}${image ? `<image:image><image:loc>${escapeXml(image)}</image:loc><image:title>${escapeXml(title)}</image:title></image:image>` : ""}</url>`;
const sendXml = (res, body) => res.type("application/xml").set("cache-control", "public, max-age=3600, s-maxage=21600").send(body);

export const sitemapIndex = async (_req, res) => sendXml(res, `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${siteUrl()}/sitemaps/posts.xml</loc></sitemap><sitemap><loc>${siteUrl()}/sitemaps/profiles.xml</loc></sitemap><sitemap><loc>${siteUrl()}/sitemaps/collections.xml</loc></sitemap></sitemapindex>`);

export const postsSitemap = async (_req, res) => {
  const posts = await Post.find({ status: "published", visibility: "public" }).select("title slug image media updatedAt").sort({ updatedAt: -1 }).limit(45000).lean();
  return sendXml(res, `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${posts.map((post) => url(`${siteUrl()}/p/${postSlug(post)}`, post.updatedAt, post.media?.url || post.image, post.title)).join("")}</urlset>`);
};

export const profilesSitemap = async (_req, res) => {
  const users = await User.find({ disabled: false, deletedAt: null, username: { $exists: true } }).select("username updatedAt").limit(45000).lean();
  return sendXml(res, `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${users.map((user) => url(`${siteUrl()}/u/${user.username}`, user.updatedAt)).join("")}</urlset>`);
};

export const collectionsSitemap = async (_req, res) => {
  const collections = await Collection.find({ visibility: "public", deletedAt: null }).select("slug updatedAt").limit(45000).lean();
  return sendXml(res, `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${collections.map((collection) => url(`${siteUrl()}/c/${collection.slug}-${collection._id}`, collection.updatedAt)).join("")}</urlset>`);
};
