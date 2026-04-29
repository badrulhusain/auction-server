import { Module } from '@nestjs/common';
import { DraftController } from './draft.controller';
import { DraftService } from './draft.service';
import { DraftBroadcastService } from './draft-broadcast.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [DraftController],
    providers: [DraftService, DraftBroadcastService],
    exports: [DraftBroadcastService],
})
export class DraftModule {}
