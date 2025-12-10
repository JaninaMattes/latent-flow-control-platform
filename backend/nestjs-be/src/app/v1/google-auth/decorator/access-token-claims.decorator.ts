import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface Claims {
  sub: string;       // Google user ID
  email: string;     // Google email
  azp: string;       // authorized party / client ID
  iat: number;       // issued at timestamp
  exp: number;       // expiration timestamp
  iss: string;       // issuer
}

/** Extracts current user from request. Returns impersonated user if impersonation header is present. */
export const AccessTokenClaims = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const { user } = ctx.switchToHttp().getRequest<{ user: Claims }>();
        return user ?? null; // user is null if not exists
    }
);