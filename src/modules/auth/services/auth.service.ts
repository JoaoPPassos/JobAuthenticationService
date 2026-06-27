import { Injectable } from '@nestjs/common';
import { CreateUserUseCase } from '@domain/use-cases/auth/create-user.use-case';
import { LoginUserUseCase } from '@domain/use-cases/auth/login-user.use-case';
import { ForgotPasswordUseCase } from '@domain/use-cases/auth/forgot-password.use-case';
import { ValidateResetCodeUseCase } from '@domain/use-cases/auth/validate-reset-code.use-case';
import { ResetPasswordUseCase } from '@domain/use-cases/auth/reset-password.use-case';
import { ActiveUserUseCase } from '@domain/use-cases/auth/active-user.use-case';
import { RefreshTokenUseCase } from '@domain/use-cases/auth/refresh-token.use-case';
import {
  ValidateTokenUseCase,
  type ValidatedToken,
} from '@domain/use-cases/auth/validate-token.use-case';
import { UsersRepository } from '@infrastructure/repositories/users.repository';
import { TokenService } from '@infrastructure/services/token.service';
import { HashRepository } from '@infrastructure/repositories/hash.repository';
import { MailRepository } from '@infrastructure/repositories/mail.repository';
import { TokenCacheRepository } from '@infrastructure/repositories/token-cache.repository';
import { EmailPublisher } from '@infrastructure/messaging/email.publisher';
import { AuthLogin, AuthTokens } from '@module/auth/types/AuthLogin.type';
import { User } from '@domain/entities/User.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly tokenService: TokenService,
    private readonly hashRepository: HashRepository,
    private readonly emailRepository: MailRepository,
    private readonly emailPublisher: EmailPublisher,
    private readonly tokenCacheRepository: TokenCacheRepository,
  ) {}

  async signUp(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    const useCase = new CreateUserUseCase(
      this.usersRepository,
      this.hashRepository,
    );
    const user = await useCase.execute(data);

    const confirmationToken =
      await this.tokenService.generateEmailConfirmationToken(user.email);
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const confirmationUrl = `${baseUrl}/auth/confirm?token=${confirmationToken}`;

    await this.emailPublisher.publish({
      to: user.email,
      subject: 'Your Account must be activated!',
      html: this.emailRepository.mapAccountConfirmationTemplate({
        name: user.name,
        confirmationUrl,
        appName: process.env.APP_NAME || 'JobHub',
      }),
    });

    return user;
  }

  async login(data: { email: string; password: string }): Promise<AuthLogin> {
    const useCase = new LoginUserUseCase(
      this.usersRepository,
      this.tokenService,
      this.hashRepository,
    );
    return useCase.execute(data);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const useCase = new RefreshTokenUseCase(
      this.tokenService,
      this.usersRepository,
    );
    return useCase.execute(refreshToken);
  }

  async activate(token: string): Promise<User> {
    const useCase = new ActiveUserUseCase(
      this.tokenService,
      this.usersRepository,
    );
    return useCase.execute(token);
  }

  async forgotPassword(email: string): Promise<void> {
    const useCase = new ForgotPasswordUseCase(
      this.usersRepository,
      this.hashRepository,
    );
    const result = await useCase.execute(email);

    if (!result) return;

    await this.emailPublisher.publish({
      to: result.user.email,
      subject: `Recuperação de senha — ${process.env.APP_NAME || 'JobHub'}`,
      html: this.emailRepository.mapPasswordResetTemplate({
        name: result.user.name,
        code: result.code,
        appName: process.env.APP_NAME || 'JobHub',
      }),
    });
  }

  async verifyResetCode(email: string, code: string): Promise<string> {
    const useCase = new ValidateResetCodeUseCase(
      this.usersRepository,
      this.tokenService,
      this.hashRepository,
    );
    return useCase.execute(email, code);
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    const useCase = new ResetPasswordUseCase(
      this.tokenService,
      this.usersRepository,
      this.hashRepository,
    );
    return useCase.execute(resetToken, newPassword);
  }

  async validateToken(token: string): Promise<ValidatedToken> {
    const useCase = new ValidateTokenUseCase(
      this.tokenService,
      this.tokenCacheRepository,
    );
    return useCase.execute(token);
  }
}
