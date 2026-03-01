import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
    constructor(private prisma: PrismaService) { }

    async create(createTeamDto: CreateTeamDto) {
        const auctionExists = await this.prisma.auction.findUnique({
            where: { id: createTeamDto.auction_id }
        });
        if (!auctionExists) {
            throw new BadRequestException(`Auction with ID ${createTeamDto.auction_id} does not exist`);
        }

        const existingTeam = await this.prisma.team.findUnique({
            where: { username: createTeamDto.username }
        });
        if (existingTeam) {
            throw new ConflictException(`Team with username ${createTeamDto.username} already exists`);
        }

        return this.prisma.team.create({
            data: createTeamDto,
        });
    }

    async findAll() {
        return this.prisma.team.findMany();
    }

    async findOne(id: string) {
        return this.prisma.team.findUnique({
            where: { id },
        });
    }

    async update(id: string, updateTeamDto: UpdateTeamDto) {
        const existing = await this.prisma.team.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (updateTeamDto.auction_id) {
            const auctionExists = await this.prisma.auction.findUnique({
                where: { id: updateTeamDto.auction_id }
            });
            if (!auctionExists) {
                throw new BadRequestException(`Auction with ID ${updateTeamDto.auction_id} does not exist`);
            }
        }

        if (updateTeamDto.username) {
            const duplicate = await this.prisma.team.findUnique({
                where: { username: updateTeamDto.username }
            });
            if (duplicate && duplicate.id !== id) {
                throw new ConflictException(`Team with username ${updateTeamDto.username} already exists`);
            }
        }

        return this.prisma.team.update({
            where: { id },
            data: updateTeamDto,
        });
    }

    async remove(id: string) {
        const existing = await this.prisma.team.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        return this.prisma.team.delete({
            where: { id },
        });
    }
}
