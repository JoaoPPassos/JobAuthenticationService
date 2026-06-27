import { User } from '@domain/entities/User.entity';
import type { IUsersRepository } from '@domain/ports/IUsersRepository.interface';
import type { IHashService } from '@domain/ports/IHashService.interface';

export class ForgotPasswordUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly hashService: IHashService,
  ) {}

  async execute(email: string): Promise<{ user: User; code: string } | null> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return null;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await this.hashService.hash(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.usersRepository.saveResetCode(user.id, hashedCode, expiresAt);

    return { user, code };
  }
}
