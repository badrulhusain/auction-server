import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupService {
    constructor(private prisma: PrismaService) { }

    async create(createGroupDto: CreateGroupDto) {
        try {
            return await this.prisma.group.create({
                data: createGroupDto,
            });
        } catch (error:any) {
            if (error.code === 'P2002') {
                throw new ConflictException('Group with this key and value already exists');
            }
            if (error.code === 'P2003') {
                throw new BadRequestException('Foreign key constraint failed');
            }
            if (error.name === 'PrismaClientValidationError') {
                throw new BadRequestException('Invalid data provided for group creation');
            }
            throw new InternalServerErrorException('An unexpected error occurred while creating the group');
        }
    }

    async findAll() {
        return this.prisma.group.findMany();
    }

    async findOne(id: string) {
        const group = await this.prisma.group.findUnique({
            where: { id },
        });

        if (!group) {
            throw new NotFoundException(`Group with ID ${id} not found`);
        }

        return group;
    }

    async update(id: string, updateGroupDto: UpdateGroupDto) {
        try {
            const group = await this.prisma.group.update({
                where: { id },
                data: updateGroupDto,
            });
            return group;
        } catch (error:any) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Group with ID ${id} not found`);
            }
            if (error.code === 'P2002') {
                throw new ConflictException('Group with this key and value already exists');
            }
            if (error.name === 'PrismaClientValidationError') {
                throw new BadRequestException('Invalid data provided for group update');
            }
            throw new InternalServerErrorException('An unexpected error occurred while updating the group');
        }
    }

    async remove(id: string) {
        try {
            return await this.prisma.group.delete({
                where: { id },
            });
        } catch (error:any) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Group with ID ${id} not found`);
            }
            throw new InternalServerErrorException('An unexpected error occurred while deleting the group');
        }
    }
}
