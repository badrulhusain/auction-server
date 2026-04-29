# Auction API

A production-ready REST + WebSocket API for running multi-format auctions — English bidding auctions and turn-based draft auctions — built with NestJS, Prisma, and PostgreSQL on a serverless Neon database.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Real-Time Draft Events](#real-time-draft-events)
- [Authentication](#authentication)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)

---

## Overview

The Auction API is the backend service powering a platform where admins can create and manage auction events. Each auction supports two modes:

- **English Auction** — Teams place competitive bids on students (candidates). The highest bid at the end of a session wins.
- **Draft Auction** — Teams take structured turns to select students in a round-robin fashion, supporting configurable pick orders (Sequential, Snake, Reverse, Rotating, Custom).

The system handles full auction lifecycle management: from creating the auction event and sessions, registering participants, running live bidding/drafting, and recording a complete financial audit trail.

---

## Features

- **Dual Auction Modes** — English bidding and Draft pick systems with independent business logic
- **Role-Based Authentication** — Separate JWT-secured auth flows for `ADMIN` and `TEAM` roles
- **Real-Time WebSocket Gateway** — Live draft state broadcasting via Socket.io namespaced connections
- **Multi-Tenancy** — All entities are scoped to an `auction_id`, allowing multiple independent auction events to coexist
- **Flexible Draft Rules** — Configurable pick orders: `SEQUENTIAL`, `REVERSE`, `SNAKE`, `ROTATING`, or `CUSTOM`
- **Financial Audit Log** — Immutable `TeamBudgetHistory` ledger tracking every budget change per team
- **Session & Group Management** — Auction sessions are tied to student groups, enabling segmented bidding/drafting rounds
- **Password Reset Flow** — Secure token-based password reset with email delivery via Resend
- **Swagger UI** — Auto-generated interactive API documentation at `/api`
- **Request Validation** — Global `ValidationPipe` with DTO-level validation using `class-validator`
- **Serialization** — Response shaping via `ClassSerializerInterceptor` and entity transformers

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 (TypeScript) |
| ORM | Prisma 7 |
| Database | PostgreSQL via Neon (serverless) |
| Real-Time | Socket.io + NestJS WebSockets |
| Authentication | Passport.js + JWT (access + refresh tokens) |
| Password Hashing | bcrypt |
| Email | Resend / Nodemailer |
| API Docs | Swagger / OpenAPI |
| Validation | class-validator + class-transformer |
| Scheduling | @nestjs/schedule |
| Runtime | Node.js |

---

## Architecture

The codebase follows NestJS's modular architecture. Each domain is a self-contained module with its own controller, service, and DTOs:

```
src/
├── auth/           # JWT strategy, Passport guards, login/register/password-reset
├── auction/        # Auction events and session management
├── draft/          # Draft turn engine + WebSocket gateway
├── team/           # Team CRUD and budget management
├── student/        # Student (candidate) registration
├── group/          # Group/category definitions
├── student-group/  # Student ↔ Group membership
├── admin/          # Admin user management
├── prisma/         # Singleton PrismaService module
└── infrastructure/
    └── email/      # Email abstraction (Resend + Nodemailer)
```

### Request Flow

```
HTTP Request
    │
    ▼
JWT Guard (validates access token)
    │
    ▼
Role Guard (ADMIN / TEAM)
    │
    ▼
Controller → Service → PrismaService → Neon PostgreSQL
    │
    ▼
Entity Transformer (strips sensitive fields)
    │
    ▼
JSON Response
```

### Draft WebSocket Flow

```
Client connects to ws://<host>/draft
    │
    ├─ emit join_session { sessionId }  →  Server joins room, emits current state
    │
    ├─ POST /draft/sessions/:id/start   →  Server broadcasts draft_state to room
    │
    └─ POST /draft/turns/:id/pick       →  Server broadcasts draft_state + draft_summary to room
```

---

## Database Schema

The schema supports both auction types through shared entities plus mode-specific tables.

### Core Entities

| Model | Description |
|---|---|
| `Admin` | Auction organizers with full management access |
| `Auction` | Top-level event (type: `ENGLISH` or `DRAFT`) |
| `Team` | Participating teams, each with a budget and credentials |
| `Student` | Candidates available to be auctioned or drafted |
| `Group` | Metadata tags/categories (e.g., `role: frontend`) |
| `StudentGroup` | Many-to-many join between students and groups |
| `AuctionSession` | A sub-round within an auction, linked to a group |

### English Auction Tables

| Model | Description |
|---|---|
| `AuctionItem` | A student presented for bidding within a session |
| `BidHistory` | Every bid placed, with status (`ACTIVE`, `OUTBID`, `WINNING`) |
| `Sale` | Immutable record of a completed transaction |

### Draft Auction Tables

| Model | Description |
|---|---|
| `DraftRound` | A full cycle of picks (all teams pick once) |
| `DraftTurn` | A single team's pick slot within a round |
| `DraftPick` | The student selected during a turn |

### Financial Audit

| Model | Description |
|---|---|
| `TeamBudgetHistory` | Append-only ledger of budget changes (`INITIAL`, `INCREASE`, `DECREASE`, `ADJUSTMENT`) |

### Entity Relationship Summary

```
Auction
 ├── Teams (many)
 ├── Students (many)
 ├── Groups (many)
 └── AuctionSessions (many)
      ├── [English] AuctionItems → BidHistory → Sale
      └── [Draft]   DraftRounds → DraftTurns → DraftPicks
```

---

## API Reference

Interactive documentation is available at `http://localhost:3000/api` (Swagger UI) when the server is running.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/admin/register` | Register a new admin |
| `POST` | `/auth/admin/login` | Admin login → returns `access_token` + sets `admin_refresh_token` cookie |
| `POST` | `/auth/admin/logout` | Clears refresh token |
| `POST` | `/auth/admin/forgot-password` | Sends password reset email |
| `POST` | `/auth/admin/reset-password` | Resets password using token |
| `POST` | `/auth/team/register` | Register a new team |
| `POST` | `/auth/team/login` | Team login → returns `access_token` + sets `team_refresh_token` cookie |
| `POST` | `/auth/team/logout` | Clears refresh token |

### Auctions

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auction` | Create a new auction |
| `GET` | `/auction` | List all auctions |
| `GET` | `/auction/:id` | Get auction with teams, sessions, and items |
| `PATCH` | `/auction/:id` | Update auction |
| `DELETE` | `/auction/:id` | Delete auction |
| `POST` | `/auction/:id/session` | Create a session within an auction |
| `GET` | `/auction/:id/session` | List sessions for an auction |
| `GET` | `/auction/session/:sessionId` | Get a specific session |
| `PATCH` | `/auction/session/:sessionId` | Update session |
| `POST` | `/auction/session/:sessionId/item` | Add an item (student) to a session |

### Draft

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/draft/sessions/:sessionId/start` | Initialize round 1 and activate the first turn |
| `GET` | `/draft/sessions/:sessionId/state` | Get current round and active turn |
| `GET` | `/draft/sessions/:sessionId/summary` | Get full pick history for the session |
| `POST` | `/draft/turns/:turnId/pick` | Submit a pick for the active turn |

### Teams

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/team` | Create a team |
| `GET` | `/team` | List all teams |
| `GET` | `/team/:id` | Get a team |
| `PATCH` | `/team/:id` | Update team |
| `DELETE` | `/team/:id` | Delete team |

### Students

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/student` | Register a student |
| `GET` | `/student` | List all students |
| `GET` | `/student/:id` | Get a student |
| `PATCH` | `/student/:id` | Update student |
| `DELETE` | `/student/:id` | Delete student |

### Groups & Assignments

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/group` | Create a group |
| `GET` | `/group` | List groups |
| `POST` | `/student-group` | Assign a student to a group |
| `DELETE` | `/student-group/:id` | Remove a student from a group |

---

## Real-Time Draft Events

Connect to the WebSocket namespace: `ws://<host>/draft`

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join_session` | `{ sessionId: string }` | Join a session room; receives current state immediately |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `draft_state` | `{ sessionStatus, currentRound, activeTurn }` | Broadcast after any pick or draft start |
| `draft_summary` | `{ picks: Pick[] }` | Full pick history after each selection |
| `error` | `{ message: string }` | Error notification |

---

## Authentication

The API uses a dual-token strategy:

- **Access Token** — Short-lived (15 minutes), sent as a `Bearer` token in the `Authorization` header
- **Refresh Token** — Long-lived (7 days), stored as an HTTP-only, `SameSite=Strict` cookie; hashed in the database

Both `ADMIN` and `TEAM` roles follow the same token lifecycle but use separate cookie keys and login endpoints. Role information is embedded in the JWT payload and enforced by `RolesGuard`.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (Neon recommended — configure the connection string in `.env`)

### Installation

```bash
git clone <repo-url>
cd auction-server
npm install
```

### Database Setup

```bash
# Push the Prisma schema to your database
npx prisma db push

# (Optional) Run seed data
npx ts-node prisma/seed.ts
```

### Running

```bash
# Development (ts-node, live reload)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The server starts on port `3000` by default (or the `PORT` environment variable on hosted platforms like Render).

Swagger UI is available at: `http://localhost:3000/api`

---

## Environment Variables

Create a `.env` file at the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# JWT Secrets
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Email (Resend)
RESEND_API_KEY="re_..."

# App
NODE_ENV="development"
PORT=3000
```

---

## Project Structure

```
auction-server/
├── prisma/
│   ├── schema.prisma       # Full database schema
│   └── seed.ts             # Seed script
├── src/
│   ├── main.ts             # Bootstrap: Swagger, ValidationPipe, CORS
│   ├── app.module.ts       # Root module composition
│   ├── auth/               # Authentication (JWT, Passport, guards)
│   ├── auction/            # Auction + session + item management
│   ├── draft/              # Draft engine + Socket.io gateway
│   ├── team/               # Team management
│   ├── student/            # Student management
│   ├── group/              # Group (category) management
│   ├── student-group/      # Student ↔ Group membership
│   ├── admin/              # Admin user management
│   ├── prisma/             # PrismaService singleton
│   └── infrastructure/
│       └── email/          # Email service abstraction (Resend)
├── docs/                   # Extended documentation
├── package.json
└── tsconfig.json
```
