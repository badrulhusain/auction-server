import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    reg_no!: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsString()
    auction_id?: string;
}
