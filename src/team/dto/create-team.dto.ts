import { TeamStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTeamDto {
    @IsString()
    @IsNotEmpty()
    auction_id!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsString()
    @MinLength(8)
    password_hash!: string;

    @IsNumber()
    @IsNotEmpty()
    total_budget!: number;

    @IsOptional()
    @IsEnum(TeamStatus)
    status?: TeamStatus;
}
