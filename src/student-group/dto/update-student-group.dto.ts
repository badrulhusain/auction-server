import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentGroupDto } from './create-student-group.dto';

export class UpdateStudentGroupDto extends PartialType(CreateStudentGroupDto) { }
