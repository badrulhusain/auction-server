import { Admin } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class AdminEntity implements Admin {
    id!: string;
    name!: string;
    email!: string;
    username!: string;

    @Exclude()
    password_hash!: string;

    @Exclude()
    hashed_refresh_token!: string | null;

    created_at!: Date;
    updated_at!: Date;
    deleted_at!: Date | null;

    constructor(partial: Partial<AdminEntity>) {
        Object.assign(this, partial);
    }
}
