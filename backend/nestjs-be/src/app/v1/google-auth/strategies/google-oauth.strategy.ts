import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { IUserPayload } from '../../models/google-auth-user.model';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleOauthStrategy.name);
  
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {

    const googleId = profile.id;
    const email = profile.emails?.[0]?.value ?? null;
    const firstName = profile.name?.givenName ?? '';
    const lastName = profile.name?.familyName ?? '';
    const picture = profile.photos?.[0]?.value ?? null;
    const locale = profile._json?.locale;

    const userForDB = {
      sub: googleId,
      email,
      name: `${firstName} ${lastName}`.trim(),
      picture,
      accessToken,
      refreshToken,
      tokenExpiry: Math.floor(Date.now() / 1000) + 3600,
      locale,
    };

    // TODO: encrypt tokens before saving in DB
    this.logger.debug(`User successfully authenticated via Google API: ${userForDB.name}`);

    const userForFrontend: IUserPayload = {
      sub: userForDB.sub,
      email: userForDB.email,
      name: userForDB.name,
      picture: userForDB.picture,
      locale: userForDB.locale,
    };

    done(null, userForFrontend);
  }


}
