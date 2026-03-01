import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { ResendService } from './resend.service';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: EmailService,
            useClass: ResendService,
        },
    ],
    exports: [EmailService],
})
export class EmailModule { }
