import {
  Controller,
  Get,
  Logger,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GoogleAuthService } from './google-auth.service';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { JWTAuthGuard } from './guards/jwt-auth.guard';
import { IUserPayload } from '../models/google-auth-user.model';
import { ConfigService } from '@nestjs/config';

@ApiTags('google-auth')
@Controller('/google-auth')
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name);

  constructor( private readonly configService: ConfigService, private readonly googleAuthService: GoogleAuthService) {}

  @ApiOperation({ summary: 'Initiates Google OAuth2 authorization flow' })
  @UseGuards(GoogleOauthGuard)
  @Get('/login')
  googleAuthLogin(): void {
    return;
  }

  @ApiOperation({ summary: 'Google OAuth2 callback endpoint' })
  @Get('/redirect')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(
    @Req() req: { user: IUserPayload; query: any },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;

    if (!user?.sub) {
      this.logger.warn(`Authentication failed: no user or invalid payload`);
      throw new UnauthorizedException('Google authentication failed');
    }

    const jwt = await this.googleAuthService.login(user);

    res.cookie('jwt', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.redirect(this.configService.get<string>('FRONTEND_URL'));
  }

  @ApiOperation({ summary: 'Get current logged-in user' })
  @UseGuards(JWTAuthGuard)
  @Get('/me')
  async getCurrentUser(@Req() req: { user: any }) {
    const user = req.user;

    if (!user) throw new UnauthorizedException('User not logged in');

    return {
      id: user.sub,
      name: user.name,
      picture: user.picture ?? null,
    };
  }

  @ApiOperation({ summary: 'Logout' })
  @UseGuards(JWTAuthGuard)
  @Get('/logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { success: true };
  }
}
