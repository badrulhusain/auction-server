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
exports.StudentGroupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StudentGroupService = class StudentGroupService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createStudentGroupDto) {
        // First check if the target group exists to get its key
        const targetGroup = await this.prisma.group.findUnique({
            where: { id: createStudentGroupDto.group_id }
        });
        if (!targetGroup) {
            throw new common_1.BadRequestException('The specified group does not exist');
        }
        // Check if the student is already in a group with the same key
        const existingAssignment = await this.prisma.studentGroup.findFirst({
            where: {
                student_id: createStudentGroupDto.student_id,
                group: {
                    key: targetGroup.key
                }
            },
            include: {
                group: true
            }
        });
        if (existingAssignment) {
            throw new common_1.ConflictException(`This student is already assigned to a group with the key '${targetGroup.key}' (Group: ${existingAssignment.group.value})`);
        }
        try {
            return await this.prisma.studentGroup.create({
                data: createStudentGroupDto,
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('This student is already assigned to this group');
            }
            if (error.code === 'P2003') {
                throw new common_1.BadRequestException('Provided student or group ID does not exist in the database');
            }
            if (error.name === 'PrismaClientValidationError') {
                throw new common_1.BadRequestException('Invalid data provided for student group assignment');
            }
            throw new common_1.InternalServerErrorException('An unexpected error occurred while creating the student group');
        }
    }
    async findAll() {
        return this.prisma.studentGroup.findMany({
            include: {
                student: true,
                group: true
            }
        });
    }
    async findOne(id) {
        const studentGroup = await this.prisma.studentGroup.findUnique({
            where: { id },
            include: {
                student: true,
                group: true
            }
        });
        if (!studentGroup) {
            throw new common_1.NotFoundException(`StudentGroup with ID ${id} not found`);
        }
        return studentGroup;
    }
    async update(id, updateStudentGroupDto) {
        // If we are changing the group or student, check key constraints
        if (updateStudentGroupDto.group_id || updateStudentGroupDto.student_id) {
            const existingRecord = await this.findOne(id);
            const targetStudentId = updateStudentGroupDto.student_id || existingRecord.student_id;
            const targetGroupId = updateStudentGroupDto.group_id || existingRecord.group_id;
            const targetGroup = await this.prisma.group.findUnique({
                where: { id: targetGroupId }
            });
            if (!targetGroup) {
                throw new common_1.BadRequestException('The specified group does not exist');
            }
            const conflictingAssignment = await this.prisma.studentGroup.findFirst({
                where: {
                    id: { not: id }, // Exclude the current record
                    student_id: targetStudentId,
                    group: { key: targetGroup.key }
                },
                include: { group: true }
            });
            if (conflictingAssignment) {
                throw new common_1.ConflictException(`This student is already assigned to a group with the key '${targetGroup.key}' (Group: ${conflictingAssignment.group.value})`);
            }
        }
        try {
            const studentGroup = await this.prisma.studentGroup.update({
                where: { id },
                data: updateStudentGroupDto,
            });
            return studentGroup;
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`StudentGroup with ID ${id} not found`);
            }
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('This student is already assigned to this group');
            }
            if (error.code === 'P2003') {
                throw new common_1.BadRequestException('Provided student or group ID does not exist in the database');
            }
            if (error.name === 'PrismaClientValidationError') {
                throw new common_1.BadRequestException('Invalid data provided for student group update');
            }
            throw new common_1.InternalServerErrorException('An unexpected error occurred while updating the student group');
        }
    }
    async remove(id) {
        try {
            return await this.prisma.studentGroup.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`StudentGroup with ID ${id} not found`);
            }
            throw new common_1.InternalServerErrorException('An unexpected error occurred while deleting the student group');
        }
    }
};
exports.StudentGroupService = StudentGroupService;
exports.StudentGroupService = StudentGroupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentGroupService);
//# sourceMappingURL=student-group.service.js.map