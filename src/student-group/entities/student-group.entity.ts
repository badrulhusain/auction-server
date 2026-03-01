import { StudentGroup } from '@prisma/client';

export class StudentGroupEntity implements StudentGroup {
    id!: string;
    student_id!: string;
    group_id!: string;
    created_at!: Date;

    constructor(partial: Partial<StudentGroupEntity>) {
        Object.assign(this, partial);
    }
}
