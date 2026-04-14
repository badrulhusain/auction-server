import { AuctionSessionStatus, SessionRule } from '@prisma/client';
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAuctionSessionDto {
    @IsOptional()
    @IsString()
    auction_id?: string;

    @IsOptional()
    @IsString()
    group_id?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsInt()
    session_number?: number;

    @IsOptional()
    @IsEnum(AuctionSessionStatus)
    status?: AuctionSessionStatus;

    @IsOptional()
    @IsEnum(SessionRule)
    rule?: SessionRule;

    @IsOptional()
    @IsString()
    custom_rule?: string;

    @IsOptional()
    @IsNumber()
    hike?: number;

    @IsOptional()
    @IsInt()
    max_time_per_candidate?: number;

    @IsOptional()
    @IsArray()
    base_team_order?: string[];
}
