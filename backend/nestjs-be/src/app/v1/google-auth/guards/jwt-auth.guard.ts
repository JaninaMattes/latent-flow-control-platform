import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Claims } from '../decorator/access-token-claims.decorator';

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JWTAuthGuard.name);

    handleRequest<TUser = Claims>(err: any, user: any, info: any, context: any, status?: any): TUser {

    try {
        const result = super.handleRequest<Claims>(err, user, info, context, status);
        this.logger.debug(`User authenticated via JWT cookie.`);
        return result as unknown as TUser;
    } catch (error) {
        this.logger.warn(`User unauthenticated. Error: ${error?.message}`);
        throw new UnauthorizedException('User is not authorized to perform this action.');
    }
    }
}
