import { AuctionSessionStatus, SessionRule } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAuctionSessionDto {
    @IsString()
    @IsNotEmpty()
    group_id!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsInt()
    @IsNotEmpty()
    session_number!: number;

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
}
