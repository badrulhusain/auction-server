import { Student } from '@prisma/client';

export class StudentEntity implements Student {
    id!: string;
    auction_id!: string;
    name!: string;
    reg_no!: string;
    is_active!: boolean;
    created_at!: Date;
    updated_at!: Date;
    deleted_at!: Date | null;

    constructor(partial: Partial<StudentEntity>) {
        Object.assign(this, partial);
    }
}
