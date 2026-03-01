import { AuctionStatus, AuctionType } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAuctionDto {
    @IsString()
    @IsNotEmpty()
    created_by!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsEnum(AuctionType)
    @IsNotEmpty()
    auction_type!: AuctionType;

    @IsOptional()
    @IsEnum(AuctionStatus)
    status?: AuctionStatus;

    @IsOptional()
    @IsDateString()
    started_at?: string;

    @IsOptional()
    @IsDateString()
    ended_at?: string;
}
