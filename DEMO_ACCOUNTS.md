# Demo accounts

These accounts are created by `npm run seed:demo` for local development and product demos only. They all use the same password:

```text
Demo@12345
```

| Account | Email | Username | Password | Role |
| --- | --- | --- | --- | --- |
| General demo | `demo@curiofold.local` | `curiofold-demo` | `Demo@12345` | User |
| Maya Sharma | `maya@curiofold.local` | `maya-sharma-demo` | `Demo@12345` | User |
| Arjun Mehta | `arjun@curiofold.local` | `arjun-mehta-demo` | `Demo@12345` | User |
| Demo Moderator | `moderator@curiofold.local` | `curiofold-moderator` | `Demo@12345` | Moderator |

## Load the demo data

From `PinterestLike-server`:

```bash
cp .env.example .env        # only if .env does not exist
# Set DB_URI in .env to a development MongoDB database.
npm run seed:demo
```

The command is idempotent: running it again updates the same demo accounts and content instead of creating duplicates. It also resets every demo account to the password shown above.

> Do not use these public credentials for a production account or seed a production database. The script refuses to run when `NODE_ENV=production` unless the explicit `--allow-production` flag is supplied.
