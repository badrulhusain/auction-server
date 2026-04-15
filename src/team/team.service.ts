import { Injectable, NotFoundException, ConflictException, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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

        const { password_hash: rawPassword, ...rest } = createTeamDto;
        const password_hash = await bcrypt.hash(rawPassword, 10);

        return this.prisma.team.create({
            data: { ...rest, password_hash },
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

        const { password_hash: rawPassword, ...rest } = updateTeamDto;
        const data: any = { ...rest };
        if (rawPassword) {
            data.password_hash = await bcrypt.hash(rawPassword, 10);
        }

        return this.prisma.team.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        const existing = await this.prisma.team.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        try {
            return await this.prisma.team.delete({ where: { id } });
        } catch (err: any) {
            if (err?.code === 'P2003') {
                throw new UnprocessableEntityException(
                    'Cannot delete this team because it has draft history. Remove the draft data first.',
                );
            }
            throw err;
        }
    }
}
