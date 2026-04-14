import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DraftTurnStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DraftService {
    constructor(private prisma: PrismaService) {}

    async getSummary(sessionId: string) {
        const session = await this.prisma.auctionSession.findUnique({
            where: { id: sessionId },
            include: {
                draft_rounds: {
                    include: {
                        draft_turns: {
                            include: {
                                team: true,
                                draft_picks: { include: { student: true } },
                            },
                            orderBy: { turn_index: 'asc' },
                        },
                        draft_picks: {
                            include: { student: true, team: true },
                        },
                    },
                    orderBy: { round_index: 'asc' },
                },
            },
        });

        if (!session) {
            throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }

        return session;
    }

    async startDraft(sessionId: string, auctionId: string) {
        const session = await this.prisma.auctionSession.findUnique({
            where: { id: sessionId },
            include: { draft_rounds: true },
        });

        if (!session) {
            throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }

        if (session.draft_rounds.length > 0) {
            throw new ConflictException('Draft has already been started for this session');
        }

        // Determine team order from session or fall back to auction teams
        let teamIds: string[];
        if (session.base_team_order && Array.isArray(session.base_team_order) && (session.base_team_order as string[]).length > 0) {
            teamIds = session.base_team_order as string[];
        } else {
            const teams = await this.prisma.team.findMany({
                where: { auction_id: auctionId },
                orderBy: { created_at: 'asc' },
            });
            teamIds = teams.map(t => t.id);
        }

        if (teamIds.length === 0) {
            throw new BadRequestException('No teams found for this auction');
        }

        // Count students in the session group to determine total rounds needed
        const studentCount = await this.prisma.studentGroup.count({
            where: { group_id: session.group_id },
        });

        const roundsNeeded = Math.max(1, Math.ceil(studentCount / teamIds.length));

        // Create round 1
        const round = await this.prisma.draftRound.create({
            data: {
                auction_session_id: sessionId,
                round_index: 1,
            },
        });

        // Create turns for round 1 — first turn is ACTIVE, rest are PENDING
        await this.prisma.draftTurn.createMany({
            data: teamIds.map((teamId, index) => ({
                draft_round_id: round.id,
                team_id: teamId,
                turn_index: index + 1,
                status: index === 0 ? DraftTurnStatus.ACTIVE : DraftTurnStatus.PENDING,
            })),
        });

        const firstTurn = await this.prisma.draftTurn.findFirst({
            where: { draft_round_id: round.id, turn_index: 1 },
        });

        return {
            current_turn_id: firstTurn?.id,
            round_id: round.id,
            round_index: round.round_index,
            total_teams: teamIds.length,
            estimated_rounds: roundsNeeded,
        };
    }
}
