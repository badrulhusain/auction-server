"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    /**
     * Hashes a raw string (like a password or refresh token) using bcrypt.
     */
    async hashData(data) {
        const saltOrRounds = 10;
        return bcrypt.hash(data, saltOrRounds);
    }
    /**
     * Compares a raw string against a hashed string.
     */
    async compareData(data, encrypted) {
        return bcrypt.compare(data, encrypted);
    }
    /**
     * Validates an Admin user's credentials against the database.
     */
    async validateAdmin(username, pass) {
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
    async validateTeam(username, pass) {
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
    async registerAdmin(dto) {
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
    async registerTeam(dto) {
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
    async getTokens(userId, username, role) {
        const jwtPayload = {
            sub: userId,
            username: username,
            role: role,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(jwtPayload, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(jwtPayload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
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
    async updateRefreshToken(userId, role, refreshToken) {
        const hashedRefreshToken = await this.hashData(refreshToken);
        if (role === 'ADMIN') {
            await this.prisma.admin.update({
                where: { id: userId },
                data: { hashed_refresh_token: hashedRefreshToken },
            });
        }
        else {
            await this.prisma.team.update({
                where: { id: userId },
                data: { hashed_refresh_token: hashedRefreshToken },
            });
        }
    }
    /**
     * Clears the refresh token from the database.
     */
    async logout(userId, role) {
        if (role === 'ADMIN') {
            await this.prisma.admin.updateMany({
                where: {
                    id: userId,
                    hashed_refresh_token: { not: null },
                },
                data: { hashed_refresh_token: null },
            });
        }
        else {
            await this.prisma.team.updateMany({
                where: {
                    id: userId,
                    hashed_refresh_token: { not: null },
                },
                data: { hashed_refresh_token: null },
            });
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map