import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleModule } from 'src/libs/google/google.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleOauthStrategy } from './strategies/google-oauth.strategy';


const imports = [
  PassportModule,
  JwtModule.registerAsync({
    useFactory: async () => {
      return {
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: '3600s', //1hr
        },
      };
    },
    inject: [ConfigService],
  }),
  GoogleModule
];

const controllers = [GoogleAuthController];
const providers = [GoogleAuthService, JwtStrategy, GoogleOauthStrategy];

@Module({
  imports: imports,
  controllers: controllers,
  providers: providers,
})
export class GoogleAuthModule {}