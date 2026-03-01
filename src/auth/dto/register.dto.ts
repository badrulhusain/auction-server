import { IsString, IsEmail, IsNotEmpty, IsNumber, MinLength, IsUUID } from 'class-validator';

export class RegisterAdminDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsString()
    @MinLength(6)
    password!: string;
}

export class RegisterTeamDto {
    @IsUUID()
    @IsNotEmpty()
    auction_id!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsNumber()
    @IsNotEmpty()
    total_budget!: number;
}
