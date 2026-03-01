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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAdminDto) {
        const existingAdmin = await this.prisma.admin.findFirst({
            where: {
                OR: [
                    { email: createAdminDto.email },
                    { username: createAdminDto.username }
                ]
            }
        });
        if (existingAdmin) {
            throw new common_1.ConflictException('Admin with this email or username already exists');
        }
        return this.prisma.admin.create({
            data: createAdminDto,
        });
    }
    async findAll() {
        return this.prisma.admin.findMany();
    }
    async findOne(id) {
        return this.prisma.admin.findUnique({
            where: { id },
        });
    }
    async update(id, updateAdminDto) {
        // Check if exists first for better error messages
        const existing = await this.prisma.admin.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Admin with ID ${id} not found`);
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
                throw new common_1.ConflictException('Admin with this email or username already exists');
            }
        }
        return this.prisma.admin.update({
            where: { id },
            data: updateAdminDto,
        });
    }
    async remove(id) {
        // Check if exists first
        const existing = await this.prisma.admin.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Admin with ID ${id} not found`);
        }
        return this.prisma.admin.delete({
            where: { id },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map