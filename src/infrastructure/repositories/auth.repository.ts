import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@shared/exceptions/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { User } from '@domain/entities/User.entity';
import {
  type AuthTokenPayload,
  type EmailConfirmationTokenPayload,
  IAuth,
  type PasswordResetTokenPayload,
  type VerifiedAccessToken,
} from '@domain/ports/IAuth.interface';
import 'dotenv/config';

@Injectable()
export class AuthRepository implements IAuth {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private getRefreshSecret(): string {
    return process.env.HASH_REFRESH_TOKEN || process.env.HASH_TOKEN || '';
  }

  async authenticate(data: object): Promise<string> {
    try {
      const expiresIn =
        (process.env.EXPIRES_ACCESS_TOKEN as JwtSignOptions['expiresIn']) || '1d';
      return await this.jwtService.signAsync(data, {
        secret: process.env.HASH_TOKEN,
        expiresIn,
      });
    } catch (error) {
      console.error(error);
    }
    return '';
  }

  async authenticateRefresh(data: object): Promise<string> {
    try {
      const expiresIn =
        (process.env.EXPIRES_REFRESH_TOKEN as JwtSignOptions['expiresIn']) || '7d';
      return await this.jwtService.signAsync(data, {
        secret: this.getRefreshSecret(),
        expiresIn,
      });
    } catch (error) {
      console.error(error);
    }
    return '';
  }

  async verifyRefreshToken(token: string): Promise<AuthTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<Record<string, unknown>>(token, {
        secret: this.getRefreshSecret(),
      });

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

  async save(data: { name: string; email: string; password: string }): Promise<User> {
    return this.userRepository.save(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findByID(id: string): Promise<User> {
    return this.userRepository.findOneByOrFail({ id });
  }

  async activate(email: string): Promise<User> {
    const user = await this.userRepository.findOneByOrFail({ email });
    if (!user.is_active) {
      user.is_active = true;
      await this.userRepository.save(user);
    }
    return user;
  }

  async saveResetCode(userId: string, hashedCode: string, expiresAt: Date): Promise<void> {
    await this.userRepository.update(userId, {
      reset_password_code: hashedCode,
      reset_password_expires_at: expiresAt,
    });
  }

  async clearResetCode(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      reset_password_code: null,
      reset_password_expires_at: null,
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  async generatePasswordResetToken(userId: string, email: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, email, type: 'password_reset' },
      { secret: process.env.HASH_TOKEN, expiresIn: '15m' },
    );
  }

  async verifyPasswordResetToken(token: string): Promise<PasswordResetTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<Record<string, unknown>>(token, {
        secret: process.env.HASH_TOKEN,
      });

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

  async verifyEmailConfirmationToken(token: string): Promise<EmailConfirmationTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<Record<string, unknown>>(token, {
        secret: process.env.HASH_TOKEN,
      });

      if (typeof payload.email !== 'string' || payload.type !== 'email_confirmation') {
        throw new UnauthorizedException('Invalid confirmation token');
      }

      return { email: payload.email };
    } catch {
      throw new UnauthorizedException('Invalid or expired confirmation token');
    }
  }

  async verifyAccessToken(token: string): Promise<VerifiedAccessToken> {
    try {
      const payload = await this.jwtService.verifyAsync<Record<string, unknown>>(token, {
        secret: process.env.HASH_TOKEN,
      });

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
}
