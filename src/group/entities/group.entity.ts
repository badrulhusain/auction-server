import { Group } from '@prisma/client';

export class GroupEntity implements Group {
    id!: string;
    key!: string;
    value!: string;
    created_at!: Date;
    updated_at!: Date;
    deleted_at!: Date | null;

    constructor(partial: Partial<GroupEntity>) {
        Object.assign(this, partial);
    }
}
