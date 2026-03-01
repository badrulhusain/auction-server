"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const admin_local_auth_guard_1 = require("./guards/admin-local-auth.guard");
const team_local_auth_guard_1 = require("./guards/team-local-auth.guard");
const register_dto_1 = require("./dto/register.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async adminLogin(req, res) {
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
    async adminLogout(userId, res) {
        // Later this will be extracted from the @CurrentUser decorator via JwtAuthGuard
        // For now, accepting userId in body for the skeleton
        await this.authService.logout(userId, 'ADMIN');
        res.clearCookie('admin_refresh_token');
        return { message: 'Logged out successfully' };
    }
    // --- TEAM ENDPOINTS ---
    async adminRegister(dto) {
        return this.authService.registerAdmin(dto);
    }
    async teamLogin(req, res) {
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
    async teamLogout(userId, res) {
        await this.authService.logout(userId, 'TEAM');
        res.clearCookie('team_refresh_token');
        return { message: 'Logged out successfully' };
    }
    async teamRegister(dto) {
        return this.authService.registerTeam(dto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.UseGuards)(admin_local_auth_guard_1.AdminLocalAuthGuard),
    (0, common_1.Post)('admin/login'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminLogin", null);
__decorate([
    (0, common_1.Post)('admin/logout'),
    __param(0, (0, common_1.Body)('userId')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminLogout", null);
__decorate([
    (0, common_1.Post)('admin/register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterAdminDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminRegister", null);
__decorate([
    (0, common_1.UseGuards)(team_local_auth_guard_1.TeamLocalAuthGuard),
    (0, common_1.Post)('team/login'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "teamLogin", null);
__decorate([
    (0, common_1.Post)('team/logout'),
    __param(0, (0, common_1.Body)('userId')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "teamLogout", null);
__decorate([
    (0, common_1.Post)('team/register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterTeamDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "teamRegister", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map