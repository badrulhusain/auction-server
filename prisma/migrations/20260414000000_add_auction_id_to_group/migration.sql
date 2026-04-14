-- Delete orphaned groups (they have no auction association yet)
-- Auction sessions referencing these groups will be deleted first via FK constraint
DELETE FROM "auction_sessions" WHERE "group_id" IN (SELECT "id" FROM "groups");
DELETE FROM "student_groups" WHERE "group_id" IN (SELECT "id" FROM "groups");
DELETE FROM "groups";

-- Drop old unique constraint
ALTER TABLE "groups" DROP CONSTRAINT IF EXISTS "groups_key_value_key";

-- Add auction_id column with FK
ALTER TABLE "groups" ADD COLUMN "auction_id" TEXT NOT NULL;

-- Add foreign key
ALTER TABLE "groups" ADD CONSTRAINT "groups_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add new unique constraint
ALTER TABLE "groups" ADD CONSTRAINT "groups_auction_id_key_value_key" UNIQUE ("auction_id", "key", "value");

-- Add index
CREATE INDEX "groups_auction_id_idx" ON "groups"("auction_id");
