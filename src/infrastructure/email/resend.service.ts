import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailService } from './email.service';

@Injectable()
export class ResendService implements EmailService {
    private resend: Resend;
    private readonly logger = new Logger(ResendService.name);
    private readonly defaultFrom: string;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        this.defaultFrom = this.configService.get<string>('EMAIL_FROM') || 'Acme <onboarding@resend.dev>'; // fallback for dev

        if (apiKey) {
            this.resend = new Resend(apiKey);
        } else {
            this.logger.warn('RESEND_API_KEY is not defined. Email service might not work.');
            // Initialize with a dummy key to prevent crash, but requests will fail
            this.resend = new Resend('re_dummy_key');
        }
    }

    async sendEmail(to: string, subject: string, html: string): Promise<any> {
        try {
            this.logger.log(`Preparing to send email to ${to} with subject "${subject}"`);

            const response = await this.resend.emails.send({
                from: this.defaultFrom,
                to,
                subject,
                html,
            });

            if (response.error) {
                this.logger.error(`Resend API Error: ${response.error.message}`, response.error);
                throw new InternalServerErrorException(`Failed to send email: ${response.error.message}`);
            }

            this.logger.log(`Email successfully sent to ${to}. ID: ${response.data.id}`);
            return response.data;

        } catch (error) {
            this.logger.error(`Failed to send email to ${to}`, error instanceof Error ? error.stack : error);
            throw new InternalServerErrorException('Email service encountered a critical error');
        }
    }
}
