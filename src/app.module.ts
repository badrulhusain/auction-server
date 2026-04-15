import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from
  './auth/auth.module';
import { StudentModule } from './student/student.module';
import { AdminModule } from './admin/admin.module';
import { AuctionModule } from './auction/auction.module';
import { TeamModule } from './team/team.module';
import { GroupModule } from './group/group.module';
import { StudentGroupModule } from './student-group/student-group.module';
import { EmailModule } from './infrastructure/email/email.module';
import { DraftModule } from './draft/draft.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    StudentModule,
    AdminModule,
    AuctionModule,
    TeamModule,
    GroupModule,
    StudentGroupModule,
    EmailModule,
    DraftModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }