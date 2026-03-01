/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AuctionType" AS ENUM ('ENGLISH', 'DRAFT');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AuctionSessionStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SessionRule" AS ENUM ('DEFAULT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AuctionItemStatus" AS ENUM ('PENDING', 'ACTIVE', 'SOLD', 'UNSOLD');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('ACTIVE', 'OUTBID', 'WINNING', 'REJECTED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INITIAL', 'INCREASE', 'DECREASE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "DraftTurnStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'SKIPPED');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "username" VARCHAR NOT NULL,
    "password_hash" VARCHAR NOT NULL,
    "team_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auctions" (
    "id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,
    "auction_type" "AuctionType" NOT NULL,
    "status" "AuctionStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "auctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,
    "username" VARCHAR NOT NULL,
    "password_hash" VARCHAR NOT NULL,
    "total_budget" DECIMAL(12,2) NOT NULL,
    "status" "TeamStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,
    "reg_no" VARCHAR NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "key" VARCHAR NOT NULL,
    "value" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_groups" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_sessions" (
    "id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,
    "session_number" INTEGER NOT NULL,
    "status" "AuctionSessionStatus" NOT NULL DEFAULT 'PENDING',
    "rule" "SessionRule" DEFAULT 'DEFAULT',
    "custom_rule" TEXT,
    "hike" DECIMAL(12,2),
    "max_time_per_candidate" INTEGER,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "auction_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_items" (
    "id" TEXT NOT NULL,
    "auction_session_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "base_price" DECIMAL(12,2) NOT NULL,
    "item_order" INTEGER NOT NULL,
    "status" "AuctionItemStatus" NOT NULL DEFAULT 'PENDING',
    "activated_at" TIMESTAMP(3),
    "deactivated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "auction_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bid_history" (
    "id" TEXT NOT NULL,
    "auction_item_id" TEXT NOT NULL,
    "auction_session_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "bid_amount" DECIMAL(12,2) NOT NULL,
    "status" "BidStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bid_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "auction_item_id" TEXT NOT NULL,
    "winning_bid_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "final_price" DECIMAL(12,2) NOT NULL,
    "sold_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_budget_history" (
    "id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "previous_budget" DECIMAL(12,2) NOT NULL,
    "current_budget" DECIMAL(12,2) NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "notes" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_budget_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draft_turn_order" (
    "id" TEXT NOT NULL,
    "auction_session_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "round_number" INTEGER NOT NULL,
    "initial_turn_number" INTEGER NOT NULL,
    "status" "DraftTurnStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draft_turn_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draft_picks" (
    "id" TEXT NOT NULL,
    "auction_session_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "round_number" INTEGER NOT NULL,
    "turn_number" INTEGER NOT NULL,
    "picked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draft_picks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_team_id_idx" ON "users"("team_id");

-- CreateIndex
CREATE INDEX "auctions_created_by_idx" ON "auctions"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "teams_username_key" ON "teams"("username");

-- CreateIndex
CREATE INDEX "teams_auction_id_idx" ON "teams"("auction_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_reg_no_key" ON "students"("reg_no");

-- CreateIndex
CREATE UNIQUE INDEX "groups_key_value_key" ON "groups"("key", "value");

-- CreateIndex
CREATE INDEX "student_groups_student_id_idx" ON "student_groups"("student_id");

-- CreateIndex
CREATE INDEX "student_groups_group_id_idx" ON "student_groups"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_groups_student_id_group_id_key" ON "student_groups"("student_id", "group_id");

-- CreateIndex
CREATE INDEX "auction_sessions_auction_id_idx" ON "auction_sessions"("auction_id");

-- CreateIndex
CREATE INDEX "auction_sessions_group_id_idx" ON "auction_sessions"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "auction_sessions_auction_id_session_number_key" ON "auction_sessions"("auction_id", "session_number");

-- CreateIndex
CREATE INDEX "auction_items_auction_session_id_idx" ON "auction_items"("auction_session_id");

-- CreateIndex
CREATE INDEX "auction_items_student_id_idx" ON "auction_items"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "auction_items_auction_session_id_item_order_key" ON "auction_items"("auction_session_id", "item_order");

-- CreateIndex
CREATE UNIQUE INDEX "auction_items_auction_session_id_student_id_key" ON "auction_items"("auction_session_id", "student_id");

-- CreateIndex
CREATE INDEX "bid_history_auction_item_id_idx" ON "bid_history"("auction_item_id");

-- CreateIndex
CREATE INDEX "bid_history_auction_session_id_idx" ON "bid_history"("auction_session_id");

-- CreateIndex
CREATE INDEX "bid_history_team_id_idx" ON "bid_history"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "sales_auction_item_id_key" ON "sales"("auction_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "sales_winning_bid_id_key" ON "sales"("winning_bid_id");

-- CreateIndex
CREATE INDEX "sales_auction_item_id_idx" ON "sales"("auction_item_id");

-- CreateIndex
CREATE INDEX "sales_winning_bid_id_idx" ON "sales"("winning_bid_id");

-- CreateIndex
CREATE INDEX "sales_team_id_idx" ON "sales"("team_id");

-- CreateIndex
CREATE INDEX "team_budget_history_auction_id_idx" ON "team_budget_history"("auction_id");

-- CreateIndex
CREATE INDEX "team_budget_history_team_id_idx" ON "team_budget_history"("team_id");

-- CreateIndex
CREATE INDEX "draft_turn_order_auction_session_id_idx" ON "draft_turn_order"("auction_session_id");

-- CreateIndex
CREATE INDEX "draft_turn_order_team_id_idx" ON "draft_turn_order"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "draft_turn_order_auction_session_id_round_number_initial_tu_key" ON "draft_turn_order"("auction_session_id", "round_number", "initial_turn_number");

-- CreateIndex
CREATE INDEX "draft_picks_auction_session_id_idx" ON "draft_picks"("auction_session_id");

-- CreateIndex
CREATE INDEX "draft_picks_team_id_idx" ON "draft_picks"("team_id");

-- CreateIndex
CREATE INDEX "draft_picks_student_id_idx" ON "draft_picks"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "draft_picks_auction_session_id_student_id_key" ON "draft_picks"("auction_session_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "draft_picks_auction_session_id_round_number_turn_number_key" ON "draft_picks"("auction_session_id", "round_number", "turn_number");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_groups" ADD CONSTRAINT "student_groups_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_groups" ADD CONSTRAINT "student_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_sessions" ADD CONSTRAINT "auction_sessions_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_sessions" ADD CONSTRAINT "auction_sessions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_items" ADD CONSTRAINT "auction_items_auction_session_id_fkey" FOREIGN KEY ("auction_session_id") REFERENCES "auction_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_items" ADD CONSTRAINT "auction_items_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bid_history" ADD CONSTRAINT "bid_history_auction_item_id_fkey" FOREIGN KEY ("auction_item_id") REFERENCES "auction_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bid_history" ADD CONSTRAINT "bid_history_auction_session_id_fkey" FOREIGN KEY ("auction_session_id") REFERENCES "auction_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bid_history" ADD CONSTRAINT "bid_history_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_auction_item_id_fkey" FOREIGN KEY ("auction_item_id") REFERENCES "auction_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_winning_bid_id_fkey" FOREIGN KEY ("winning_bid_id") REFERENCES "bid_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_budget_history" ADD CONSTRAINT "team_budget_history_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_budget_history" ADD CONSTRAINT "team_budget_history_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_turn_order" ADD CONSTRAINT "draft_turn_order_auction_session_id_fkey" FOREIGN KEY ("auction_session_id") REFERENCES "auction_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_turn_order" ADD CONSTRAINT "draft_turn_order_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_auction_session_id_fkey" FOREIGN KEY ("auction_session_id") REFERENCES "auction_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
