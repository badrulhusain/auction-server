import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class AdminLocalStrategy extends PassportStrategy(Strategy, 'admin-local') {
    constructor(private authService: AuthService) {
        super();
    }

    async validate(username: string, pass: string): Promise<any> {
        const user = await this.authService.validateAdmin(username, pass);
        if (!user) {
            throw new UnauthorizedException('Invalid Admin Credentials');
        }
        return user;
    }
}
