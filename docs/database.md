# Database

The database is **PostgreSQL**, hosted on [Neon](https://neon.tech) (serverless). The schema is managed with **Prisma ORM** and is defined in `prisma/schema.prisma`.

---

## Enumerations

| Enum | Values | Used On |
|---|---|---|
| `AuctionType` | `ENGLISH`, `DRAFT` | `Auction.auction_type` |
| `AuctionStatus` | `PENDING`, `ACTIVE`, `COMPLETED`, `CANCELLED` | `Auction.status` |
| `AuctionSessionStatus` | `PENDING`, `ACTIVE`, `COMPLETED`, `CANCELLED` | `AuctionSession.status` |
| `SessionRule` | `DEFAULT`, `CUSTOM` | `AuctionSession.rule` (Draft only) |
| `AuctionItemStatus` | `PENDING`, `ACTIVE`, `SOLD`, `UNSOLD` | `AuctionItem.status` |
| `BidStatus` | `ACTIVE`, `OUTBID`, `WINNING`, `REJECTED` | `BidHistory.status` |
| `TeamStatus` | `ACTIVE`, `INACTIVE` | `Team.status` |
| `TransactionType` | `INITIAL`, `INCREASE`, `DECREASE`, `ADJUSTMENT` | `TeamBudgetHistory.transaction_type` |
| `DraftTurnStatus` | `PENDING`, `ACTIVE`, `COMPLETED`, `SKIPPED` | `DraftTurnOrder.status` |

---

## Models

### `admins`

Stores admin users who manage the auction system.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` (UUID) | PK, default `uuid()` | |
| `name` | `String` | VarChar | |
| `email` | `String` | VarChar, `@unique` | |
| `username` | `String` | VarChar, `@unique` | Used for login |
| `password_hash` | `String` | VarChar | bcrypt hash, 10 rounds |
| `hashed_refresh_token` | `String?` | VarChar, nullable | Cleared on logout |
| `created_at` | `DateTime` | default `now()` | |
| `updated_at` | `DateTime` | `@updatedAt` | |
| `deleted_at` | `DateTime?` | nullable | Soft-delete field (not enforced in queries) |

**Relations:** `auctions[]` (via `AuctionCreator`)

---

### `auctions`

Top-level auction event record.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` (UUID) | PK | |
| `created_by` | `String` | FK → `admins.id`, `onDelete: Restrict` | Indexed |
| `name` | `String` | VarChar | |
| `auction_type` | `AuctionType` | Enum | `ENGLISH` or `DRAFT` |
| `status` | `AuctionStatus` | Enum, default `PENDING` | |
| `started_at` | `DateTime?` | | |
| `ended_at` | `DateTime?` | | |
| `created_at` | `DateTime` | default `now()` | |
| `updated_at` | `DateTime` | `@updatedAt` | |
| `deleted_at` | `DateTime?` | | Soft-delete field |

**Relations:** `teams[]`, `auction_sessions[]`, `team_budget_histories[]`

---

### `teams`

Participating bidding entities, one per auction.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` (UUID) | PK | |
| `auction_id` | `String` | FK → `auctions.id`, `onDelete: Restrict` | Indexed |
| `name` | `String` | VarChar | Display name |
| `username` | `String` | VarChar, `@unique` | Unique globally, used for login |
| `password_hash` | `String` | VarChar | bcrypt hash |
| `total_budget` | `Decimal` | Decimal(12,2) | Current budget |
| `status` | `TeamStatus` | Enum, default `ACTIVE` | |
| `hashed_refresh_token` | `String?` | VarChar, nullable | Cleared on logout |
| `created_at` / `updated_at` / `deleted_at` | — | — | Standard audit fields |

**Relations:** `bid_histories[]`, `sales[]`, `team_budget_histories[]`, `draft_turn_orders[]`, `draft_picks[]`

> **Note:** `total_budget` is a live mutable field. An immutable full audit trail is kept in `TeamBudgetHistory`.

---

### `students`

Candidate pool available to be auctioned or drafted.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` (UUID) | PK | |
| `name` | `String` | VarChar | |
| `reg_no` | `String` | VarChar, `@unique` | Registration/roll number |
| `is_active` | `Boolean` | default `true` | Can be deactivated |
| `created_at` / `updated_at` / `deleted_at` | — | — | Audit fields |

**Relations:** `student_groups[]`, `auction_items[]`, `draft_picks[]`

---

### `groups`

Taxonomy/category tags. Used to scope auction sessions.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` (UUID) | PK | |
| `key` | `String` | VarChar | Category type (e.g., "Department") |
| `value` | `String` | VarChar | Category value (e.g., "Computer Science") |
| `created_at` / `updated_at` / `deleted_at` | — | — | Audit fields |

**Constraints:** `@@unique([key, value])` — no duplicate key-value pairs.

**Relations:** `student_groups[]`, `auction_sessions[]`

---

### `student_groups`

Many-to-many join table between `students` and `groups`.

| Column | Type | Constraints |
|---|---|---|
| `id` | `String` (UUID) | PK |
| `student_id` | `String` | FK → `students.id`, `onDelete: Cascade` |
| `group_id` | `String` | FK → `groups.id`, `onDelete: Cascade` |
| `created_at` | `DateTime` | |

**Constraints:**
- `@@unique([student_id, group_id])` — prevents duplicate assignments
- Indexed on both `student_id` and `group_id`

**Application-level constraint:** A student may not be assigned to two groups with the same `key`. Enforced in `StudentGroupService.create()` with a pre-check query.

---

### `auction_sessions`

Sub-rounds of an auction, each associated with a category group.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `auction_id` | FK → `auctions.id` | Indexed |
| `group_id` | FK → `groups.id` | Indexed |
| `name` | VarChar | |
| `session_number` | Int | Sequential identifier |
| `status` | `AuctionSessionStatus` | default `PENDING` |
| `rule` | `SessionRule?` | Draft only; `DEFAULT` or `CUSTOM` |
| `custom_rule` | `Text?` | Draft only; free-text rule |
| `hike` | `Decimal(12,2)?` | English only; minimum bid increment |
| `max_time_per_candidate` | `Int?` | English only; seconds per item |
| `started_at` / `ended_at` | `DateTime?` | |
| `created_at` / `updated_at` / `deleted_at` | — | Audit fields |

**Constraints:** `@@unique([auction_id, session_number])` — no duplicate session numbers per auction.

---

### `auction_items` *(English Auction)*

An instance of a student presented for bidding in a session.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `auction_session_id` | FK → `auction_sessions.id` | Indexed |
| `student_id` | FK → `students.id` | Indexed |
| `base_price` | `Decimal(12,2)` | Floor price |
| `item_order` | Int | Bidding sequence |
| `status` | `AuctionItemStatus` | default `PENDING` |
| `activated_at` / `deactivated_at` | `DateTime?` | Lifecycle timestamps |
| `created_at` / `updated_at` / `deleted_at` | — | Audit fields |

**Constraints:**
- `@@unique([auction_session_id, item_order])` — no duplicate order positions per session
- `@@unique([auction_session_id, student_id])` — a student appears only once per session

---

### `bid_history` *(English Auction)*

Records every bid placed on an auction item.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `auction_item_id` | FK → `auction_items.id` | Indexed |
| `auction_session_id` | FK → `auction_sessions.id` | Indexed |
| `team_id` | FK → `teams.id` | Indexed |
| `bid_amount` | `Decimal(12,2)` | |
| `status` | `BidStatus` | default `ACTIVE` |
| `created_at` / `updated_at` | — | |

---

### `sales` *(English Auction)*

Final resolution record for a sold auction item.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `auction_item_id` | String | `@unique` | One sale per item |
| `winning_bid_id` | String | `@unique` | One sale per winning bid |
| `team_id` | FK → `teams.id` | Indexed | |
| `final_price` | `Decimal(12,2)` | | |
| `sold_at` | `DateTime` | default `now()` | |
| `created_at` / `updated_at` | — | | |

---

### `team_budget_history`

Immutable financial audit ledger for team budgets.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `auction_id` | FK → `auctions.id` | Indexed |
| `team_id` | FK → `teams.id` | Indexed |
| `previous_budget` | `Decimal(12,2)` | Budget before the change |
| `current_budget` | `Decimal(12,2)` | Budget after the change |
| `transaction_type` | `TransactionType` | `INITIAL`, `INCREASE`, `DECREASE`, `ADJUSTMENT` |
| `notes` | `String?` | Optional description |
| `created_at` | `DateTime` | No `updated_at` — records are immutable |

---

### `draft_turn_order` *(Draft Auction)*

Defines the structural picking schedule for a draft session.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `auction_session_id` | FK → `auction_sessions.id` | Indexed |
| `team_id` | FK → `teams.id` | Indexed |
| `round_number` | Int | |
| `initial_turn_number` | Int | Position within the round |
| `status` | `DraftTurnStatus` | default `PENDING` |
| `started_at` / `completed_at` | `DateTime?` | |
| `created_at` / `updated_at` | — | |

**Constraint:** `@@unique([auction_session_id, round_number, initial_turn_number])` — enforces no two teams share a turn slot.

---

### `draft_picks` *(Draft Auction)*

Records an actual pick made by a team during a draft session.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `auction_session_id` | FK → `auction_sessions.id` | |
| `team_id` | FK → `teams.id` | |
| `student_id` | FK → `students.id` | |
| `round_number` | Int | |
| `turn_number` | Int | |
| `picked_at` | `DateTime` | default `now()` |
| `created_at` / `updated_at` | — | |

**Constraints:**
- `@@unique([auction_session_id, student_id])` — a student can only be drafted once per session
- `@@unique([auction_session_id, round_number, turn_number])` — no two picks at identical slots

---

## Entity Relationship Summary

```
Admin ──creates──► Auction ──has──► AuctionSession ──has──► AuctionItem
                    │                                           │
                    ▼                                     BidHistory (many)
                  Team[] ──places──────────────────────────────┘
                    │                                           │
                    │                                        Sale (1:1)
                    │
                    ├──► DraftTurnOrder[] (Draft)
                    └──► DraftPick[] (Draft)

Student ──assigned to──► Group (via StudentGroup)
Student ──placed as──► AuctionItem (English) / DraftPick (Draft)
```

---

## Database Migrations

Three migrations have been applied:

| Migration | Name | Notes |
|---|---|---|
| `20260228051907` | `init` | Initial schema |
| `20260228063055` | `add_user_model` | Admin/Team auth models |
| `20260228085213` | `auction_schema` | Full auction schema |

Migration history is managed by Prisma (`migration_lock.toml` pins the provider to `postgresql`).

---

## Soft Deletes

Most models include a `deleted_at DateTime?` column. However, **soft-delete filtering is not implemented** in the current query layer — all `findMany`/`findUnique` calls do not filter on `deleted_at: null`. These fields exist as a design placeholder for future soft-delete implementation.
