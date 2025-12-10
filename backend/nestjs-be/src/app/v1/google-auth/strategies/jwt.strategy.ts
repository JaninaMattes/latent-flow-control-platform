import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { IUserPayload } from '../../models/google-auth-user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => req.cookies?.jwt,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: IUserPayload) {
   if (!payload?.sub) {
      this.logger.warn(`JWT missing sub claim: ${JSON.stringify(payload)}`);
      throw new UnauthorizedException('Invalid token: sub claim missing.');
    }

    this.logger.debug(`JWT validated for user: ${payload.name}`);
    return payload;
  }
}
