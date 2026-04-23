import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async create(createAdminDto: CreateAdminDto) {
        const existingAdmin = await this.prisma.admin.findFirst({
            where: {
                OR: [
                    { email: createAdminDto.email },
                    { username: createAdminDto.username }
                ]
            }
        });
        if (existingAdmin) {
            throw new ConflictException('Admin with this email or username already exists');
        }

        const { password_hash: rawPassword, ...rest } = createAdminDto;
        const password_hash = await bcrypt.hash(rawPassword, 10);

        return this.prisma.admin.create({
            data: { ...rest, password_hash },
        });
    }

    async findAll() {
        return this.prisma.admin.findMany();
    }

    async findOne(id: string) {
        return this.prisma.admin.findUnique({
            where: { id },
        });
    }

    async update(id: string, updateAdminDto: UpdateAdminDto) {
        // Check if exists first for better error messages
        const existing = await this.prisma.admin.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`Admin with ID ${id} not found`);
        }

        if (updateAdminDto.email || updateAdminDto.username) {
            const duplicate = await this.prisma.admin.findFirst({
                where: {
                    id: { not: id },
                    OR: [
                        ...(updateAdminDto.email ? [{ email: updateAdminDto.email }] : []),
                        ...(updateAdminDto.username ? [{ username: updateAdminDto.username }] : [])
                    ]
                }
            });
            if (duplicate) {
                throw new ConflictException('Admin with this email or username already exists');
            }
        }

        const { password_hash: rawPassword, ...rest } = updateAdminDto;
        const data: any = { ...rest };
        if (rawPassword) {
            data.password_hash = await bcrypt.hash(rawPassword, 10);
        }

        return this.prisma.admin.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        // Check if exists first
        const existing = await this.prisma.admin.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`Admin with ID ${id} not found`);
        }
        return this.prisma.admin.delete({
            where: { id },
        });
    }
}
