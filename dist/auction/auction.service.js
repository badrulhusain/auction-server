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
exports.AuctionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuctionService = class AuctionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAuctionDto) {
        const adminExists = await this.prisma.admin.findUnique({
            where: { id: createAuctionDto.created_by }
        });
        if (!adminExists) {
            throw new common_1.BadRequestException(`Admin with ID ${createAuctionDto.created_by} does not exist`);
        }
        return this.prisma.auction.create({
            data: createAuctionDto,
        });
    }
    async findAll() {
        return this.prisma.auction.findMany();
    }
    async findOne(id) {
        return this.prisma.auction.findUnique({
            where: { id },
            include: {
                creator: true,
                teams: true,
                auction_sessions: {
                    include: {
                        auction_items: true
                    }
                },
            }
        });
    }
    async update(id, updateAuctionDto) {
        const existing = await this.prisma.auction.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Auction with ID ${id} not found`);
        }
        if (updateAuctionDto.created_by) {
            const adminExists = await this.prisma.admin.findUnique({
                where: { id: updateAuctionDto.created_by }
            });
            if (!adminExists) {
                throw new common_1.BadRequestException(`Admin with ID ${updateAuctionDto.created_by} does not exist`);
            }
        }
        return this.prisma.auction.update({
            where: { id },
            data: updateAuctionDto,
        });
    }
    async remove(id) {
        const existing = await this.prisma.auction.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Auction with ID ${id} not found`);
        }
        return this.prisma.auction.delete({
            where: { id },
        });
    }
    async createSession(auctionId, createSessionDto) {
        const auctionExists = await this.prisma.auction.findUnique({
            where: { id: auctionId }
        });
        if (!auctionExists) {
            throw new common_1.NotFoundException(`Auction with ID ${auctionId} not found`);
        }
        // Verify group exists
        const groupExists = await this.prisma.group.findUnique({
            where: { id: createSessionDto.group_id }
        });
        if (!groupExists) {
            throw new common_1.BadRequestException(`Group with ID ${createSessionDto.group_id} does not exist`);
        }
        return this.prisma.auctionSession.create({
            data: {
                ...createSessionDto,
                auction_id: auctionId
            },
        });
    }
    async createItem(sessionId, createItemDto) {
        const session = await this.prisma.auctionSession.findUnique({
            where: { id: sessionId },
            include: { auction: true }
        });
        if (!session) {
            throw new common_1.NotFoundException(`Auction Session with ID ${sessionId} not found`);
        }
        const studentExists = await this.prisma.student.findUnique({
            where: { id: createItemDto.student_id }
        });
        if (!studentExists) {
            throw new common_1.BadRequestException(`Student with ID ${createItemDto.student_id} does not exist`);
        }
        // Apply business rule: Draft auctions cannot have SOLD/UNSOLD statuses
        if (session.auction.auction_type === 'DRAFT') {
            if (createItemDto.status === 'SOLD' || createItemDto.status === 'UNSOLD') {
                throw new common_1.BadRequestException('Draft auctions cannot possess items with SOLD or UNSOLD status. Drafts solely define DraftTurnOrders.');
            }
        }
        return this.prisma.auctionItem.create({
            data: {
                ...createItemDto,
                auction_session_id: sessionId
            },
        });
    }
};
exports.AuctionService = AuctionService;
exports.AuctionService = AuctionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuctionService);
//# sourceMappingURL=auction.service.js.map