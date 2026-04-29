import { Injectable } from '@nestjs/common';
import { SupabaseAuthService } from './supabase-auth.service';
import { RegisterAdminDto, RegisterTeamDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(private supabaseAuth: SupabaseAuthService) {}

    registerAdmin(dto: RegisterAdminDto) {
        return this.supabaseAuth.registerAdmin(dto);
    }

    registerTeam(dto: RegisterTeamDto) {
        return this.supabaseAuth.registerTeam(dto);
    }

    loginAdmin(email: string, password: string) {
        return this.supabaseAuth.loginAdmin(email, password);
    }

    loginTeam(username: string, password: string) {
        return this.supabaseAuth.loginTeam(username, password);
    }

    logout(userId: string) {
        return this.supabaseAuth.logout(userId);
    }

    forgotAdminPassword(email: string) {
        return this.supabaseAuth.forgotAdminPassword(email);
    }
}
