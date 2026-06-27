import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@infrastructure/repositories/users.repository';
import { EmailCredentialRepository } from '@infrastructure/repositories/email-credential.repository';
import { HashRepository } from '@infrastructure/repositories/hash.repository';
import { MailRepository } from '@infrastructure/repositories/mail.repository';
import { EmailPublisher } from '@infrastructure/messaging/email.publisher';
import { EncryptionService } from '@infrastructure/services/encryption.service';
import {
  GetMeUseCase,
  type MeResponse,
} from '@domain/use-cases/users/get-me.use-case';
import { GetEmailCredentialsUseCase } from '@domain/use-cases/users/get-email-credentials.use-case';
import { CreateEmailCredentialUseCase } from '@domain/use-cases/users/create-email-credential.use-case';
import { UpdateEmailCredentialUseCase } from '@domain/use-cases/users/update-email-credential.use-case';
import { DeleteEmailCredentialUseCase } from '@domain/use-cases/users/delete-email-credential.use-case';
import { RequestPasswordChangeUseCase } from '@domain/use-cases/users/request-password-change.use-case';
import { ChangePasswordUseCase } from '@domain/use-cases/users/change-password.use-case';
import type { PublicEmailCredential } from '@domain/ports/IEmailCredentialRepository.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly credentialRepository: EmailCredentialRepository,
    private readonly hashRepository: HashRepository,
    private readonly mailRepository: MailRepository,
    private readonly emailPublisher: EmailPublisher,
    private readonly encryptionService: EncryptionService,
  ) {}

  async getMe(userId: string): Promise<MeResponse> {
    const useCase = new GetMeUseCase(
      this.usersRepository,
      this.credentialRepository,
    );
    return useCase.execute(userId);
  }

  async getEmailCredentials(userId: string): Promise<PublicEmailCredential[]> {
    const useCase = new GetEmailCredentialsUseCase(this.credentialRepository);
    return useCase.execute(userId);
  }

  async createEmailCredential(
    userId: string,
    data: { email: string; password: string },
  ): Promise<PublicEmailCredential> {
    const useCase = new CreateEmailCredentialUseCase(
      this.credentialRepository,
      this.encryptionService,
    );
    return useCase.execute(userId, data);
  }

  async updateEmailCredential(
    id: string,
    userId: string,
    data: { email?: string; password?: string },
  ): Promise<PublicEmailCredential> {
    const useCase = new UpdateEmailCredentialUseCase(
      this.credentialRepository,
      this.encryptionService,
    );
    return useCase.execute(id, userId, data);
  }

  async deleteEmailCredential(id: string, userId: string): Promise<void> {
    const useCase = new DeleteEmailCredentialUseCase(this.credentialRepository);
    return useCase.execute(id, userId);
  }

  async requestPasswordChange(userId: string): Promise<void> {
    const useCase = new RequestPasswordChangeUseCase(
      this.usersRepository,
      this.hashRepository,
    );
    const result = await useCase.execute(userId);

    await this.emailPublisher.publish({
      to: result.user.email,
      subject: `Código de alteração de senha — ${process.env.APP_NAME || 'JobHub'}`,
      html: this.mailRepository.mapPasswordResetTemplate({
        name: result.user.name,
        code: result.code,
        appName: process.env.APP_NAME || 'JobHub',
      }),
    });
  }

  async changePassword(
    requesterId: string,
    targetUserId: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    const useCase = new ChangePasswordUseCase(
      this.usersRepository,
      this.hashRepository,
    );
    return useCase.execute(requesterId, targetUserId, code, newPassword);
  }
}
