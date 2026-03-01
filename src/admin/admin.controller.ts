import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminEntity } from './entities/admin.entity';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Post()
    async create(@Body() createAdminDto: CreateAdminDto) {
        return new AdminEntity(await this.adminService.create(createAdminDto));
    }

    @Get()
    async findAll() {
        const admins = await this.adminService.findAll();
        return admins.map((admin) => new AdminEntity(admin));
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const admin = await this.adminService.findOne(id);
        if (!admin) {
            throw new NotFoundException(`Admin with ID ${id} not found`);
        }
        return new AdminEntity(admin);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
        return new AdminEntity(await this.adminService.update(id, updateAdminDto));
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return new AdminEntity(await this.adminService.remove(id));
    }
}
