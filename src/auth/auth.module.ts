import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminLocalStrategy } from './strategies/admin-local.strategy';
import { TeamLocalStrategy } from './strategies/team-local.strategy';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ACCESS_SECRET'),
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, AdminLocalStrategy, TeamLocalStrategy, JwtAccessStrategy],
    controllers: [AuthController],
})
export class AuthModule { }
