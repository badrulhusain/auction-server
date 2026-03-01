import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { EmailService } from '../infrastructure/email/email.service';
import { RegisterAdminDto, RegisterTeamDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private emailService: EmailService,
    ) { }
    /**
     * Hashes a raw string (like a password or refresh token) using bcrypt.
     */
    async hashData(data: string): Promise<string> {
        const saltOrRounds = 10;
        return bcrypt.hash(data, saltOrRounds);
    }

    /**
     * Compares a raw string against a hashed string.
     */
    async compareData(data: string, encrypted: string): Promise<boolean> {
        return bcrypt.compare(data, encrypted);
    }

    /**
     * Validates an Admin user's credentials against the database.
     */
    async validateAdmin(username: string, pass: string): Promise<any> {
        const admin = await this.prisma.admin.findUnique({
            where: { username },
        });

        if (admin && admin.password_hash) {
            const isMatch = await this.compareData(pass, admin.password_hash);
            if (isMatch) {
                const { password_hash, hashed_refresh_token, ...result } = admin;
                return result;
            }
        }
        return null;
    }

    /**
     * Validates a Team's credentials against the database.
     */
    async validateTeam(username: string, pass: string): Promise<any> {
        const team = await this.prisma.team.findUnique({
            where: { username },
        });

        if (team && team.password_hash) {
            const isMatch = await this.compareData(pass, team.password_hash);
            if (isMatch) {
                const { password_hash, hashed_refresh_token, ...result } = team;
                return result;
            }
        }
        return null;
    }

    /**
     * Registers a new Admin.
     */
    async registerAdmin(dto: RegisterAdminDto): Promise<any> {
        const hashedPassword = await this.hashData(dto.password);
        const admin = await this.prisma.admin.create({
            data: {
                name: dto.name,
                email: dto.email,
                username: dto.username,
                password_hash: hashedPassword,
            },
        });
        const { password_hash, hashed_refresh_token, ...result } = admin;
        return result;
    }

    /**
     * Registers a new Team.
     */
    async registerTeam(dto: RegisterTeamDto): Promise<any> {
        const hashedPassword = await this.hashData(dto.password);
        const team = await this.prisma.team.create({
            data: {
                auction_id: dto.auction_id,
                name: dto.name,
                username: dto.username,
                password_hash: hashedPassword,
                total_budget: dto.total_budget,
            },
        });
        const { password_hash, hashed_refresh_token, ...result } = team;
        return result;
    }

    /**
     * Generates Access and Refresh tokens for an authenticated user.
     */
    async getTokens(userId: string, username: string, role: 'ADMIN' | 'TEAM') {
        const jwtPayload = {
            sub: userId,
            username: username,
            role: role,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(jwtPayload, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(jwtPayload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    /**
     * Hashes and saves the refresh token to the database.
     */
    async updateRefreshToken(userId: string, role: 'ADMIN' | 'TEAM', refreshToken: string) {
        const hashedRefreshToken = await this.hashData(refreshToken);

        if (role === 'ADMIN') {
            await this.prisma.admin.update({
                where: { id: userId },
                data: { hashed_refresh_token: hashedRefreshToken },
            });
        } else {
            await this.prisma.team.update({
                where: { id: userId },
                data: { hashed_refresh_token: hashedRefreshToken },
            });
        }
    }

    /**
     * Clears the refresh token from the database.
     */
    async logout(userId: string, role: 'ADMIN' | 'TEAM') {
        if (role === 'ADMIN') {
            await this.prisma.admin.updateMany({
                where: {
                    id: userId,
                    hashed_refresh_token: { not: null },
                },
                data: { hashed_refresh_token: null },
            });
        } else {
            await this.prisma.team.updateMany({
                where: {
                    id: userId,
                    hashed_refresh_token: { not: null },
                },
                data: { hashed_refresh_token: null },
            });
        }
    }

    /**
     * Handles the forgot password request.
     */
    async forgotAdminPassword(email: string) {
        const admin = await this.prisma.admin.findUnique({
            where: { email },
        });

        if (!admin) {
            throw new NotFoundException('Account not registered');
        }

        // Generate a random token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Expiration time 1 hour from now
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 1);

        await this.prisma.admin.update({
            where: { id: admin.id },
            data: {
                reset_token: resetToken,
                reset_token_expiry: tokenExpiry,
            },
        });

        const resetLink = `https://your-website.com/reset-password?token=${resetToken}`;

        // Use the generic EmailService from our Infrastructure layer
        await this.emailService.sendEmail(
            email,
            'Password Reset Request',
            `<p>Click this <a href="${resetLink}">link</a> to reset your password.</p>`
        );

        return { message: 'Email sent successfully' };
    }

    /**
     * Resets the admin's password.
     */
    async resetAdminPassword(dto: any) {
        // We now expect 'token' instead of 'email' from the controller
        const admin = await this.prisma.admin.findFirst({
            where: {
                reset_token: dto.token
            },
        });

        if (!admin || !admin.reset_token_expiry) {
            throw new BadRequestException('Invalid or expired password reset token');
        }

        // Check token expiration
        if (admin.reset_token_expiry < new Date()) {
            throw new BadRequestException('Invalid or expired password reset token');
        }

        if (admin.password_hash) {
            const isMatch = await this.compareData(dto.newPassword, admin.password_hash);
            if (isMatch) {
                throw new BadRequestException('New password cannot be the same as your old password.');
            }
        }

        const hashedPassword = await this.hashData(dto.newPassword);
        await this.prisma.admin.update({
            where: { id: admin.id },
            data: {
                password_hash: hashedPassword,
                reset_token: null,          // Clear the token
                reset_token_expiry: null,   // Clear the expiration
            },
        });

        return { message: 'Password successfully changed' };
    }
}
