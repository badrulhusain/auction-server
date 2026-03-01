import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
    @IsNotEmpty()
    @IsString()
    key!: string;

    @IsNotEmpty()
    @IsString()
    value!: string;
}
