import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IUserPayload } from '../models/google-auth-user.model';


@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);

  constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) {}

  /** Generate JWT from Google profile */
  public async login(user: IUserPayload) {

    // TODO: save/update user in DB here
    // await this.userService.upsertUser(user);
    this.logger.debug(`User successfully logged in via Google API: ${user.name}`);
    return this.generateJwt(user);
  }

  public async generateJwt(user: IUserPayload) {
    const payload = { sub: user.sub, email: user.email, name: user.name }; 
    return this.jwtService.sign(payload); 
  }

}
