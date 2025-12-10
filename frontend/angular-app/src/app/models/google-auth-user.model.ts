export interface IGoogleAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number; // in seconds
  idToken?: string;
  tokenType: string;
  scope?: string;
}

export interface IGoogleUserInfo {
  sub: string; // Google user ID
  email?: string;
  emailVerified?: boolean;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  locale?: string;
}

export interface IGoogleAuthUser {
  email?: string;
  name?: string;
  picture?: string;
  locale?: string;
}
