import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleModule } from 'src/libs/google/google.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleOauthStrategy } from './strategies/google-oauth.strategy';


const imports = [
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: {
        expiresIn: Number(configService.get('JWT_EXPIRATION_TIME_SECONDS')),
      },
    }),
    inject: [ConfigService],
  }),
  GoogleModule,
];

const controllers = [GoogleAuthController];
const providers = [GoogleAuthService, JwtStrategy, GoogleOauthStrategy];

@Module({
  imports,
  controllers,
  providers,
})
export class GoogleAuthModule {}
