import { Auction, AuctionStatus, AuctionType } from '@prisma/client';

export class AuctionEntity implements Auction {
    id!: string;
    created_by!: string;
    name!: string;
    auction_type!: AuctionType;
    status!: AuctionStatus;
    started_at!: Date | null;
    ended_at!: Date | null;
    created_at!: Date;
    updated_at!: Date;
    deleted_at!: Date | null;

    constructor(partial: Partial<AuctionEntity>) {
        Object.assign(this, partial);
    }
}
