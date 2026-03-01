# Deployment

## Hosting Platform: Render

The API is deployed as a **web service on [Render](https://render.com)**. This is confirmed by:
- `main.ts` using `process.env.PORT` (the variable Render dynamically assigns to web services)
- Code comment: `// Render dynamically assigns a PORT environment variable to web services`

---

## Environment Variables

The following environment variables must be configured in the Render service dashboard (or a `.env` file for local development):

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | **Yes** | Full Neon PostgreSQL connection string (including credentials and SSL params) |
| `JWT_ACCESS_SECRET` | **Yes** | Secret key for signing/verifying access tokens (JWT, 15-min) |
| `JWT_REFRESH_SECRET` | **Yes** | Secret key for signing/verifying refresh tokens (JWT, 7-day) |
| `PORT` | Set by Render | HTTP port. Defaults to `3000` if not set |
| `NODE_ENV` | Recommended | Set to `production` on Render; controls cookie `secure` flag |

> **Security note:** Never commit `.env` to version control. It is excluded via `.gitignore`.

---

## Database: Neon (Serverless PostgreSQL)

The API connects to **Neon** via the `@prisma/adapter-neon` driver adapter, which uses WebSockets instead of standard TCP:

```typescript
neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
```

Neon's **connection string** format:
```
postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

This is set in the `DATABASE_URL` environment variable and read by both:
- `prisma.config.ts` (for CLI migrations)
- `PrismaService` (for runtime queries)

The `prisma.config.ts` file is used to configure `DATABASE_URL` for Prisma CLI operations independently from NestJS:
```typescript
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.DATABASE_URL! },
});
```

---

## Build Process

### Local Development

```bash
# Install dependencies
npm install

# Run in development mode (ts-node, no compilation)
npm run start:dev
# → ts-node src/main.ts
```

### Production Build

```bash
# Compile TypeScript to JavaScript (outputs to /dist)
npm run build
# → nest build

# Start from compiled output
npm start
# → node dist/main
```

The `tsconfig.json` outputs to `./dist` with CommonJS modules targeting ES2018.

---

## Render Deployment Steps

1. **Connect the GitHub repository** to a Render Web Service.

2. **Set the build command:**
   ```
   npm install && npm run build
   ```

3. **Set the start command:**
   ```
   npm start
   ```
   *(equivalent to `node dist/main`)*

4. **Add environment variables** in the Render dashboard:
   - `DATABASE_URL`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `NODE_ENV=production`

5. Render automatically injects `PORT` — no additional configuration needed.

---

## Database Migration

Prisma migrations must be run **before or after** each deployment that includes schema changes:

```bash
# Apply pending migrations to the target database
npx prisma migrate deploy
```

> `migrate deploy` applies existing migrations without generating new ones — suitable for CI/CD.

To generate a new migration during development:
```bash
npx prisma migrate dev --name <migration_name>
```

The Prisma config (`prisma.config.ts`) ensures the CLI reads `DATABASE_URL` from `.env` when run locally.

---

## Database Seeding

A seed script is provided at `prisma/seed.ts`:

```bash
npx ts-node prisma/seed.ts
```

The seed creates:
- Admin user: `username: admin123`, `email: admin@bidsphere.com`
- Auction: `"Test Auction 2026"` (type `ENGLISH`)
- Team: `username: team_alpha`, budget: `100,000.00`

Seed outputs UUIDs to stdout — useful for testing logout and other ID-dependent operations.

> **Warning:** The seed script uses `upsert` for admin and team (idempotent), but `create` for the auction — running it multiple times will create duplicate auctions.

---

## Health Check

There is no dedicated health check endpoint (e.g., `GET /health`) in the current codebase. Render relies on the HTTP server becoming responsive to determine service health.

**Recommendation:** Add a simple `GET /health` endpoint that returns `{ status: 'ok' }` to provide a fast, dependency-free health signal for Render's health checks.

---

## Startup Sequence

```
1. Bootstrap called (src/main.ts)
2. NestFactory creates AppModule
3. PrismaService.onModuleInit() → $connect() to Neon via WebSocket
4. Global ValidationPipe registered
5. Global ClassSerializerInterceptor registered
6. CORS enabled
7. App listens on process.env.PORT || 3000
8. "Application is running on: <url>" logged to stdout
```
