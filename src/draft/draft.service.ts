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

        // Flatten all picks into a simple list for the frontend
        const picks: any[] = [];
        for (const round of session.draft_rounds) {
            for (const turn of round.draft_turns) {
                for (const pick of turn.draft_picks) {
                    picks.push({
                        id: pick.id,
                        teamId: turn.team_id,
                        team_id: turn.team_id,
                        teamName: turn.team.name,
                        team_name: turn.team.name,
                        studentId: pick.student_id,
                        student_id: pick.student_id,
                        studentName: pick.student?.name ?? null,
                        student_name: pick.student?.name ?? null,
                        round_index: round.round_index,
                        turn_index: turn.turn_index,
                        picked_at: pick.picked_at,
                    });
                }
            }
        }

        return { ...session, picks };
    }

    async getState(sessionId: string) {
        const session = await this.prisma.auctionSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }

        // Find the latest round that has an ACTIVE or PENDING turn
        const currentRound = await this.prisma.draftRound.findFirst({
            where: { auction_session_id: sessionId },
            orderBy: { round_index: 'desc' },
            include: {
                draft_turns: {
                    where: { status: DraftTurnStatus.ACTIVE },
                    include: { team: true },
                    take: 1,
                },
            },
        });

        const activeTurnRaw = currentRound?.draft_turns?.[0] ?? null;

        const activeTurn = activeTurnRaw
            ? {
                id: activeTurnRaw.id,
                turnId: activeTurnRaw.id,
                team_id: activeTurnRaw.team_id,
                teamId: activeTurnRaw.team_id,
                team_name: activeTurnRaw.team.name,
                teamName: activeTurnRaw.team.name,
                turn_index: activeTurnRaw.turn_index,
                status: activeTurnRaw.status,
            }
            : null;

        return {
            sessionStatus: session.status,
            currentRound: currentRound
                ? { id: currentRound.id, round_index: currentRound.round_index }
                : null,
            activeTurn,
            activeTurnId: activeTurn?.id ?? null,
            active_turn_id: activeTurn?.id ?? null,
        };
    }

    async makePick(turnId: string, studentId: string) {
        const turn = await this.prisma.draftTurn.findUnique({
            where: { id: turnId },
            include: { draft_round: true },
        });

        if (!turn) {
            throw new NotFoundException(`Turn with ID ${turnId} not found`);
        }
        if (turn.status !== DraftTurnStatus.ACTIVE) {
            throw new BadRequestException('This turn is not currently active');
        }

        const sessionId = turn.draft_round.auction_session_id;

        // Check student hasn't already been picked in this session
        const alreadyPicked = await this.prisma.draftPick.findFirst({
            where: { auction_session_id: sessionId, student_id: studentId },
        });
        if (alreadyPicked) {
            throw new ConflictException('This student has already been drafted in this session');
        }

        // Create the pick and complete the turn in a transaction
        const [pick] = await this.prisma.$transaction([
            this.prisma.draftPick.create({
                data: {
                    auction_session_id: sessionId,
                    team_id: turn.team_id,
                    student_id: studentId,
                    draft_round_id: turn.draft_round_id,
                    draft_turn_id: turnId,
                },
            }),
            this.prisma.draftTurn.update({
                where: { id: turnId },
                data: { status: DraftTurnStatus.COMPLETED, completed_at: new Date() },
            }),
        ]);

        // Activate the next turn in the same round
        const nextTurn = await this.prisma.draftTurn.findFirst({
            where: {
                draft_round_id: turn.draft_round_id,
                turn_index: turn.turn_index + 1,
                status: DraftTurnStatus.PENDING,
            },
        });

        if (nextTurn) {
            await this.prisma.draftTurn.update({
                where: { id: nextTurn.id },
                data: { status: DraftTurnStatus.ACTIVE, started_at: new Date() },
            });
            return { sessionId, pick, nextTurnId: nextTurn.id, roundComplete: false, draftComplete: false };
        }

        // Round complete — check if all students in the group have been picked
        const totalStudents = await this.prisma.studentGroup.count({
            where: { group_id: (await this.prisma.auctionSession.findUnique({ where: { id: sessionId } }))!.group_id },
        });
        const pickedCount = await this.prisma.draftPick.count({
            where: { auction_session_id: sessionId },
        });

        if (pickedCount >= totalStudents) {
            return { sessionId, pick, nextTurnId: null, roundComplete: true, draftComplete: true };
        }

        // Start the next round with the same team order
        const currentRoundIndex = turn.draft_round.round_index;
        const teamIds = await this.prisma.draftTurn
            .findMany({
                where: { draft_round_id: turn.draft_round_id },
                orderBy: { turn_index: 'asc' },
                select: { team_id: true },
            })
            .then(turns => turns.map(t => t.team_id));

        const newRound = await this.prisma.draftRound.create({
            data: {
                auction_session_id: sessionId,
                round_index: currentRoundIndex + 1,
            },
        });

        await this.prisma.draftTurn.createMany({
            data: teamIds.map((teamId, index) => ({
                draft_round_id: newRound.id,
                team_id: teamId,
                turn_index: index + 1,
                status: index === 0 ? DraftTurnStatus.ACTIVE : DraftTurnStatus.PENDING,
            })),
        });

        const firstNewTurn = await this.prisma.draftTurn.findFirst({
            where: { draft_round_id: newRound.id, turn_index: 1 },
        });

        return {
            sessionId,
            pick,
            nextTurnId: firstNewTurn?.id ?? null,
            roundComplete: true,
            draftComplete: false,
            newRoundIndex: newRound.round_index,
        };
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
