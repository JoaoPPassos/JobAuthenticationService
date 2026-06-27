export type AuthTokenPayload = {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
};

export type VerifiedAccessToken = {
  payload: AuthTokenPayload;
  expiresAt: number;
};

export type PasswordResetTokenPayload = {
  sub: string;
  email: string;
};

export type EmailConfirmationTokenPayload = {
  email: string;
};

export interface ITokenService {
  generateAccessToken(data: AuthTokenPayload): Promise<string>;
  generateRefreshToken(data: AuthTokenPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<VerifiedAccessToken>;
  verifyRefreshToken(token: string): Promise<AuthTokenPayload>;
  generatePasswordResetToken(userId: string, email: string): Promise<string>;
  verifyPasswordResetToken(token: string): Promise<PasswordResetTokenPayload>;
  generateEmailConfirmationToken(email: string): Promise<string>;
  verifyEmailConfirmationToken(
    token: string,
  ): Promise<EmailConfirmationTokenPayload>;
}
