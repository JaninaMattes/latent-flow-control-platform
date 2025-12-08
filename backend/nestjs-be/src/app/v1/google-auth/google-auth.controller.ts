import { Controller, Get, Logger, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Profile } from 'passport-google-oauth20';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GoogleAuthService } from './google-auth.service';
import { GoogleOauthGuard } from './guards/google-oauth.guard';

/**
 * Integrate an OAuth2 authorization code flow strategy for the google Web API in a NodeJS 
 * with TypeScript and NestJS back end application
 *
 * More general information regarding google API usage under docs:
 * https://developer.google.com/documentation/general/guides/authorization/code-flow/
 */
@ApiTags('google-auth')
@Controller('/google-auth')
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name);

  constructor(
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @ApiOperation({ summary: 'Initiates Google OAuth2 authorization flow' })
  @UseGuards(GoogleOauthGuard)
  @Get('/login')
  googleAuthLogin(): void {
    // Passport handles redirect
    return;
  }

  /**
   * Endpoint the user gets redirected to
   * once successfully logged in.
   * @param req
   * @param res
   * @returns
   */
  @ApiOperation({ summary: 'Google OAuth2 callback endpoint' })
  @Get('/redirect')
  async googleAuthRedirect(@Req() req: any) {
    const {
      user,
      authInfo,
    }: {
      user: Profile;
      authInfo: {
        accessToken: string;
        refreshToken: string;
        expires_in: number;
      };
    } = req;

    if (!user) {
      this.logger.debug('User could not be authenticated via Google API');
      throw new UnauthorizedException('Google authentication failed.');
    }

    this.logger.debug(
      `User successfully authenticated via Google API: ${user.displayName}`,
    );

    const jwt = this.googleAuthService.login(user);

    const sanitizedUser = {
      id: user.id,
      email: user.emails?.[0]?.value,
      name: user.displayName,
      picture: user.photos?.[0]?.value,
    };

    return {
      token: jwt,
      authInfo,
      user: sanitizedUser,
    };
  }

}