import { Module } from '@nestjs/common';
import { DraftController } from './draft.controller';
import { DraftService } from './draft.service';
import { DraftGateway } from './draft.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [DraftController],
    providers: [DraftService, DraftGateway],
    exports: [DraftGateway],
})
export class DraftModule {}
