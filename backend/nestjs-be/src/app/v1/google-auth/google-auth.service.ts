import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Profile } from 'passport';


@Injectable()
export class GoogleAuthService {
  
  private readonly logger = new Logger(GoogleAuthService.name);
  constructor(private readonly jwtService: JwtService) {}

  public login(user: Profile) {
    const payload = {
      name: user.username,
      sub: user.id,
    };
    return this.jwtService.sign(payload);
  }
 
}