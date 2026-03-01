# Overview

## Purpose

This is the backend API for a **real-time auction bidding system** designed to manage structured auction events. The system supports two distinct auction formats — **English auctions** (live competitive bidding) and **Draft auctions** (sequential, turn-based player selection) — and is built around the domain of student/candidate placement where teams bid to acquire students.

The intended use case, as revealed by the data model and seed data, is a **college or organizational event** where teams compete to draft or bid on students/candidates across multiple structured sessions.

---

## Core Capabilities

| Capability | Description |
|---|---|
| **Dual Auction Types** | Supports `ENGLISH` (competitive bidding with hike increments) and `DRAFT` (turn-order-based selection) auction formats |
| **Multi-Session Auctions** | Each auction is divided into `AuctionSessions`, each scoped to a `Group` (category/department) |
| **Team Management** | Teams are registered per-auction with initial budgets; their budget changes are tracked as immutable ledger entries |
| **Student/Candidate Catalog** | Students are registered globally and assigned to `Groups` (e.g., Department = Computer Science) |
| **Bid Management** | Bids are recorded in `BidHistory` with lifecycle statuses (`ACTIVE`, `OUTBID`, `WINNING`, `REJECTED`) |
| **Sale Recording** | Completed auction items produce `Sale` records linking the winning bid, team, and final price |
| **Financial Audit Trail** | `TeamBudgetHistory` maintains an immutable ledger of every budget change per team |
| **Draft Turn Ordering** | `DraftTurnOrder` defines the round-by-round pick order for Draft auctions |
| **JWT Authentication** | Separate auth flows for Admins and Teams, each with short-lived access tokens and long-lived refresh tokens stored server-side (hashed) |
| **Role-Based Access** | `ADMIN` and `TEAM` roles enforced via JWT payload + `RolesGuard` |

---

## Key Design Goals

1. **Separation of Auction Types**: The schema cleanly separates English-auction-specific fields (e.g., `hike`, `max_time_per_candidate`, `BidHistory`, `Sale`) from Draft-specific structures (`DraftTurnOrder`, `DraftPick`), though both share the `AuctionSession` and `AuctionItem` shells.

2. **Immutable Financial Ledger**: Budget mutations are never in-place — every change to a team's budget produces a new `TeamBudgetHistory` row, providing a complete audit trail.

3. **Data Integrity by Constraint**: Critical uniqueness rules (one student per session, one pick per turn slot, one sale per item) are enforced at the database level via Prisma unique constraints, not just application logic.

4. **Secure Credential Handling**: Passwords and refresh tokens are bcrypt-hashed. Sensitive fields (`password_hash`, `hashed_refresh_token`) are excluded from API responses via `class-transformer`'s `@Exclude()` combined with NestJS's `ClassSerializerInterceptor`.

5. **Neon/Serverless-Optimized**: The Prisma client uses the `@prisma/adapter-neon` driver adapter with WebSocket support, designed for Neon's serverless PostgreSQL offering.

---

## High-Level System Summary

```
Client (Admin UI / Team Client)
        │
        ▼
  NestJS REST API (Render)
        │
        ├── Auth Module      → JWT + Passport (Local + JWT strategies)
        ├── Admin Module     → Admin CRUD
        ├── Team Module      → Team CRUD per auction
        ├── Auction Module   → Auction + Session + Item management
        ├── Student Module   → Candidate catalog
        ├── Group Module     → Category/tag system
        └── StudentGroup Module → Student ↔ Group assignments
        │
        ▼
  Prisma ORM (with Neon driver adapter)
        │
        ▼
  PostgreSQL (Neon serverless)
```

The API is a **single-process NestJS application** running on Render. There is no message bus, no WebSocket layer at the NestJS level, and no background job queue present in the current codebase. Real-time behavior (if any) is assumed to be handled at the client or infrastructure level.

> **Note:** Swagger/OpenAPI is listed in the project goals but **no `@nestjs/swagger` setup exists in the current source code** (`main.ts` or any module). The API does include a Postman collection for manual testing. See the [Swagger document](./swagger.md) for details.
