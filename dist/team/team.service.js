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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TeamService = class TeamService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTeamDto) {
        const auctionExists = await this.prisma.auction.findUnique({
            where: { id: createTeamDto.auction_id }
        });
        if (!auctionExists) {
            throw new common_1.BadRequestException(`Auction with ID ${createTeamDto.auction_id} does not exist`);
        }
        const existingTeam = await this.prisma.team.findUnique({
            where: { username: createTeamDto.username }
        });
        if (existingTeam) {
            throw new common_1.ConflictException(`Team with username ${createTeamDto.username} already exists`);
        }
        return this.prisma.team.create({
            data: createTeamDto,
        });
    }
    async findAll() {
        return this.prisma.team.findMany();
    }
    async findOne(id) {
        return this.prisma.team.findUnique({
            where: { id },
        });
    }
    async update(id, updateTeamDto) {
        const existing = await this.prisma.team.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Team with ID ${id} not found`);
        }
        if (updateTeamDto.auction_id) {
            const auctionExists = await this.prisma.auction.findUnique({
                where: { id: updateTeamDto.auction_id }
            });
            if (!auctionExists) {
                throw new common_1.BadRequestException(`Auction with ID ${updateTeamDto.auction_id} does not exist`);
            }
        }
        if (updateTeamDto.username) {
            const duplicate = await this.prisma.team.findUnique({
                where: { username: updateTeamDto.username }
            });
            if (duplicate && duplicate.id !== id) {
                throw new common_1.ConflictException(`Team with username ${updateTeamDto.username} already exists`);
            }
        }
        return this.prisma.team.update({
            where: { id },
            data: updateTeamDto,
        });
    }
    async remove(id) {
        const existing = await this.prisma.team.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Team with ID ${id} not found`);
        }
        return this.prisma.team.delete({
            where: { id },
        });
    }
};
exports.TeamService = TeamService;
exports.TeamService = TeamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamService);
//# sourceMappingURL=team.service.js.map