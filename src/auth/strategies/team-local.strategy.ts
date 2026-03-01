import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class TeamLocalStrategy extends PassportStrategy(Strategy, 'team-local') {
    constructor(private authService: AuthService) {
        super();
    }

    async validate(username: string, pass: string): Promise<any> {
        const team = await this.authService.validateTeam(username, pass);
        if (!team) {
            throw new UnauthorizedException('Invalid Team Credentials');
        }
        return team;
    }
}
