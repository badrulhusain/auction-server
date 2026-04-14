import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DraftService } from './draft.service';

@Controller('draft')
export class DraftController {
    constructor(private readonly draftService: DraftService) {}

    @Get('sessions/:sessionId/summary')
    getSummary(@Param('sessionId') sessionId: string) {
        return this.draftService.getSummary(sessionId);
    }

    @Post('sessions/:sessionId/start')
    startDraft(
        @Param('sessionId') sessionId: string,
        @Body('auction_id') auctionId: string,
    ) {
        return this.draftService.startDraft(sessionId, auctionId);
    }
}
