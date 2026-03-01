import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(configService: ConfigService) {
        super({
            // We extract the JWT from the Authorization Header (Bearer Token)
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // We use the same secret that signed the token in AuthService
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
        });
    }

    /**
     * Passport automatically verifies the JWT's signature and expiration using the secret.
     * If it's valid, it passes the decoded payload to this method.
     */
    async validate(payload: any) {
        if (!payload.sub || !payload.role) {
            throw new UnauthorizedException('Invalid Token Payload');
        }

        // Whatever we return here gets attached to req.user in the controller
        return {
            userId: payload.sub,
            username: payload.username,
            role: payload.role
        };
    }
}
