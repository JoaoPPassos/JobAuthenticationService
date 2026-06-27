import { Injectable } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { UnauthorizedException } from '@shared/exceptions/exceptions';
import {
  type AuthTokenPayload,
  type EmailConfirmationTokenPayload,
  type ITokenService,
  type PasswordResetTokenPayload,
  type VerifiedAccessToken,
} from '@domain/ports/ITokenService.interface';
import 'dotenv/config';

@Injectable()
export class TokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  private getRefreshSecret(): string {
    return process.env.HASH_REFRESH_TOKEN || process.env.HASH_TOKEN || '';
  }

  async generateAccessToken(data: AuthTokenPayload): Promise<string> {
    const expiresIn =
      (process.env.EXPIRES_ACCESS_TOKEN as JwtSignOptions['expiresIn']) || '1d';
    return this.jwtService.signAsync(data, {
      secret: process.env.HASH_TOKEN,
      expiresIn,
    });
  }

  async generateRefreshToken(data: AuthTokenPayload): Promise<string> {
    const expiresIn =
      (process.env.EXPIRES_REFRESH_TOKEN as JwtSignOptions['expiresIn']) ||
      '7d';
    return this.jwtService.signAsync(data, {
      secret: this.getRefreshSecret(),
      expiresIn,
    });
  }

  async verifyAccessToken(token: string): Promise<VerifiedAccessToken> {
    try {
      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(token, { secret: process.env.HASH_TOKEN });

      if (
        typeof payload.id !== 'string' ||
        typeof payload.email !== 'string' ||
        typeof payload.name !== 'string' ||
        typeof payload.is_active !== 'boolean' ||
        typeof payload.exp !== 'number'
      ) {
        throw new UnauthorizedException('Invalid access token payload');
      }

      return {
        payload: {
          id: payload.id,
          email: payload.email,
          name: payload.name,
          is_active: payload.is_active,
        },
        expiresAt: payload.exp,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<AuthTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(token, { secret: this.getRefreshSecret() });

      if (
        typeof payload.id !== 'string' ||
        typeof payload.email !== 'string' ||
        typeof payload.name !== 'string' ||
        typeof payload.is_active !== 'boolean'
      ) {
        throw new UnauthorizedException('Invalid refresh token payload');
      }

      return {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        is_active: payload.is_active,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async generatePasswordResetToken(
    userId: string,
    email: string,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, email, type: 'password_reset' },
      { secret: process.env.HASH_TOKEN, expiresIn: '15m' },
    );
  }

  async verifyPasswordResetToken(
    token: string,
  ): Promise<PasswordResetTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(token, { secret: process.env.HASH_TOKEN });

      if (
        typeof payload.sub !== 'string' ||
        typeof payload.email !== 'string' ||
        payload.type !== 'password_reset'
      ) {
        throw new UnauthorizedException('Invalid reset token');
      }

      return { sub: payload.sub, email: payload.email };
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  async generateEmailConfirmationToken(email: string): Promise<string> {
    return this.jwtService.signAsync(
      { email, type: 'email_confirmation' },
      { secret: process.env.HASH_TOKEN, expiresIn: '24h' },
    );
  }

  async verifyEmailConfirmationToken(
    token: string,
  ): Promise<EmailConfirmationTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(token, { secret: process.env.HASH_TOKEN });

      if (
        typeof payload.email !== 'string' ||
        payload.type !== 'email_confirmation'
      ) {
        throw new UnauthorizedException('Invalid confirmation token');
      }

      return { email: payload.email };
    } catch {
      throw new UnauthorizedException('Invalid or expired confirmation token');
    }
  }
}
