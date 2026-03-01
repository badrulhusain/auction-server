import { Module } from '@nestjs/common';
import { StudentGroupService } from './student-group.service';
import { StudentGroupController } from './student-group.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [StudentGroupController],
    providers: [StudentGroupService],
    exports: [StudentGroupService]
})
export class StudentGroupModule { }
