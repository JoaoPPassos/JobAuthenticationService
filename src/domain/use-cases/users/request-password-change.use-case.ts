import type { User } from '@domain/entities/User.entity';
import type { IAuth } from '@domain/ports/IAuth.interface';
import type { IHashService } from '@domain/ports/IHashService.interface';
import type { IUsersRepository } from '@domain/ports/IUsersRepository.interface';

export class RequestPasswordChangeUseCase {
  constructor(
    private readonly usersRepo: IUsersRepository,
    private readonly authRepo: IAuth,
    private readonly hashService: IHashService,
  ) {}

  async execute(userId: string): Promise<{ user: User; code: string }> {
    const user = await this.usersRepo.findById(userId);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await this.hashService.hash(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.authRepo.saveResetCode(userId, hashedCode, expiresAt);

    return { user, code };
  }
}
