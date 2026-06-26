import type { IEmailCredentialRepository, PublicEmailCredential } from '@domain/ports/IEmailCredentialRepository.interface';
import type { IEncryptionService } from '@domain/ports/IEncryptionService.interface';

export class UpdateEmailCredentialUseCase {
  constructor(
    private readonly credentialsRepo: IEmailCredentialRepository,
    private readonly encryption: IEncryptionService,
  ) {}

  async execute(
    id: string,
    userId: string,
    data: { email?: string; password?: string },
  ): Promise<PublicEmailCredential> {
    const update: Partial<{ email: string; password: string }> = {};

    if (data.email) update.email = data.email;
    if (data.password) update.password = this.encryption.encrypt(data.password);

    return this.credentialsRepo.update(id, userId, update);
  }
}
