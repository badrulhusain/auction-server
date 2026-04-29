-- ============================================================
-- RLS Migration: Enable Row Level Security on auction tables
-- Primary isolation boundary is auction_id.
-- All writes go through the NestJS service layer (service role key),
-- so policies here guard direct/anon client reads only.
-- ============================================================

-- -------------------------------------------------------
-- Indexes for every RLS-referenced column (avoids per-row scans)
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS students_auction_id_idx     ON students(auction_id);
CREATE INDEX IF NOT EXISTS teams_auction_id_idx        ON teams(auction_id);
CREATE INDEX IF NOT EXISTS groups_auction_id_idx       ON groups(auction_id);
CREATE INDEX IF NOT EXISTS auction_sessions_auction_id_idx ON auction_sessions(auction_id);
CREATE INDEX IF NOT EXISTS auction_items_session_id_idx    ON auction_items(auction_session_id);
CREATE INDEX IF NOT EXISTS bid_history_session_id_idx      ON bid_history(auction_session_id);
CREATE INDEX IF NOT EXISTS draft_picks_session_id_idx      ON draft_picks(auction_session_id);
CREATE INDEX IF NOT EXISTS team_budget_history_auction_id_idx ON team_budget_history(auction_id);

-- -------------------------------------------------------
-- Enable RLS
-- NOTE: admins table is excluded until admin-to-auction access model is decided.
-- -------------------------------------------------------
ALTER TABLE auctions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams                ENABLE ROW LEVEL SECURITY;
ALTER TABLE students             ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups               ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_history          ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_rounds         ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_turns          ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_picks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_budget_history  ENABLE ROW LEVEL SECURITY;

-- team_budget_history: append-only — no UPDATE or DELETE policies
ALTER TABLE team_budget_history FORCE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- auctions
-- Admins can read/write auctions they created.
-- Teams can read the auction they belong to.
-- -------------------------------------------------------
CREATE POLICY "admins_manage_own_auctions" ON auctions
    FOR ALL TO authenticated
    USING     (created_by = (SELECT auth.uid()))
    WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "teams_read_own_auction" ON auctions
    FOR SELECT TO authenticated
    USING (
        id = (SELECT auction_id FROM teams WHERE id = (SELECT auth.uid()))
    );

-- -------------------------------------------------------
-- teams: each authenticated team can read its own row.
-- -------------------------------------------------------
CREATE POLICY "team_read_self" ON teams
    FOR SELECT TO authenticated
    USING (id = (SELECT auth.uid()));

-- -------------------------------------------------------
-- students: teams can read students in their auction.
-- Use a subquery on auth.uid() to avoid per-row function calls.
-- -------------------------------------------------------
CREATE POLICY "teams_read_auction_students" ON students
    FOR SELECT TO authenticated
    USING (
        auction_id = (SELECT auction_id FROM teams WHERE id = (SELECT auth.uid()))
    );

-- -------------------------------------------------------
-- groups
-- -------------------------------------------------------
CREATE POLICY "teams_read_auction_groups" ON groups
    FOR SELECT TO authenticated
    USING (
        auction_id = (SELECT auction_id FROM teams WHERE id = (SELECT auth.uid()))
    );

-- -------------------------------------------------------
-- auction_sessions
-- -------------------------------------------------------
CREATE POLICY "teams_read_auction_sessions" ON auction_sessions
    FOR SELECT TO authenticated
    USING (
        auction_id = (SELECT auction_id FROM teams WHERE id = (SELECT auth.uid()))
    );

-- -------------------------------------------------------
-- auction_items
-- -------------------------------------------------------
CREATE POLICY "teams_read_session_items" ON auction_items
    FOR SELECT TO authenticated
    USING (
        auction_session_id IN (
            SELECT id FROM auction_sessions
            WHERE auction_id = (SELECT auction_id FROM teams WHERE id = (SELECT auth.uid()))
        )
    );

-- -------------------------------------------------------
-- bid_history
-- -------------------------------------------------------
CREATE POLICY "teams_read_session_bids" ON bid_history
    FOR SELECT TO authenticated
    USING (
        auction_session_id IN (
            SELECT id FROM auction_sessions
            WHERE auction_id = (SELECT auction_id FROM teams WHERE id = (SELECT auth.uid()))
        )
    );

-- -------------------------------------------------------
-- draft_rounds / draft_turns / draft_picks
-- -------------------------------------------------------
CREATE POLICY "teams_read_draft_rounds" ON draft_rounds
    FOR SELECT TO authenticated
    USING (
        auction_session_id IN (
            SELECT id FROM auction_sessions
            WHERE auction_id = (SELECT auction_id FROM teams WHERE id = (SELECT auth.uid()))
        )
    );

CREATE POLICY "teams_read_draft_turns" ON draft_turns
    FOR SELECT TO authenticated
    USING (
        draft_round_id IN (
            SELECT dr.id FROM draft_rounds dr
            JOIN auction_sessions s ON dr.auction_session_id = s.id
            WHERE s.auction_id = (SELECT auction_id FROM teams WHERE id = (SELECT auth.uid()))
        )
    );

CREATE POLICY "teams_read_draft_picks" ON draft_picks
    FOR SELECT TO authenticated
    USING (
        auction_session_id IN (
            SELECT id FROM auction_sessions
            WHERE auction_id = (SELECT auction_id FROM teams WHERE id = (SELECT auth.uid()))
        )
    );

-- -------------------------------------------------------
-- team_budget_history — read-only for owning team; NO write policies.
-- NestJS service role bypasses RLS for inserts.
-- -------------------------------------------------------
CREATE POLICY "team_read_own_budget_history" ON team_budget_history
    FOR SELECT TO authenticated
    USING (team_id = (SELECT auth.uid()));
