import type { ITokenService } from '@domain/ports/ITokenService.interface';
import type { IUsersRepository } from '@domain/ports/IUsersRepository.interface';
import type { IHashService } from '@domain/ports/IHashService.interface';

export class ResetPasswordUseCase {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly usersRepository: IUsersRepository,
    private readonly hashService: IHashService,
  ) {}

  async execute(resetToken: string, newPassword: string): Promise<void> {
    const payload = await this.tokenService.verifyPasswordResetToken(resetToken);
    const hashedPassword = await this.hashService.hash(newPassword);

    await this.usersRepository.updatePassword(payload.sub, hashedPassword);
    await this.usersRepository.clearResetCode(payload.sub);
  }
}
