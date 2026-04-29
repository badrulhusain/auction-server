import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseAuthService } from './supabase-auth.service';
import { SupabaseJwtGuard } from './guards/supabase-jwt.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [AuthService, SupabaseAuthService, SupabaseJwtGuard],
    controllers: [AuthController],
    exports: [SupabaseJwtGuard],
})
export class AuthModule {}
