import type {
  IEmailCredentialRepository,
  PublicEmailCredential,
} from '@domain/ports/IEmailCredentialRepository.interface';
import type { IEncryptionService } from '@domain/ports/IEncryptionService.interface';

export class CreateEmailCredentialUseCase {
  constructor(
    private readonly credentialsRepo: IEmailCredentialRepository,
    private readonly encryption: IEncryptionService,
  ) {}

  async execute(
    userId: string,
    data: { email: string; password: string },
  ): Promise<PublicEmailCredential> {
    const encryptedPassword = this.encryption.encrypt(data.password);
    return this.credentialsRepo.create({
      id_user: userId,
      email: data.email,
      password: encryptedPassword,
    });
  }
}
