# Architecture

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (CommonJS, ES2018 target) |
| Framework | NestJS v11 |
| Language | TypeScript 5 (strict mode) |
| ORM | Prisma v7 (with `driverAdapters` preview feature) |
| Database | PostgreSQL via Neon (serverless) |
| DB Driver | `@prisma/adapter-neon` + `@neondatabase/serverless` over WebSocket (`ws`) |
| Auth | Passport.js — `passport-local` + `passport-jwt`; `@nestjs/jwt` |
| Validation | `class-validator` + `class-transformer` (global `ValidationPipe`) |
| Hosting | Render (web service) |

---

## Module Organization

The application is composed of these NestJS feature modules, all registered in `AppModule`:

```
AppModule
├── ConfigModule (global)   — reads .env via @nestjs/config
├── PrismaModule            — shared PrismaService (exported globally)
├── AuthModule              — authentication strategies, guards, login/logout/register
├── AdminModule             — admin CRUD
├── AuctionModule           — auction + session + item management
├── TeamModule              — team CRUD
├── StudentModule           — student/candidate CRUD
├── GroupModule             — group/category CRUD
└── StudentGroupModule      — student ↔ group assignments
```

Each feature module follows the standard NestJS pattern:
- **Controller** — handles HTTP routing and delegates to the service
- **Service** — contains all business logic and Prisma queries
- **DTOs** — define and validate request bodies using `class-validator` decorators
- **Entities** — typed response wrappers that use `class-transformer` to exclude sensitive fields

---

## Request Lifecycle

Below is the complete request flow for a typical protected endpoint:

```
1. HTTP Request arrives at NestJS
        │
2. Global ValidationPipe runs
   └── Validates + transforms @Body() using DTO class decorators
   └── Strips unknown properties (whitelist: true)
        │
3. Route Guard Chain (if applied to route)
   ├── JwtAuthGuard (passport-jwt)
   │   └── Extracts Bearer token from Authorization header
   │   └── Verifies signature + expiration using JWT_ACCESS_SECRET
   │   └── Calls JwtAccessStrategy.validate() → attaches { userId, username, role } to req.user
   └── RolesGuard
       └── Reads @Roles() metadata from handler/class
       └── Compares req.user.role to required roles
       └── Throws ForbiddenException if mismatch
        │
4. Controller method executes
   └── Calls Service method with extracted params/body
        │
5. Service executes business logic
   └── Validates referential integrity (existence checks)
   └── Calls PrismaService for DB operations
        │
6. PrismaService executes SQL via Neon adapter
   └── Neon WebSocket connection → PostgreSQL
        │
7. Response flows back through Controller
   └── Result is wrapped in Entity class (e.g., new AuctionEntity(result))
        │
8. Global ClassSerializerInterceptor runs
   └── Applies @Exclude() / @Transform() from entity class
   └── Strips password_hash, hashed_refresh_token from responses
        │
9. JSON response sent to client
```

---

## Controllers

| Controller | Base Route | Responsibility |
|---|---|---|
| `AuthController` | `/auth` | Login, logout, register for admins and teams |
| `AdminController` | `/admin` | Admin CRUD |
| `AuctionController` | `/auction` | Auction CRUD, session creation, item creation |
| `TeamController` | `/team` | Team CRUD |
| `StudentController` | `/student` | Student CRUD |
| `GroupController` | `/group` | Group CRUD |
| `StudentGroupController` | `/student-group` | Student ↔ Group assignment CRUD |

---

## Services

Business logic is exclusively in service classes. Key behaviors per service:

### `AuthService`
- Validates credentials with bcrypt comparison
- Issues JWT access tokens (15 min) and refresh tokens (7 days)
- Hashes and stores refresh tokens in DB on login; nullifies on logout
- Handles both `ADMIN` and `TEAM` roles with a shared code path

### `AuctionService`
- Validates foreign key existence before creates (admin, group, student)
- Enforces auction-type-specific business rules (e.g., Draft items cannot have `SOLD`/`UNSOLD` status)
- `findOne` returns deeply nested auction (creator, teams, sessions, items)

### `AdminService` / `TeamService` / `StudentService`
- Pre-validate uniqueness constraints (email, username, reg_no) before write operations, providing cleaner error messages than raw DB errors

### `GroupService`
- Catches Prisma error codes (`P2002`, `P2003`, `P2025`) directly to produce correct HTTP exceptions

### `StudentGroupService`
- Contains the most complex validation: prevents a student from being assigned to two groups with the **same `key`** (e.g., a student cannot have two different `Department` values)

---

## Prisma Usage

### Connection Setup
`PrismaService` extends `PrismaClient` and implements `OnModuleInit` to connect on startup:

```typescript
// src/prisma/prisma.service.ts
neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
super({ adapter });
await this.$connect(); // called in onModuleInit
```

The Neon adapter replaces the standard PostgreSQL TCP driver with a WebSocket-based connection, which is required for Neon's serverless infrastructure.

### Query Patterns
- All queries use the Prisma Client API (no raw SQL in application code)
- Referential integrity checks are done with application-level `findUnique` calls before mutations
- No explicit Prisma transactions (`$transaction`) are used in the current codebase — **each operation is a discrete DB call**

### Error Handling
Two patterns exist:
1. **Pre-check pattern** (AdminService, TeamService, StudentService): `findUnique` before write, throw typed exceptions if not found or duplicate
2. **Catch-and-rethrow pattern** (GroupService, StudentGroupService): attempt write, catch Prisma error codes (`P2002` = unique constraint, `P2003` = FK constraint, `P2025` = record not found) and map to HTTP exceptions

---

## Transaction Strategy

> **Important:** No multi-step database transactions exist in the current codebase. All service methods perform sequential, independent Prisma calls.

This means:
- If a service creates an auction session and then fails to create the first item, the session persists
- There is no rollback protection for compound operations
- `TeamBudgetHistory` entries (the financial ledger) are not yet connected to a transactional bid workflow — the bidding/budget-deduction logic does not appear in the current service layer

**Recommendation for maintainers:** Implement `prisma.$transaction([...])` for any operation that involves multiple dependent writes (e.g., recording a bid + updating team budget + recording budget history).

---

## Concurrency Handling

The current application does not implement application-level concurrency controls (no mutexes, no optimistic locking, no `SELECT FOR UPDATE`). Database-level unique constraints provide the last line of defense:

- `@@unique([auction_session_id, student_id])` — prevents duplicate auction items per session
- `@@unique([auction_session_id, round_number, turn_number])` — prevents two picks on the same draft turn
- `@@unique([auction_session_id, student_id])` on `DraftPick` — prevents drafting the same student twice
- `auction_item_id` and `winning_bid_id` are `@unique` on `Sale` — prevents double-sale recording

**Needs clarification:** How concurrent bids on the same auction item are resolved (e.g., which arrives first wins, or a locking mechanism) is not implemented in the visible service layer.

---

## Where Business Logic Lives

All business logic is in **Service classes**. Controllers are thin routing layers. Examples:

| Rule | Location |
|---|---|
| Draft items cannot be `SOLD`/`UNSOLD` | `AuctionService.createItem()` |
| Student cannot belong to two groups with same key | `StudentGroupService.create()` |
| Admin email/username must be unique | `AdminService.create()` |
| Team username must be unique | `TeamService.create()` |
| Student reg_no must be unique | `StudentService.create()` |
| Group key+value pair must be unique | Prisma constraint + `GroupService` catch |
| FK references must exist | Service-level `findUnique` pre-checks |
