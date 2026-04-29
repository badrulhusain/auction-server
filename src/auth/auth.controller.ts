import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseJwtGuard } from './guards/supabase-jwt.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { RegisterAdminDto, RegisterTeamDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    // --- ADMIN ENDPOINTS ---

    @Post('admin/register')
    adminRegister(@Body() dto: RegisterAdminDto) {
        return this.authService.registerAdmin(dto);
    }

    @Post('admin/login')
    adminLogin(
        @Body('email') email: string,
        @Body('password') password: string,
    ) {
        return this.authService.loginAdmin(email, password);
    }

    @UseGuards(SupabaseJwtGuard)
    @Post('admin/logout')
    adminLogout(@CurrentUser() user: { userId: string }) {
        return this.authService.logout(user.userId);
    }

    @Post('admin/forgot-password')
    forgotAdminPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotAdminPassword(dto.email);
    }

    // --- TEAM ENDPOINTS ---

    @Post('team/register')
    teamRegister(@Body() dto: RegisterTeamDto) {
        return this.authService.registerTeam(dto);
    }

    @Post('team/login')
    teamLogin(
        @Body('username') username: string,
        @Body('password') password: string,
    ) {
        return this.authService.loginTeam(username, password);
    }

    @UseGuards(SupabaseJwtGuard)
    @Post('team/logout')
    teamLogout(@CurrentUser() user: { userId: string }) {
        return this.authService.logout(user.userId);
    }
}
