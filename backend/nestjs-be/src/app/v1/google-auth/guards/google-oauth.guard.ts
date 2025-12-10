import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  constructor(private readonly configService: ConfigService) {
    super({
      accessType: 'offline',
    });
  }
}