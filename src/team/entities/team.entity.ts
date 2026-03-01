import { Team, TeamStatus, Prisma } from '@prisma/client';
import { Exclude, Transform } from 'class-transformer';

export class TeamEntity implements Team {
    id!: string;
    auction_id!: string;
    name!: string;
    username!: string;

    @Exclude()
    password_hash!: string;

    @Transform(({ value }) => Number(value))
    total_budget!: Prisma.Decimal;

    status!: TeamStatus;

    @Exclude()
    hashed_refresh_token!: string | null;

    created_at!: Date;
    updated_at!: Date;
    deleted_at!: Date | null;

    constructor(partial: Partial<TeamEntity>) {
        Object.assign(this, partial);
    }
}
