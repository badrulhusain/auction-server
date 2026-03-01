import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) { }

  async create(createStudentDto: CreateStudentDto) {
    const existingStudent = await this.prisma.student.findUnique({
      where: { reg_no: createStudentDto.reg_no }
    });
    if (existingStudent) {
      throw new ConflictException(`Student with registration number ${createStudentDto.reg_no} already exists`);
    }

    return this.prisma.student.create({
      data: createStudentDto,
    });
  }

  async findAll() {
    return this.prisma.student.findMany();
  }

  async findOne(id: string) {
    return this.prisma.student.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const existing = await this.prisma.student.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    if (updateStudentDto.reg_no) {
      const duplicate = await this.prisma.student.findUnique({
        where: { reg_no: updateStudentDto.reg_no }
      });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(`Student with registration number ${updateStudentDto.reg_no} already exists`);
      }
    }

    return this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.student.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return this.prisma.student.delete({
      where: { id },
    });
  }
}
