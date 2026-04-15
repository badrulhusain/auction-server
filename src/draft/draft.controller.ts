import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DraftService } from './draft.service';
import { DraftGateway } from './draft.gateway';

@Controller('draft')
export class DraftController {
    constructor(
        private readonly draftService: DraftService,
        private readonly draftGateway: DraftGateway,
    ) {}

    @Get('sessions/:sessionId/state')
    getState(@Param('sessionId') sessionId: string) {
        return this.draftService.getState(sessionId);
    }

    @Get('sessions/:sessionId/summary')
    getSummary(@Param('sessionId') sessionId: string) {
        return this.draftService.getSummary(sessionId);
    }

    @Post('sessions/:sessionId/start')
    async startDraft(
        @Param('sessionId') sessionId: string,
        @Body('auction_id') auctionId: string,
    ) {
        const result = await this.draftService.startDraft(sessionId, auctionId);
        // Notify all clients watching this session that the draft has started
        await this.draftGateway.broadcastState(sessionId);
        return result;
    }

    @Post('turns/:turnId/pick')
    async makePick(
        @Param('turnId') turnId: string,
        @Body('studentId') studentId: string,
    ) {
        const result = await this.draftService.makePick(turnId, studentId);
        // sessionId is returned by makePick so we can broadcast without requiring it in the body
        if (result.sessionId) {
            await Promise.all([
                this.draftGateway.broadcastState(result.sessionId),
                this.draftGateway.broadcastSummary(result.sessionId),
            ]);
        }
        return result;
    }
}
