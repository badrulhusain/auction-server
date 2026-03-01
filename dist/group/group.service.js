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
exports.GroupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GroupService = class GroupService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createGroupDto) {
        try {
            return await this.prisma.group.create({
                data: createGroupDto,
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Group with this key and value already exists');
            }
            if (error.code === 'P2003') {
                throw new common_1.BadRequestException('Foreign key constraint failed');
            }
            if (error.name === 'PrismaClientValidationError') {
                throw new common_1.BadRequestException('Invalid data provided for group creation');
            }
            throw new common_1.InternalServerErrorException('An unexpected error occurred while creating the group');
        }
    }
    async findAll() {
        return this.prisma.group.findMany();
    }
    async findOne(id) {
        const group = await this.prisma.group.findUnique({
            where: { id },
        });
        if (!group) {
            throw new common_1.NotFoundException(`Group with ID ${id} not found`);
        }
        return group;
    }
    async update(id, updateGroupDto) {
        try {
            const group = await this.prisma.group.update({
                where: { id },
                data: updateGroupDto,
            });
            return group;
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Group with ID ${id} not found`);
            }
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Group with this key and value already exists');
            }
            if (error.name === 'PrismaClientValidationError') {
                throw new common_1.BadRequestException('Invalid data provided for group update');
            }
            throw new common_1.InternalServerErrorException('An unexpected error occurred while updating the group');
        }
    }
    async remove(id) {
        try {
            return await this.prisma.group.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Group with ID ${id} not found`);
            }
            throw new common_1.InternalServerErrorException('An unexpected error occurred while deleting the group');
        }
    }
};
exports.GroupService = GroupService;
exports.GroupService = GroupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupService);
//# sourceMappingURL=group.service.js.map