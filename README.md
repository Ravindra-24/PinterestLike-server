# Curiofold API

A Firebase Cloud Functions API for the Curiofold visual discovery product.

## Architecture

- Express 5 on Firebase Functions v2 in `asia-south1`, Node.js 22
- MongoDB/Mongoose with explicit public serializers
- Cloudinary image validation and responsive-media metadata
- Short-lived bearer access tokens and rotating Secure HttpOnly refresh cookies
- Versioned `/api/v1` endpoints with temporary legacy compatibility adapters
- Cursor feeds, indexed search, collections, reporting, notifications, moderation, export/deletion, and XML sitemaps

## Local setup

```bash
cp .env.example .env
npm install
npm test
npm run build
```

## Demo data

To add reusable demo users, posts, comments, follows, collections, and notifications to the configured development database:

```bash
npm run seed:demo
```

The login emails and passwords are listed in [`DEMO_ACCOUNTS.md`](./DEMO_ACCOUNTS.md). The seed is idempotent and must not be used with a production database.

The API is exported as the `expressApi` Firebase function. A scheduled `updateEngagementScores` function refreshes trending rankings every six hours.

## Primary v1 endpoints

- `POST /api/v1/auth/signup|login|refresh|logout`
- `GET /api/v1/auth/me`
- `GET|POST /api/v1/posts`
- `GET|PATCH|DELETE /api/v1/posts/:id`
- `PATCH /api/v1/posts/:id/like`
- `POST /api/v1/posts/:id/comments`
- `GET /api/v1/search?q=`
- `GET|PATCH /api/v1/users/:identifier`
- `GET|POST /api/v1/collections`
- `GET /api/v1/collections/:slugOrId`
- `POST /api/v1/reports`
- `GET|PATCH /api/v1/notifications`
- `GET|PATCH /api/v1/moderation/reports`
- `GET /api/v1/seo/sitemap.xml`

Every JSON endpoint uses `{ data, meta, error }`. Public serializers intentionally exclude emails, phone numbers, password hashes, refresh sessions, roles, and internal account fields.

## Migration and deployment

1. Back up MongoDB.
2. Deploy the API and scheduled function.
3. Run `npm run backfill:v1`. Add `-- --with-media` only when existing records already have Cloudinary public IDs.
4. Verify `/health`, authentication refresh, feed pagination, public DTOs, and sitemaps.
5. Deploy the Vite frontend and keep old routes for one release cycle.

The environment contract is documented in `.env.example`. Set `ALLOWED_ORIGINS` as a comma-separated exact allowlist and configure the same `SITE_URL` used by frontend canonicals and sitemaps.
