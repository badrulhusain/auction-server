# Contributing

## Prerequisites

- Node.js (ES2018+ compatible runtime)
- npm
- Access to a Neon PostgreSQL database (or a local PostgreSQL instance)
- Prisma CLI (installed as a dev dependency)

---

## Local Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd auction-api

# 2. Install dependencies
npm install

# 3. Create a .env file in the project root
cp .env.example .env  # or create manually

# 4. Set required variables in .env:
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
JWT_ACCESS_SECRET="your-access-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
NODE_ENV="development"

# 5. Apply database migrations
npx prisma migrate deploy

# 6. (Optional) Seed the database with test data
npx ts-node prisma/seed.ts

# 7. Start the development server
npm run start:dev
```

The API will be available at `http://localhost:3000`.

---

## Project Structure

```
auction-api/
├── src/
│   ├── main.ts                  # Bootstrap: global pipes, interceptors, CORS
│   ├── app.module.ts            # Root module, imports all feature modules
│   ├── prisma/
│   │   ├── prisma.module.ts     # Shared Prisma module
│   │   └── prisma.service.ts    # PrismaClient with Neon adapter
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts   # Login, logout, register
│   │   ├── auth.service.ts      # Token generation, bcrypt, validation
│   │   ├── strategies/          # passport-local and passport-jwt strategies
│   │   ├── guards/              # JwtAuthGuard, RolesGuard, local guards
│   │   ├── decorators/          # @CurrentUser(), @Roles()
│   │   └── dto/register.dto.ts
│   ├── admin/
│   │   ├── admin.module.ts
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   ├── dto/
│   │   └── entities/admin.entity.ts
│   ├── auction/
│   │   ├── auction.module.ts
│   │   ├── auction.controller.ts  # Also handles session and item routes
│   │   ├── auction.service.ts
│   │   ├── dto/
│   │   └── entities/auction.entity.ts
│   ├── team/
│   ├── student/
│   ├── group/
│   └── student-group/
├── prisma/
│   ├── schema.prisma            # Source of truth for DB schema
│   ├── seed.ts                  # Development seed script
│   └── migrations/              # Prisma migration history
├── prisma.config.ts             # Prisma CLI configuration (for migrations)
├── tsconfig.json
├── package.json
└── postman_collection.json      # Manual testing collection
```

---

## Adding a New Feature Module

Follow this checklist when adding a new NestJS feature module:

1. **Create the module directory** under `src/<module-name>/`

2. **Create the following files:**
   - `<name>.module.ts` — import `PrismaModule`, declare controller and service
   - `<name>.controller.ts` — route definitions, delegate to service
   - `<name>.service.ts` — all business logic and Prisma queries
   - `dto/create-<name>.dto.ts` — request body with `class-validator` decorators
   - `dto/update-<name>.dto.ts` — extend `PartialType(Create<Name>Dto)`
   - `entities/<name>.entity.ts` — response shape with `@Exclude()` for sensitive fields

3. **Register the module** in `src/app.module.ts` imports array.

4. **Wrap sensitive responses** in the entity class and use `new EntityClass(result)` in controllers.

---

## Modifying the Database Schema

1. Edit `prisma/schema.prisma`
2. Generate a migration:
   ```bash
   npx prisma migrate dev --name describe_your_change
   ```
3. The generated SQL migration appears in `prisma/migrations/`
4. Prisma regenerates the client automatically
5. Update affected DTOs, services, and entities as needed

---

## Code Conventions

| Convention | Rule |
|---|---|
| **Business logic** | Always in service classes, never in controllers |
| **Response wrapping** | Use entity classes to control serialization; never return raw Prisma objects from controllers |
| **Error handling** | Throw NestJS HTTP exceptions (`NotFoundException`, `BadRequestException`, etc.); do not expose raw Prisma errors |
| **FK validation** | Pre-check existence with `findUnique` before writes (preferred over catch-and-rethrow for most services) |
| **Enum values** | Use Prisma-generated enums (`import { AuctionType } from '@prisma/client'`) — never raw strings |
| **DTOs** | All input must be decorated with `class-validator`; run through global `ValidationPipe` |
| **Sensitive fields** | Always `@Exclude()` on entity classes; never return `password_hash` or `hashed_refresh_token` |
| **Auth guards** | Apply `JwtAuthGuard` + `RolesGuard` + `@Roles(...)` to any endpoint that should be protected |
| **Transactions** | Use `prisma.$transaction()` for any multi-step write that must be atomic |

---

## Code Comment Suggestions

The following complex areas in the existing codebase would benefit from inline documentation:

### `src/prisma/prisma.service.ts`
The Neon adapter setup is non-obvious for developers unfamiliar with Neon:
```typescript
// Neon's serverless PostgreSQL requires a WebSocket-based driver adapter
// instead of the standard TCP PrismaClient. The `ws` package provides
// the WebSocket constructor required by @neondatabase/serverless.
neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
super({ adapter });
```

### `src/auth/auth.service.ts` — `updateRefreshToken()`
The decision to hash the refresh token before DB storage is a security measure worth documenting:
```typescript
// The refresh token is hashed before storage so that a DB compromise
// does not expose valid tokens. Verification requires bcrypt.compare()
// against the stored hash (not implemented yet in a refresh endpoint).
const hashedRefreshToken = await this.hashData(refreshToken);
```

### `src/auth/auth.controller.ts` — `adminLogout()`
The TODO in the logout implementation should be formalized:
```typescript
// TODO: Replace userId body parameter with @CurrentUser() decorator once
// JwtAuthGuard is applied to this endpoint. Accepting userId in the body
// is a security gap — any caller can log out any user by ID.
```

### `src/student-group/student-group.service.ts` — `create()`
The two-step uniqueness check (application-level over the `key`, then DB for `student_id`+`group_id`) is non-obvious and warrants explanation:
```typescript
// Business rule: A student may only hold one group per key-namespace.
// E.g., a student in "Department: CS" cannot also be in "Department: IT".
// This check is done at the application layer because the DB constraint
// only enforces (student_id, group_id) uniqueness, not key-level exclusivity.
```

### `src/auction/auction.service.ts` — `createItem()`
```typescript
// Draft auctions use DraftPick records for outcomes, not BidHistory/Sale.
// Allowing SOLD/UNSOLD on draft items would create semantic inconsistency.
// This guard enforces auction-type purity at the item creation boundary.
if (session.auction.auction_type === 'DRAFT') { ... }
```

---

## Running Tests

There is no test suite configured in the current codebase. `@nestjs/testing` is listed as a dependency, indicating the scaffold exists for adding tests.

**Recommended test structure:**
```
src/
├── auth/
│   └── auth.service.spec.ts     # Unit test: token generation, bcrypt
├── auction/
│   └── auction.service.spec.ts  # Unit test: business rules (draft item guard)
└── student-group/
    └── student-group.service.spec.ts  # Unit test: key-conflict logic
```

Use `@nestjs/testing`'s `Test.createTestingModule()` with mocked `PrismaService` for unit tests.
