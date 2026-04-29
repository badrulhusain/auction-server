import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DraftService } from './draft.service';
import { DraftBroadcastService } from './draft-broadcast.service';

@Controller('draft')
export class DraftController {
    constructor(
        private readonly draftService: DraftService,
        private readonly broadcastService: DraftBroadcastService,
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
        const state = await this.draftService.getState(sessionId);
        await this.broadcastService.broadcastState(sessionId, state);
        return result;
    }

    @Post('turns/:turnId/pick')
    async makePick(
        @Param('turnId') turnId: string,
        @Body('studentId') studentId: string,
    ) {
        const result = await this.draftService.makePick(turnId, studentId);
        if (result.sessionId) {
            const [state, summary] = await Promise.all([
                this.draftService.getState(result.sessionId),
                this.draftService.getSummary(result.sessionId),
            ]);
            await Promise.all([
                this.broadcastService.broadcastState(result.sessionId, state),
                this.broadcastService.broadcastSummary(result.sessionId, summary),
            ]);
        }
        return result;
    }
}
