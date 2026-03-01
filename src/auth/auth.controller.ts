import { Controller, Post, UseGuards, Request, Res, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLocalAuthGuard } from './guards/admin-local-auth.guard';
import { TeamLocalAuthGuard } from './guards/team-local-auth.guard';
import { Response } from 'express';
import { RegisterAdminDto, RegisterTeamDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(AdminLocalAuthGuard)
    @Post('admin/login')
    async adminLogin(@Request() req: any, @Res({ passthrough: true }) res: Response) {
        // req.user is populated by passport-local from the DB
        const tokens = await this.authService.getTokens(req.user.id, req.user.username, 'ADMIN');

        await this.authService.updateRefreshToken(req.user.id, 'ADMIN', tokens.refreshToken);

        res.cookie('admin_refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return {
            access_token: tokens.accessToken,
        };
    }

    @Post('admin/logout')
    async adminLogout(@Body('userId') userId: string, @Res({ passthrough: true }) res: Response) {
        // Later this will be extracted from the @CurrentUser decorator via JwtAuthGuard
        // For now, accepting userId in body for the skeleton
        await this.authService.logout(userId, 'ADMIN');

        res.clearCookie('admin_refresh_token');
        return { message: 'Logged out successfully' };
    }

    // --- TEAM ENDPOINTS ---

    @Post('admin/register')
    async adminRegister(@Body() dto: RegisterAdminDto) {
        return this.authService.registerAdmin(dto);
    }

    @UseGuards(TeamLocalAuthGuard)
    @Post('team/login')
    async teamLogin(@Request() req: any, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.getTokens(req.user.id, req.user.username, 'TEAM');

        await this.authService.updateRefreshToken(req.user.id, 'TEAM', tokens.refreshToken);

        res.cookie('team_refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            access_token: tokens.accessToken,
        };
    }

    @Post('team/logout')
    async teamLogout(@Body('userId') userId: string, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(userId, 'TEAM');

        res.clearCookie('team_refresh_token');
        return { message: 'Logged out successfully' };
    }

    @Post('team/register')
    async teamRegister(@Body() dto: RegisterTeamDto) {
        return this.authService.registerTeam(dto);
    }
}
