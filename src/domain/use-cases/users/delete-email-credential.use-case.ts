import type { IEmailCredentialRepository } from '@domain/ports/IEmailCredentialRepository.interface';

export class DeleteEmailCredentialUseCase {
  constructor(private readonly credentialsRepo: IEmailCredentialRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    return this.credentialsRepo.softDelete(id, userId);
  }
}
