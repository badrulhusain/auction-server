# Security

## Authentication Architecture

The system implements two separate authentication flows sharing the same JWT infrastructure.

### Actor Types and Strategies

| Actor | Login Endpoint | Passport Strategy | Guard |
|---|---|---|---|
| Admin | `POST /auth/admin/login` | `admin-local` (passport-local) | `AdminLocalAuthGuard` |
| Team | `POST /auth/team/login` | `team-local` (passport-local) | `TeamLocalAuthGuard` |
| Any (JWT) | Protected endpoints | `jwt` (passport-jwt) | `JwtAuthGuard` |

### Token Structure

**Access Token (JWT):**
- Signed with `JWT_ACCESS_SECRET` environment variable
- Payload: `{ sub: userId, username, role: 'ADMIN' | 'TEAM' }`
- Expiry: **15 minutes**
- Delivery: JSON response body (`access_token` field)

**Refresh Token (JWT):**
- Signed with `JWT_REFRESH_SECRET` environment variable (separate secret)
- Same payload structure
- Expiry: **7 days**
- Delivery: `HttpOnly` cookie (`admin_refresh_token` or `team_refresh_token`)
- Storage: bcrypt-hashed copy stored in `admins.hashed_refresh_token` or `teams.hashed_refresh_token`

### Cookie Security Settings

```typescript
res.cookie('admin_refresh_token', tokens.refreshToken, {
    httpOnly: true,                                    // not accessible to JavaScript
    secure: process.env.NODE_ENV === 'production',     // HTTPS only in production
    sameSite: 'strict',                                // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000,                 // 7 days
});
```

> **Note:** `sameSite: 'strict'` prevents the refresh token cookie from being sent in cross-site requests. If a separate frontend domain is used, this may need to be changed to `'lax'` or `'none'` (with `secure: true`).

---

## Password Hashing

All passwords are hashed with **bcrypt** at a cost factor of 10 rounds before storage. This applies to:
- Admin passwords (via `AuthService.registerAdmin()` and `AuthService.hashData()`)
- Team passwords (via `AuthService.registerTeam()`)
- Refresh tokens before DB storage (`AuthService.updateRefreshToken()`)

Credential validation uses `bcrypt.compare()` — no timing-attack-vulnerable string comparison.

> **Known Issue:** `CreateAdminDto` and `CreateTeamDto` have a field named `password_hash` (not `password`). When creating via `POST /admin` or `POST /team` directly, the value provided in `password_hash` is stored **as-is** without hashing. Only the `POST /auth/admin/register` and `POST /auth/team/register` endpoints hash the password. **Developers integrating team/admin creation should always use the `/auth/` registration endpoints.**

---

## Response Sanitization

Sensitive fields are prevented from appearing in any API response using `class-transformer`:

```typescript
@Exclude()
password_hash!: string;

@Exclude()
hashed_refresh_token!: string | null;
```

The global `ClassSerializerInterceptor` (configured in `main.ts`) applies these exclusions automatically to all responses wrapped in entity classes (`AdminEntity`, `TeamEntity`).

**Important:** Only controllers that wrap their responses in entity classes benefit from this. Services that return raw Prisma objects bypass `@Exclude()`.

---

## Role-Based Authorization

Roles are embedded in the JWT payload (`role: 'ADMIN' | 'TEAM'`) and enforced by two components:

1. **`JwtAccessStrategy.validate()`** — validates the JWT payload structure and attaches `{ userId, username, role }` to `req.user`

2. **`RolesGuard`** — reads `@Roles('ADMIN')` or `@Roles('TEAM')` metadata using NestJS's `Reflector`. If the decorator is absent, the guard passes. If present, `req.user.role` must be included in the required roles list.

Usage pattern:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Delete(':id')
async remove() { ... }
```

> **Current Gap:** `JwtAuthGuard` and `RolesGuard` are not applied to any CRUD controller in the current codebase. All `POST`, `GET`, `PATCH`, `DELETE` endpoints on `/admin`, `/auction`, `/team`, `/student`, `/group`, and `/student-group` are **publicly accessible without authentication**. This should be addressed before production hardening.

---

## Input Validation

All request bodies are validated using `class-validator` decorators on DTO classes, enforced globally via:

```typescript
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

- **`whitelist: true`** — silently strips any properties not declared in the DTO class. This prevents property injection attacks (e.g., injecting unknown fields that might reach Prisma).
- **`transform: true`** — automatically coerces incoming JSON values to their declared TypeScript types (e.g., `"123"` → `123` for `@IsInt()`).

Specific validations enforced:
- `@IsEmail()` on admin email
- `@MinLength(8)` on passwords
- `@IsEnum()` on all enum fields (prevents arbitrary string injection into lookup fields)
- `@IsUUID()` on StudentGroup IDs
- `@IsDateString()` on date fields

---

## CORS

CORS is enabled globally with NestJS's default configuration:

```typescript
app.enableCors();
```

The default NestJS `enableCors()` call **allows all origins** (`*`). This is suitable for development but should be restricted in production:

```typescript
app.enableCors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true, // required if using cookies (refresh tokens)
});
```

---

## Logout / Session Invalidation

Logout nullifies the hashed refresh token in the database:

```typescript
await this.prisma.admin.updateMany({
    where: {
        id: userId,
        hashed_refresh_token: { not: null }, // idempotent: no error if already logged out
    },
    data: { hashed_refresh_token: null },
});
```

This effectively invalidates the refresh token server-side. However, **access tokens remain valid until they expire** (15 minutes). There is no access token blacklist or revocation mechanism.

---

## Security Recommendations for Production

| Issue | Recommendation |
|---|---|
| All CRUD endpoints are unauthenticated | Apply `JwtAuthGuard` + `RolesGuard` + `@Roles('ADMIN')` to mutation endpoints |
| `POST /auth/admin/register` is unprotected | Restrict or remove this endpoint; admins should be pre-seeded or created via an internal mechanism |
| `POST /auth/team/logout` accepts `userId` in body | Extract `userId` from `req.user` via `@CurrentUser()` after `JwtAuthGuard` |
| CORS allows all origins | Restrict `origin` in `enableCors()` to known frontend domains |
| No access token revocation | Consider short-lived tokens (already 15m) as acceptable trade-off, or implement a Redis-based blocklist |
| Soft-delete fields unused | Apply `where: { deleted_at: null }` filter to all queries or use a Prisma middleware to enforce it |
| No rate limiting | Add `@nestjs/throttler` to protect login endpoints from brute force |
