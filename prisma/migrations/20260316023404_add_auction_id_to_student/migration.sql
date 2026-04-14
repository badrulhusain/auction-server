/*
  Warnings:

  - The values [DEFAULT] on the enum `SessionRule` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `round_number` on the `draft_picks` table. All the data in the column will be lost.
  - You are about to drop the column `turn_number` on the `draft_picks` table. All the data in the column will be lost.
  - You are about to drop the `draft_turn_order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[draft_turn_id]` on the table `draft_picks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[auction_id,reg_no]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `draft_round_id` to the `draft_picks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `draft_turn_id` to the `draft_picks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auction_id` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SessionRule_new" AS ENUM ('SEQUENTIAL', 'REVERSE', 'SNAKE', 'ROTATING', 'CUSTOM');
ALTER TABLE "public"."auction_sessions" ALTER COLUMN "rule" DROP DEFAULT;
ALTER TABLE "auction_sessions" ALTER COLUMN "rule" TYPE "SessionRule_new" USING ("rule"::text::"SessionRule_new");
ALTER TYPE "SessionRule" RENAME TO "SessionRule_old";
ALTER TYPE "SessionRule_new" RENAME TO "SessionRule";
DROP TYPE "public"."SessionRule_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "auctions" DROP CONSTRAINT "auctions_created_by_fkey";

-- DropForeignKey
ALTER TABLE "draft_turn_order" DROP CONSTRAINT "draft_turn_order_auction_session_id_fkey";

-- DropForeignKey
ALTER TABLE "draft_turn_order" DROP CONSTRAINT "draft_turn_order_team_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_team_id_fkey";

-- DropIndex
DROP INDEX "draft_picks_auction_session_id_round_number_turn_number_key";

-- DropIndex
DROP INDEX "students_reg_no_key";

-- AlterTable
ALTER TABLE "auction_items" ADD COLUMN     "current_highest_bid" DECIMAL(12,2),
ADD COLUMN     "current_highest_team_id" TEXT;

-- AlterTable
ALTER TABLE "auction_sessions" ALTER COLUMN "rule" DROP DEFAULT;

-- AlterTable
ALTER TABLE "draft_picks" DROP COLUMN "round_number",
DROP COLUMN "turn_number",
ADD COLUMN     "draft_round_id" TEXT NOT NULL,
ADD COLUMN     "draft_turn_id" TEXT NOT NULL,
ALTER COLUMN "student_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "auction_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "team_budget_history" ADD COLUMN     "auction_session_id" TEXT;

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "hashed_refresh_token" VARCHAR;

-- DropTable
DROP TABLE "draft_turn_order";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "username" VARCHAR NOT NULL,
    "password_hash" VARCHAR NOT NULL,
    "team_id" TEXT,
    "hashed_refresh_token" VARCHAR,
    "reset_token" VARCHAR,
    "reset_token_expiry" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draft_rounds" (
    "id" TEXT NOT NULL,
    "auction_session_id" TEXT NOT NULL,
    "round_index" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draft_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draft_turns" (
    "id" TEXT NOT NULL,
    "draft_round_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "turn_index" INTEGER NOT NULL,
    "status" "DraftTurnStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draft_turns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE INDEX "admins_team_id_idx" ON "admins"("team_id");

-- CreateIndex
CREATE INDEX "draft_rounds_auction_session_id_idx" ON "draft_rounds"("auction_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "draft_rounds_auction_session_id_round_index_key" ON "draft_rounds"("auction_session_id", "round_index");

-- CreateIndex
CREATE INDEX "draft_turns_draft_round_id_idx" ON "draft_turns"("draft_round_id");

-- CreateIndex
CREATE INDEX "draft_turns_team_id_idx" ON "draft_turns"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "draft_turns_draft_round_id_turn_index_key" ON "draft_turns"("draft_round_id", "turn_index");

-- CreateIndex
CREATE INDEX "auction_items_current_highest_team_id_idx" ON "auction_items"("current_highest_team_id");

-- CreateIndex
CREATE UNIQUE INDEX "draft_picks_draft_turn_id_key" ON "draft_picks"("draft_turn_id");

-- CreateIndex
CREATE INDEX "draft_picks_draft_round_id_idx" ON "draft_picks"("draft_round_id");

-- CreateIndex
CREATE INDEX "students_auction_id_idx" ON "students"("auction_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_auction_id_reg_no_key" ON "students"("auction_id", "reg_no");

-- CreateIndex
CREATE INDEX "team_budget_history_auction_session_id_idx" ON "team_budget_history"("auction_session_id");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_items" ADD CONSTRAINT "auction_items_current_highest_team_id_fkey" FOREIGN KEY ("current_highest_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_budget_history" ADD CONSTRAINT "team_budget_history_auction_session_id_fkey" FOREIGN KEY ("auction_session_id") REFERENCES "auction_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_rounds" ADD CONSTRAINT "draft_rounds_auction_session_id_fkey" FOREIGN KEY ("auction_session_id") REFERENCES "auction_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_turns" ADD CONSTRAINT "draft_turns_draft_round_id_fkey" FOREIGN KEY ("draft_round_id") REFERENCES "draft_rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_turns" ADD CONSTRAINT "draft_turns_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_draft_round_id_fkey" FOREIGN KEY ("draft_round_id") REFERENCES "draft_rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_draft_turn_id_fkey" FOREIGN KEY ("draft_turn_id") REFERENCES "draft_turns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
