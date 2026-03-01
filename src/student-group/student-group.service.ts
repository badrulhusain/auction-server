import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateStudentGroupDto } from './dto/create-student-group.dto';
import { UpdateStudentGroupDto } from './dto/update-student-group.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentGroupService {
    constructor(private prisma: PrismaService) { }

    async create(createStudentGroupDto: CreateStudentGroupDto) {
        // First check if the target group exists to get its key
        const targetGroup = await this.prisma.group.findUnique({
            where: { id: createStudentGroupDto.group_id }
        });

        if (!targetGroup) {
            throw new BadRequestException('The specified group does not exist');
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
            throw new ConflictException(`This student is already assigned to a group with the key '${targetGroup.key}' (Group: ${existingAssignment.group.value})`);
        }

        try {
            return await this.prisma.studentGroup.create({
                data: createStudentGroupDto,
            });
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new ConflictException('This student is already assigned to this group');
            }
            if (error.code === 'P2003') {
                throw new BadRequestException('Provided student or group ID does not exist in the database');
            }
            if (error.name === 'PrismaClientValidationError') {
                throw new BadRequestException('Invalid data provided for student group assignment');
            }
            throw new InternalServerErrorException('An unexpected error occurred while creating the student group');
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

    async findOne(id: string) {
        const studentGroup = await this.prisma.studentGroup.findUnique({
            where: { id },
            include: {
                student: true,
                group: true
            }
        });

        if (!studentGroup) {
            throw new NotFoundException(`StudentGroup with ID ${id} not found`);
        }

        return studentGroup;
    }

    async update(id: string, updateStudentGroupDto: UpdateStudentGroupDto) {
        // If we are changing the group or student, check key constraints
        if (updateStudentGroupDto.group_id || updateStudentGroupDto.student_id) {
            const existingRecord = await this.findOne(id);
            const targetStudentId = updateStudentGroupDto.student_id || existingRecord.student_id;
            const targetGroupId = updateStudentGroupDto.group_id || existingRecord.group_id;

            const targetGroup = await this.prisma.group.findUnique({
                where: { id: targetGroupId }
            });

            if (!targetGroup) {
                throw new BadRequestException('The specified group does not exist');
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
                throw new ConflictException(`This student is already assigned to a group with the key '${targetGroup.key}' (Group: ${conflictingAssignment.group.value})`);
            }
        }

        try {
            const studentGroup = await this.prisma.studentGroup.update({
                where: { id },
                data: updateStudentGroupDto,
            });
            return studentGroup;
        } catch (error: any) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`StudentGroup with ID ${id} not found`);
            }
            if (error.code === 'P2002') {
                throw new ConflictException('This student is already assigned to this group');
            }
            if (error.code === 'P2003') {
                throw new BadRequestException('Provided student or group ID does not exist in the database');
            }
            if (error.name === 'PrismaClientValidationError') {
                throw new BadRequestException('Invalid data provided for student group update');
            }
            throw new InternalServerErrorException('An unexpected error occurred while updating the student group');
        }
    }

    async remove(id: string) {
        try {
            return await this.prisma.studentGroup.delete({
                where: { id },
            });
        } catch (error: any) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`StudentGroup with ID ${id} not found`);
            }
            throw new InternalServerErrorException('An unexpected error occurred while deleting the student group');
        }
    }
}
