import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
    @IsNotEmpty()
    @IsString()
    auction_id!: string;

    @IsNotEmpty()
    @IsString()
    key!: string;

    @IsNotEmpty()
    @IsString()
    value!: string;
}
