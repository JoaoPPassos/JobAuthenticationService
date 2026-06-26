import type { User } from '@domain/entities/User.entity';
import type { IUsersRepository } from '@domain/ports/IUsersRepository.interface';
import type { IEmailCredentialRepository, PublicEmailCredential } from '@domain/ports/IEmailCredentialRepository.interface';

export type MeResponse = Omit<User, 'password' | 'reset_password_code' | 'reset_password_expires_at'> & {
  email_credentials: PublicEmailCredential[];
};

export class GetMeUseCase {
  constructor(
    private readonly usersRepo: IUsersRepository,
    private readonly credentialsRepo: IEmailCredentialRepository,
  ) {}

  async execute(userId: string): Promise<MeResponse> {
    const user = await this.usersRepo.findById(userId);
    const credentials = await this.credentialsRepo.findByUserId(userId);

    const { password: _, reset_password_code: __, reset_password_expires_at: ___, ...publicUser } = user;

    return { ...publicUser, email_credentials: credentials };
  }
}
