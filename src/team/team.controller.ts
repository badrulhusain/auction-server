import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamEntity } from './entities/team.entity';

@Controller('team')
export class TeamController {
    constructor(private readonly teamService: TeamService) { }

    @Post()
    async create(@Body() createTeamDto: CreateTeamDto) {
        return new TeamEntity(await this.teamService.create(createTeamDto));
    }

    @Get()
    async findAll() {
        const teams = await this.teamService.findAll();
        return teams.map((team) => new TeamEntity(team));
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const team = await this.teamService.findOne(id);
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        return new TeamEntity(team);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
        return new TeamEntity(await this.teamService.update(id, updateTeamDto));
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return new TeamEntity(await this.teamService.remove(id));
    }
}
