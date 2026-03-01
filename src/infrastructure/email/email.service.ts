export abstract class EmailService {
    /**
     * Sends an email abstracting away the provider implementation.
     *
     * @param to The recipient email address
     * @param subject The email subject line
     * @param html The HTML body of the email
     * @returns Provider response or boolean indicating success
     */
    abstract sendEmail(to: string, subject: string, html: string): Promise<any>;
}
