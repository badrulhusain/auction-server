# API Reference

## Base URL

| Environment | URL |
|---|---|
| Local | `http://localhost:3000` |
| Production (Render) | *(from your Render service dashboard)* |

All endpoints return JSON. All request bodies must include `Content-Type: application/json`.

---

## Authentication

Two actor types exist: **Admin** and **Team**. They use separate login endpoints but share the same JWT verification infrastructure.

### Token Format
After login, the API returns an `access_token` (JWT, 15-minute expiry) in the response body. A `refresh_token` is stored server-side (hashed) and delivered as an `httpOnly` cookie.

For protected endpoints (where applicable), include the access token as:
```
Authorization: Bearer <access_token>
```

> **Important:** In the current codebase, **most endpoints do not apply `JwtAuthGuard` or `RolesGuard`**. The guards (`JwtAuthGuard`, `RolesGuard`, `@Roles()`) are implemented and available, but not yet applied to CRUD controllers (Admin, Auction, Team, Student, Group, StudentGroup). Only the `AuthController` login flows apply guards. This means most resource endpoints are **currently unauthenticated**.

---

## Auth Endpoints `/auth`

### `POST /auth/admin/login`

Authenticates an admin using username and password (via `passport-local` `admin-local` strategy).

**Auth:** None (uses `AdminLocalAuthGuard`)

**Request Body:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `username` | string | Yes | Admin username |
| `password` | string | Yes | Plain-text password |

**Response `200`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```
A `Set-Cookie: admin_refresh_token=...; HttpOnly; SameSite=Strict` header is also set (7-day expiry, `Secure` in production).

**Errors:**
| Status | Condition |
|---|---|
| `401 Unauthorized` | Invalid credentials |

---

### `POST /auth/admin/logout`

Clears the admin's refresh token from the database and removes the cookie.

**Auth:** None *(see note — this should be protected)*

**Request Body:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `userId` | string (UUID) | Yes | Admin's UUID |

> **Note:** This endpoint accepts `userId` in body. It is marked in code comments as a placeholder — a future version should extract this from the JWT via `@CurrentUser()`.

**Response `200`:**
```json
{ "message": "Logged out successfully" }
```

---

### `POST /auth/admin/register`

Registers a new admin account.

**Auth:** None *(unprotected — consider restricting in production)*

**Request Body:**
| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | string | Yes | Non-empty |
| `email` | string | Yes | Valid email format |
| `username` | string | Yes | Non-empty |
| `password` | string | Yes | Non-empty |

**Response `201`:** Admin object (without `password_hash` or `hashed_refresh_token`).

**Errors:**
| Status | Condition |
|---|---|
| `400 Bad Request` | Validation failure |

---

### `POST /auth/team/login`

Authenticates a team using username and password (via `passport-local` `team-local` strategy).

**Auth:** None (uses `TeamLocalAuthGuard`)

**Request Body:** Same structure as admin login (`username`, `password`).

**Response `200`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```
Sets `Set-Cookie: team_refresh_token=...; HttpOnly; SameSite=Strict`.

**Errors:**
| Status | Condition |
|---|---|
| `401 Unauthorized` | Invalid team credentials |

---

### `POST /auth/team/logout`

Clears the team's refresh token.

**Auth:** None

**Request Body:**
| Field | Type | Required |
|---|---|---|
| `userId` | string (UUID) | Yes |

**Response `200`:** `{ "message": "Logged out successfully" }`

---

### `POST /auth/team/register`

Registers a new team, linked to a specific auction.

**Auth:** None

**Request Body:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `auction_id` | string (UUID) | Yes | Must be a valid auction |
| `name` | string | Yes | |
| `username` | string | Yes | Must be unique |
| `password` | string | Yes | Hashed internally with bcrypt |
| `total_budget` | number | Yes | Initial budget |

**Response `201`:** Team object (without `password_hash` or `hashed_refresh_token`).

---

## Admin Endpoints `/admin`

### `POST /admin`

Creates a new admin record. Password must be provided in the `password_hash` field — note this does **not** hash the value; use `POST /auth/admin/register` for proper registration.

**Request Body:**
| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | string | Yes | Non-empty |
| `email` | string | Yes | Valid email |
| `username` | string | Yes | Non-empty |
| `password_hash` | string | Yes | Min length 8 |

**Response `201`:** `AdminEntity` — fields `password_hash` and `hashed_refresh_token` are excluded from the response.

**Errors:**
| Status | Condition |
|---|---|
| `400 Bad Request` | Validation failure |
| `409 Conflict` | Email or username already exists |

---

### `GET /admin`

Returns all admin records.

**Response `200`:** Array of `AdminEntity` (sensitive fields excluded).

---

### `GET /admin/:id`

Returns a single admin by UUID.

**Path Params:** `id` — Admin UUID

**Response `200`:** `AdminEntity`

**Errors:**
| Status | Condition |
|---|---|
| `404 Not Found` | No admin with that ID |

---

### `PATCH /admin/:id`

Partially updates an admin record. All fields optional.

**Request Body:** Partial `CreateAdminDto` (any of `name`, `email`, `username`, `password_hash`).

**Response `200`:** Updated `AdminEntity`

**Errors:**
| Status | Condition |
|---|---|
| `404 Not Found` | Admin not found |
| `409 Conflict` | Email or username taken by another admin |

---

### `DELETE /admin/:id`

Deletes an admin by ID (hard delete).

**Response `200`:** Deleted `AdminEntity`

**Errors:**
| Status | Condition |
|---|---|
| `404 Not Found` | Admin not found |

---

## Auction Endpoints `/auction`

### `POST /auction`

Creates a new top-level auction event.

**Request Body:**
| Field | Type | Required | Validation |
|---|---|---|---|
| `created_by` | string (UUID) | Yes | Must reference an existing admin |
| `name` | string | Yes | Non-empty |
| `auction_type` | `ENGLISH` \| `DRAFT` | Yes | Enum |
| `status` | `AuctionStatus` | No | Defaults to `PENDING` |
| `started_at` | ISO 8601 date string | No | |
| `ended_at` | ISO 8601 date string | No | |

**Response `201`:** `AuctionEntity`

**Errors:**
| Status | Condition |
|---|---|
| `400 Bad Request` | Validation failure or admin ID not found |

---

### `GET /auction`

Returns all auctions (flat list, no relations).

**Response `200`:** Array of `AuctionEntity`

---

### `GET /auction/:id`

Returns a single auction with nested sessions and items.

**Response `200`:**
```json
{
  "id": "...",
  "name": "...",
  "auction_type": "ENGLISH",
  "status": "PENDING",
  "creator": { "id": "...", "name": "...", ... },
  "teams": [ ... ],
  "auction_sessions": [
    {
      "id": "...",
      "name": "...",
      "auction_items": [ ... ]
    }
  ]
}
```

**Errors:**
| Status | Condition |
|---|---|
| `404 Not Found` | Auction not found |

---

### `PATCH /auction/:id`

Partially updates an auction (including status transitions).

**Request Body:** Partial `CreateAuctionDto`

**Response `200`:** Updated `AuctionEntity`

**Errors:**
| Status | Condition |
|---|---|
| `404 Not Found` | Auction not found |
| `400 Bad Request` | `created_by` references a non-existent admin |

---

### `DELETE /auction/:id`

Hard deletes an auction. Will fail if referential constraints exist (teams, sessions).

**Response `200`:** Deleted `AuctionEntity`

**Errors:**
| Status | Condition |
|---|---|
| `404 Not Found` | Auction not found |
| DB FK error | Auction has dependent records (`onDelete: Restrict`) |

---

### `POST /auction/:id/session`

Creates a sub-session within an auction.

**Path Params:** `id` — Auction UUID

**Request Body:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `group_id` | string (UUID) | Yes | Must reference existing group |
| `name` | string | Yes | |
| `session_number` | integer | Yes | Must be unique per auction |
| `status` | `AuctionSessionStatus` | No | |
| `rule` | `DEFAULT` \| `CUSTOM` | No | Draft sessions |
| `custom_rule` | string | No | Draft sessions |
| `hike` | number | No | English sessions; minimum bid increment |
| `max_time_per_candidate` | integer | No | Seconds; English sessions |

**Response `201`:** `AuctionSession` record

**Errors:**
| Status | Condition |
|---|---|
| `404 Not Found` | Auction not found |
| `400 Bad Request` | Group ID not found |
| DB unique error | Duplicate `[auction_id, session_number]` |

---

### `POST /auction/session/:sessionId/item`

Adds a student to a session as a biddable item.

**Path Params:** `sessionId` — AuctionSession UUID

**Request Body:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `student_id` | string (UUID) | Yes | Must reference existing student |
| `base_price` | number | Yes | Floor price |
| `item_order` | integer | Yes | Unique order within session |
| `status` | `AuctionItemStatus` | No | Cannot be `SOLD`/`UNSOLD` for Draft auctions |

**Response `201`:** `AuctionItem` record

**Errors:**
| Status | Condition |
|---|---|
| `404 Not Found` | Session not found |
| `400 Bad Request` | Student not found, or Draft auction with SOLD/UNSOLD status |
| DB unique error | Duplicate item order or student in same session |

---

## Team Endpoints `/team`

### `POST /team`

Creates a team directly (accepts raw `password_hash`). Prefer `POST /auth/team/register` for client-facing registration.

**Request Body:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `auction_id` | string (UUID) | Yes | Must exist |
| `name` | string | Yes | |
| `username` | string | Yes | Globally unique |
| `password_hash` | string | Yes | Min 8 chars; **not hashed by this endpoint** |
| `total_budget` | number | Yes | |
| `status` | `TeamStatus` | No | |

**Response `201`:** `TeamEntity` (sensitive fields excluded; `total_budget` transformed to `number`)

**Errors:**
| Status | Condition |
|---|---|
| `400 Bad Request` | Auction not found |
| `409 Conflict` | Username already taken |

---

### `GET /team`

Returns all teams.

**Response `200`:** Array of `TeamEntity`

---

### `GET /team/:id`

Returns a team by UUID.

**Errors:** `404 Not Found`

---

### `PATCH /team/:id`

Partially updates a team.

**Errors:**
| Status | Condition |
|---|---|
| `404 Not Found` | Team not found |
| `400 Bad Request` | Referenced auction not found |
| `409 Conflict` | Username taken |

---

### `DELETE /team/:id`

Hard deletes a team.

**Errors:** `404 Not Found`

---

## Student Endpoints `/student`

Standard CRUD. No auth applied.

### `POST /student`

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | string | Yes | Non-empty |
| `reg_no` | string | Yes | Non-empty, unique |
| `is_active` | boolean | No | Default `true` |

**Errors:** `409 Conflict` if `reg_no` already exists.

### `GET /student` — Returns all students.
### `GET /student/:id` — Returns one student. `404` if not found.
### `PATCH /student/:id` — Partial update. `409` on duplicate `reg_no`.
### `DELETE /student/:id` — Hard delete. `404` if not found.

---

## Group Endpoints `/group`

Standard CRUD. No auth applied.

### `POST /group`

| Field | Type | Required |
|---|---|---|
| `key` | string | Yes |
| `value` | string | Yes |

`[key, value]` must be unique. **Errors:** `409 Conflict` if duplicate.

### `GET /group` — Returns all groups.
### `GET /group/:id` — `404` if not found.
### `PATCH /group/:id` — Partial update.
### `DELETE /group/:id` — Hard delete.

---

## Student-Group Endpoints `/student-group`

Manages student ↔ group assignments.

### `POST /student-group`

| Field | Type | Required | Validation |
|---|---|---|---|
| `student_id` | string (UUID) | Yes | `@IsUUID()` |
| `group_id` | string (UUID) | Yes | `@IsUUID()` |

**Business rule:** A student cannot belong to two groups with the same `key` (enforced in service layer).

**Errors:**
| Status | Condition |
|---|---|
| `400 Bad Request` | Group does not exist |
| `409 Conflict` | Student already in a group with same key, or exact duplicate assignment |

**Response `201`:** StudentGroup record with nested `student` and `group` objects.

### `GET /student-group` — Returns all assignments with nested student and group.
### `GET /student-group/:id` — Returns one, `404` if missing.
### `PATCH /student-group/:id` — Updates, re-checks key-conflict constraint.
### `DELETE /student-group/:id` — Hard delete.

---

## Response Entity Schemas

### `AdminEntity`
| Field | Type | Notes |
|---|---|---|
| `id` | string (UUID) | |
| `name` | string | |
| `email` | string | |
| `username` | string | |
| `created_at` | ISO 8601 | |
| `updated_at` | ISO 8601 | |
| `deleted_at` | ISO 8601 \| null | |
| `password_hash` | — | **Excluded from response** |
| `hashed_refresh_token` | — | **Excluded from response** |

### `TeamEntity`
| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `auction_id` | string | |
| `name` | string | |
| `username` | string | |
| `total_budget` | number | Transformed from Prisma `Decimal` |
| `status` | `TeamStatus` | |
| `created_at` / `updated_at` / `deleted_at` | date | |
| `password_hash` / `hashed_refresh_token` | — | **Excluded** |

### `AuctionEntity`
| Field | Type |
|---|---|
| `id` | string |
| `created_by` | string |
| `name` | string |
| `auction_type` | `ENGLISH` \| `DRAFT` |
| `status` | `AuctionStatus` |
| `started_at` | date \| null |
| `ended_at` | date \| null |
| `created_at` / `updated_at` / `deleted_at` | date |

### `StudentEntity`
| Field | Type |
|---|---|
| `id` | string |
| `name` | string |
| `reg_no` | string |
| `is_active` | boolean |
| `created_at` / `updated_at` / `deleted_at` | date |
