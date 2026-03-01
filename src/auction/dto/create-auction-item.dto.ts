import { AuctionItemStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAuctionItemDto {
    @IsString()
    @IsNotEmpty()
    student_id!: string;

    @IsNumber()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    base_price!: number;

    @IsInt()
    @IsNotEmpty()
    item_order!: number;

    @IsOptional()
    @IsEnum(AuctionItemStatus)
    status?: AuctionItemStatus;
}
