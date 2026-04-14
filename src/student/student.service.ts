import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) { }

  async create(createStudentDto: CreateStudentDto) {
    const existingStudent = await this.prisma.student.findUnique({
      where: { 
        auction_id_reg_no: { 
          auction_id: createStudentDto.auction_id!, 
          reg_no: createStudentDto.reg_no 
        } 
      }
    });

    if (existingStudent) {
      throw new ConflictException(`Student with registration number ${createStudentDto.reg_no} already exists in this auction`);
    }

    return this.prisma.student.create({
      data: {
        ...createStudentDto,
        auction_id: createStudentDto.auction_id!
      },
    });
  }

  async findAll(auctionId: string) {
    return this.prisma.student.findMany({
      where: { auction_id: auctionId }
    });
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

    if (updateStudentDto.reg_no && updateStudentDto.auction_id) {
      const duplicate = await this.prisma.student.findUnique({
        where: { 
          auction_id_reg_no: { 
            auction_id: updateStudentDto.auction_id, 
            reg_no: updateStudentDto.reg_no 
          } 
        }
      });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(`Student with registration number ${updateStudentDto.reg_no} already exists in this auction`);
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
