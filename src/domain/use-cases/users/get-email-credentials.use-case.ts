import type {
  IEmailCredentialRepository,
  PublicEmailCredential,
} from '@domain/ports/IEmailCredentialRepository.interface';

export class GetEmailCredentialsUseCase {
  constructor(private readonly credentialsRepo: IEmailCredentialRepository) {}

  async execute(userId: string): Promise<PublicEmailCredential[]> {
    return this.credentialsRepo.findByUserId(userId);
  }
}
