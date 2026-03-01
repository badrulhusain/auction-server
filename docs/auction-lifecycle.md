# Auction Lifecycle

This document describes the complete flow for both supported auction formats: **English** and **Draft**.

---

## Overview of Auction Hierarchy

```
Auction  (top-level event)
 └── AuctionSession[]  (sub-rounds, scoped to a Group/category)
      └── AuctionItem[]  (students put up for bidding in this session)
           └── BidHistory[]  (bids placed on an item) [English only]
                └── Sale  (one per sold item, points at winning bid) [English only]

Team[]  (participants in the Auction)
 └── DraftTurnOrder[]  (pick order schedule per session/round) [Draft only]
 └── DraftPick[]  (actual picks made) [Draft only]
 └── TeamBudgetHistory[]  (immutable budget change ledger)
```

---

## Stage 1: Auction Creation

**Endpoint:** `POST /auction`

An admin creates the top-level auction event. Required fields:
- `created_by` — must be a valid Admin UUID (existence is pre-checked in `AuctionService.create()`)
- `name` — human-readable label (e.g., "2026 Annual Hiring Draft")
- `auction_type` — `ENGLISH` or `DRAFT`

The auction is created with `status: PENDING` by default. `started_at` and `ended_at` are optional and can be set at creation or via a `PATCH` update later.

> **Needs clarification:** Transitioning auction status (PENDING → ACTIVE → COMPLETED) is not automated by the backend. Status must be manually set via `PATCH /auction/:id`. There is no guard preventing illogical status transitions.

---

## Stage 2: Team Registration

**Endpoint:** `POST /team` or `POST /auth/team/register`

Teams are registered and linked to an auction. Each team receives:
- A `username` and `password` (hashed with bcrypt, salt rounds = 10)
- A `total_budget` (Decimal, 12,2 precision)
- `status: ACTIVE` by default

Two registration paths exist:
1. `POST /team` — creates a team via the team CRUD endpoint (accepts raw `password_hash` in body — **see note below**)
2. `POST /auth/team/register` — creates a team via the auth endpoint (accepts `password` and hashes it internally)

> **Important:** `CreateTeamDto` has a field called `password_hash` (not `password`), but `RegisterTeamDto` in `auth/dto/register.dto.ts` has a field called `password`. The `/team` endpoint therefore accepts a **pre-supplied string** in `password_hash` — which may or may not be a hash. The `/auth/team/register` path is the correct registration path that hashes the password before storage.

---

## Stage 3: Group and Student Setup

**Endpoint:** `POST /group`, `POST /student`, `POST /student-group`

Before sessions can be created, the admin must:

1. **Create Groups** — Groups are key-value taxonomies (e.g., `key: "Department"`, `value: "Computer Science"`). The `[key, value]` pair is unique. Groups tag students into categories used to scope auction sessions.

2. **Create Students** — Each student/candidate is registered with a `name` and unique `reg_no`.

3. **Assign Students to Groups** — `StudentGroup` records link students to groups. A student can belong to multiple groups, but only **one group per key** (e.g., one Department, one Year). This is enforced in `StudentGroupService.create()` with a pre-check query before the DB write.

---

## Stage 4: Session Creation

**Endpoint:** `POST /auction/:id/session`

Sessions are sub-rounds of an auction, each linked to a `Group`. This means a session implicitly applies to all students in that group.

Required fields:
- `group_id` — must reference an existing Group (pre-checked)
- `name`, `session_number` — the combination `[auction_id, session_number]` is unique in the DB

Optional, conditional fields:
- `hike` — minimum bid increment (English auction)
- `max_time_per_candidate` — time limit per item in seconds (English auction)
- `rule` — `DEFAULT` or `CUSTOM` (Draft auction)
- `custom_rule` — free-text rule description (Draft auction)

Sessions start with `status: PENDING`.

---

## Stage 5: Auction Item Registration

**Endpoint:** `POST /auction/session/:sessionId/item`

Individual students are placed on the auction block as `AuctionItem` records, linked to a session.

Required fields:
- `student_id` — must exist in the students table
- `base_price` — floor price for bidding
- `item_order` — determines presentation order within the session

Business rule enforced in `AuctionService.createItem()`:
> **Draft auctions cannot have items with status `SOLD` or `UNSOLD`.** This makes semantic sense — in a Draft, students are picked, not sold. The service throws `400 Bad Request` if this is attempted.

DB constraints ensure:
- A student can appear in a session only once: `@@unique([auction_session_id, student_id])`
- Item order is unique per session: `@@unique([auction_session_id, item_order])`

---

## Stage 6: English Auction — Live Bidding Flow

> This stage applies exclusively to auctions with `auction_type: ENGLISH`.

**Needs clarification:** The bid placement, bid validation, and winner determination logic (e.g., a `POST /auction/item/:itemId/bid` endpoint) is **not present in the current codebase**. The `BidHistory` and `Sale` models are fully designed in the schema, but the corresponding service and controller methods do not yet exist.

What the schema defines for English auctions:

**BidHistory lifecycle:**
```
Team places bid → BidHistory row created (status: ACTIVE)
  → If a higher bid arrives → previous bid becomes OUTBID
  → Winning bid at close → status: WINNING
  → Invalid bid → status: REJECTED
```

**Bid constraints (schema-level):**
- Bids are linked to `auction_item`, `auction_session`, and `team`
- `Sale` is 1:1 with `auction_item` (an item can only be sold once)
- `Sale` is 1:1 with `winning_bid` (a bid can only be registered as a sale once)

**Concurrent bid protection (schema-level):**
- The `Sale.auction_item_id @unique` constraint prevents two concurrent processes both recording a sale for the same item
- The actual "highest bid wins" logic and the bid amount validation against the `hike` increment would live in a future service method

---

## Stage 7: Draft Auction — Turn-Based Pick Flow

> This stage applies exclusively to auctions with `auction_type: DRAFT`.

**Needs clarification:** The `DraftTurnOrder` creation, turn advancement, and `DraftPick` recording endpoints are **not present in the current codebase**. The schema is complete, but the application layer for these operations does not yet exist.

What the schema defines for Draft auctions:

**Turn order structure:**
- `DraftTurnOrder` maps `(session, team, round_number, initial_turn_number)` to define pick slots
- The DB constraint `@@unique([auction_session_id, round_number, initial_turn_number])` ensures no two teams share a pick slot
- Each turn has a status: `PENDING` → `ACTIVE` → `COMPLETED` (or `SKIPPED`)

**Pick recording:**
- `DraftPick` records the actual selection: `(session, team, student, round_number, turn_number)`
- `@@unique([auction_session_id, student_id])` — a student cannot be drafted twice in the same session
- `@@unique([auction_session_id, round_number, turn_number])` — prevents two picks at the same slot

---

## Stage 8: Auction Completion

**Needs clarification:** There is no automated auction-closing mechanism. Session and auction status transitions (`PENDING → ACTIVE → COMPLETED`) must be performed manually via `PATCH` requests.

For English auctions, when an item is sold:
1. A `Sale` record is created pointing to the `AuctionItem`, the `winning_bid` (a `BidHistory` row), and the `Team`
2. `TeamBudgetHistory` should record the budget deduction (implementation pending)

The `TeamBudgetHistory` model defines `TransactionType`:
- `INITIAL` — budget assigned at team creation
- `INCREASE` — budget added (refund, manual adjustment)
- `DECREASE` — budget spent on a purchase/pick
- `ADJUSTMENT` — manual correction

---

## Summary State Machine

```
Auction Status: PENDING → ACTIVE → COMPLETED | CANCELLED
AuctionSession Status: PENDING → ACTIVE → COMPLETED | CANCELLED
AuctionItem Status: PENDING → ACTIVE → SOLD | UNSOLD
BidHistory Status: ACTIVE → OUTBID | WINNING | REJECTED
DraftTurnOrder Status: PENDING → ACTIVE → COMPLETED | SKIPPED
```

All status transitions are currently manual (no automated trigger logic in the backend).
