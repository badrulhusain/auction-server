import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { CreateAuctionSessionDto } from './dto/create-auction-session.dto';
import { CreateAuctionItemDto } from './dto/create-auction-item.dto';

@Injectable()
export class AuctionService {
    constructor(private prisma: PrismaService) { }

    async create(createAuctionDto: CreateAuctionDto) {
        const adminExists = await this.prisma.admin.findUnique({
            where: { id: createAuctionDto.created_by }
        });
        if (!adminExists) {
            throw new BadRequestException(`Admin with ID ${createAuctionDto.created_by} does not exist`);
        }

        return this.prisma.auction.create({
            data: createAuctionDto,
        });
    }

    async findAll() {
        return this.prisma.auction.findMany();
    }

    async findOne(id: string) {
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

    async update(id: string, updateAuctionDto: UpdateAuctionDto) {
        const existing = await this.prisma.auction.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`Auction with ID ${id} not found`);
        }

        if (updateAuctionDto.created_by) {
            const adminExists = await this.prisma.admin.findUnique({
                where: { id: updateAuctionDto.created_by }
            });
            if (!adminExists) {
                throw new BadRequestException(`Admin with ID ${updateAuctionDto.created_by} does not exist`);
            }
        }

        return this.prisma.auction.update({
            where: { id },
            data: updateAuctionDto,
        });
    }

    async remove(id: string) {
        const existing = await this.prisma.auction.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`Auction with ID ${id} not found`);
        }
        return this.prisma.auction.delete({
            where: { id },
        });
    }

    async createSession(auctionId: string, createSessionDto: CreateAuctionSessionDto) {
        const auctionExists = await this.prisma.auction.findUnique({
            where: { id: auctionId }
        });
        if (!auctionExists) {
            throw new NotFoundException(`Auction with ID ${auctionId} not found`);
        }

        // Verify group exists
        const groupExists = await this.prisma.group.findUnique({
            where: { id: createSessionDto.group_id }
        });
        if (!groupExists) {
            throw new BadRequestException(`Group with ID ${createSessionDto.group_id} does not exist`);
        }

        return this.prisma.auctionSession.create({
            data: {
                ...createSessionDto,
                auction_id: auctionId
            },
        });
    }

    async createItem(sessionId: string, createItemDto: CreateAuctionItemDto) {
        const session = await this.prisma.auctionSession.findUnique({
            where: { id: sessionId },
            include: { auction: true }
        });

        if (!session) {
            throw new NotFoundException(`Auction Session with ID ${sessionId} not found`);
        }

        const studentExists = await this.prisma.student.findUnique({
            where: { id: createItemDto.student_id }
        });
        if (!studentExists) {
            throw new BadRequestException(`Student with ID ${createItemDto.student_id} does not exist`);
        }

        // Apply business rule: Draft auctions cannot have SOLD/UNSOLD statuses
        if (session.auction.auction_type === 'DRAFT') {
            if (createItemDto.status === 'SOLD' || createItemDto.status === 'UNSOLD') {
                throw new BadRequestException('Draft auctions cannot possess items with SOLD or UNSOLD status. Drafts solely define DraftTurnOrders.');
            }
        }

        return this.prisma.auctionItem.create({
            data: {
                ...createItemDto,
                auction_session_id: sessionId
            },
        });
    }
}
