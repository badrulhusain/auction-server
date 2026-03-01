import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentEntity } from './entities/student.entity';

@Controller('student')
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Post()
    async create(@Body() createStudentDto: CreateStudentDto) {
        return new StudentEntity(await this.studentService.create(createStudentDto));
    }

    @Get()
    async findAll() {
        const students = await this.studentService.findAll();
        return students.map((student) => new StudentEntity(student));
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const student = await this.studentService.findOne(id);
        if (!student) {
            throw new NotFoundException(`Student with ID ${id} not found`);
        }
        return new StudentEntity(student);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
        return new StudentEntity(await this.studentService.update(id, updateStudentDto));
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return new StudentEntity(await this.studentService.remove(id));
    }
}
