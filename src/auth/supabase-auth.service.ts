import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterAdminDto, RegisterTeamDto } from './dto/register.dto';

@Injectable()
export class SupabaseAuthService {
    private supabase: SupabaseClient;

    constructor(private prisma: PrismaService) {
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
    }

    async registerAdmin(dto: RegisterAdminDto) {
        const { data, error } = await this.supabase.auth.admin.createUser({
            email: dto.email,
            password: dto.password,
            user_metadata: { name: dto.name, username: dto.username },
            app_metadata: { role: 'ADMIN' },
            email_confirm: true,
        });
        if (error) throw new BadRequestException(error.message);

        await this.prisma.admin.create({
            data: {
                id: data.user.id,
                name: dto.name,
                email: dto.email,
                username: dto.username,
                password_hash: 'supabase_managed',
            },
        });

        const { password_hash, hashed_refresh_token, reset_token, reset_token_expiry, ...result } =
            (await this.prisma.admin.findUnique({ where: { id: data.user.id } }))!;
        return result;
    }

    async registerTeam(dto: RegisterTeamDto) {
        const syntheticEmail = `${dto.username}@auction.internal`;

        const { data, error } = await this.supabase.auth.admin.createUser({
            email: syntheticEmail,
            password: dto.password,
            app_metadata: {
                role: 'TEAM',
                auction_id: dto.auction_id,
            },
            email_confirm: true,
        });
        if (error) throw new BadRequestException(error.message);

        await this.prisma.team.create({
            data: {
                id: data.user.id,
                auction_id: dto.auction_id,
                name: dto.name,
                username: dto.username,
                password_hash: 'supabase_managed',
                total_budget: dto.total_budget,
            },
        });

        const { password_hash, hashed_refresh_token, ...result } =
            (await this.prisma.team.findUnique({ where: { id: data.user.id } }))!;
        return result;
    }

    async loginAdmin(email: string, password: string) {
        const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
        if (error || !data.session) throw new UnauthorizedException(error?.message ?? 'Invalid credentials');

        if (data.user.app_metadata?.role !== 'ADMIN') {
            throw new UnauthorizedException('Not an admin account');
        }

        return { access_token: data.session.access_token };
    }

    async loginTeam(username: string, password: string) {
        const syntheticEmail = `${username}@auction.internal`;
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: syntheticEmail,
            password,
        });
        if (error || !data.session) throw new UnauthorizedException(error?.message ?? 'Invalid credentials');

        return { access_token: data.session.access_token };
    }

    async logout(userId: string) {
        const { error } = await this.supabase.auth.admin.signOut(userId);
        if (error) throw new BadRequestException(error.message);
        return { message: 'Logged out successfully' };
    }

    async forgotAdminPassword(email: string) {
        const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
            redirectTo: process.env.PASSWORD_RESET_URL ?? 'https://your-app.com/reset-password',
        });
        if (error) throw new BadRequestException(error.message);
        return { message: 'Password reset email sent' };
    }
}
