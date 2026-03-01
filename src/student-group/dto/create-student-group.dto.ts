import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateStudentGroupDto {
    @IsNotEmpty()
    @IsUUID()
    student_id!: string;

    @IsNotEmpty()
    @IsUUID()
    group_id!: string;
}
