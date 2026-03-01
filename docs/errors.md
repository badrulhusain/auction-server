# Error Handling

## Global Error Format

NestJS's built-in exception filter produces errors in this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed for field X",
  "error": "Bad Request"
}
```

For validation errors with multiple fields, `message` becomes an array:

```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

There is no custom global exception filter in the codebase — all error responses are produced by NestJS's default `HttpException` handler.

---

## Error Types

### `400 Bad Request`

#### Validation Error
**When:** Request body fails `class-validator` rules enforced by the global `ValidationPipe`.

**Config:** `{ whitelist: true, transform: true }` — unknown properties are silently stripped; known properties with invalid types throw a 400.

**Example:**
```json
{
  "statusCode": 400,
  "message": ["auction_type must be one of the following values: ENGLISH, DRAFT"],
  "error": "Bad Request"
}
```

#### Referenced Entity Not Found (FK Check)
**When:** The service validates a foreign key existence before a write and the referenced record is missing.

**Affected operations:**
- `POST /auction` — `created_by` admin doesn't exist
- `PATCH /auction/:id` — `created_by` in body doesn't exist
- `POST /auction/:id/session` — `group_id` doesn't exist
- `POST /auction/session/:id/item` — `student_id` doesn't exist
- `POST /team` / `PATCH /team/:id` — `auction_id` doesn't exist
- `POST /student-group` — `group_id` doesn't exist

**Example:**
```json
{
  "statusCode": 400,
  "message": "Admin with ID abc-123 does not exist",
  "error": "Bad Request"
}
```

#### Invalid Auction-Type Business Rule
**When:** Attempting to create an `AuctionItem` with status `SOLD` or `UNSOLD` in a `DRAFT` auction.

```json
{
  "statusCode": 400,
  "message": "Draft auctions cannot possess items with SOLD or UNSOLD status. Drafts solely define DraftTurnOrders.",
  "error": "Bad Request"
}
```

#### Prisma FK Constraint Failure (P2003)
**When:** GroupService or StudentGroupService catches Prisma error code `P2003` (foreign key constraint violation at DB level).

```json
{
  "statusCode": 400,
  "message": "Provided student or group ID does not exist in the database",
  "error": "Bad Request"
}
```

#### Prisma Validation Error
**When:** GroupService or StudentGroupService catches `PrismaClientValidationError` (malformed query).

```json
{
  "statusCode": 400,
  "message": "Invalid data provided for group creation",
  "error": "Bad Request"
}
```

---

### `401 Unauthorized`

**When:** Invalid credentials on a login endpoint, or invalid/expired JWT on a protected endpoint.

**Login error:**
```json
{
  "statusCode": 401,
  "message": "Invalid Admin Credentials",
  "error": "Unauthorized"
}
```

**JWT validation error (invalid payload):**
```json
{
  "statusCode": 401,
  "message": "Invalid Token Payload",
  "error": "Unauthorized"
}
```

**JWT expired or signature mismatch:** NestJS/Passport produces a standard 401 automatically.

---

### `403 Forbidden`

**When:** A valid JWT is presented, but the user's `role` does not match the `@Roles()` decorator on the endpoint.

```json
{
  "statusCode": 403,
  "message": "Forbidden: Insufficient role permissions",
  "error": "Forbidden"
}
```

> **Context:** Most CRUD endpoints do not currently apply `@Roles()`, so this error will only appear on endpoints that explicitly use the `RolesGuard` + `@Roles()` decorator combination.

---

### `404 Not Found`

**When:** A requested resource does not exist.

**Controller-level 404 (most modules):**
```json
{
  "statusCode": 404,
  "message": "Auction with ID xyz not found",
  "error": "Not Found"
}
```

**Prisma P2025 caught by service (GroupService, StudentGroupService):**
```json
{
  "statusCode": 404,
  "message": "Group with ID xyz not found",
  "error": "Not Found"
}
```

---

### `409 Conflict`

**When:** A uniqueness constraint is violated.

| Trigger | Message |
|---|---|
| Admin email or username taken | `"Admin with this email or username already exists"` |
| Team username taken | `"Team with username X already exists"` |
| Student `reg_no` taken | `"Student with registration number X already exists"` |
| Group `[key, value]` already exists | `"Group with this key and value already exists"` |
| Student already in a group with same key | `"This student is already assigned to a group with the key 'X' (Group: Y)"` |
| Exact student-group duplicate | `"This student is already assigned to this group"` |

```json
{
  "statusCode": 409,
  "message": "Team with username teamalpha already exists",
  "error": "Conflict"
}
```

---

### `500 Internal Server Error`

**When:** GroupService or StudentGroupService catches an unrecognized Prisma error (not P2002, P2003, P2025, or `PrismaClientValidationError`).

```json
{
  "statusCode": 500,
  "message": "An unexpected error occurred while creating the group",
  "error": "Internal Server Error"
}
```

Other service methods (Admin, Team, Student, Auction) do not have a try/catch for 500 — unhandled Prisma errors will surface as raw 500 exceptions from NestJS's default handler.

---

## Prisma Error Codes Reference

| Code | Meaning | Handled By |
|---|---|---|
| `P2002` | Unique constraint violation | `GroupService`, `StudentGroupService` |
| `P2003` | Foreign key constraint violation | `GroupService`, `StudentGroupService` |
| `P2025` | Record not found (on update/delete) | `GroupService`, `StudentGroupService` |

Most other services handle these conditions via pre-check `findUnique` calls rather than catching Prisma error codes.

---

## Unimplemented Error Types

The following error conditions are defined by or implied by the schema, but not yet handled in the codebase (no corresponding service logic exists):

| Error | When It Would Apply |
|---|---|
| `AUCTION_CLOSED` | Bid placed on a completed/cancelled auction item |
| `INVALID_BID` | Bid below base price or below current highest bid + hike |
| `CONCURRENT_BID_CONFLICT` | Two bids placed simultaneously; one must be rejected |
| `INSUFFICIENT_BUDGET` | Team's `total_budget` is less than the bid amount |
| `INVALID_DRAFT_TURN` | Team attempts to pick out of turn |
