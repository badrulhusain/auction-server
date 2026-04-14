import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const AuctionId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const auctionId = request.headers['x-auction-id'];
        if (!auctionId) {
            throw new BadRequestException('x-auction-id header is required');
        }
        return auctionId;
    },
);
