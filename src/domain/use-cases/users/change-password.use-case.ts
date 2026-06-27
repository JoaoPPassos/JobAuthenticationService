import type { IAuth } from '@domain/ports/IAuth.interface';
import type { IHashService } from '@domain/ports/IHashService.interface';
import type { IUsersRepository } from '@domain/ports/IUsersRepository.interface';
import {
  BadRequestException,
  ForbiddenException,
} from '@shared/exceptions/exceptions';

export class ChangePasswordUseCase {
  constructor(
    private readonly usersRepo: IUsersRepository,
    private readonly authRepo: IAuth,
    private readonly hashService: IHashService,
  ) {}

  async execute(
    requesterId: string,
    targetUserId: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    if (requesterId !== targetUserId) {
      throw new ForbiddenException('You can only change your own password');
    }

    const user = await this.usersRepo.findById(targetUserId);

    if (!user.reset_password_code || !user.reset_password_expires_at) {
      throw new BadRequestException(
        'No password change request found. Request a code first',
      );
    }

    if (new Date() > user.reset_password_expires_at) {
      throw new BadRequestException('Code has expired');
    }

    const isValid = await this.hashService.compare(
      code,
      user.reset_password_code,
    );
    if (!isValid) {
      throw new BadRequestException('Invalid code');
    }

    const hashedPassword = await this.hashService.hash(newPassword);
    await this.authRepo.updatePassword(targetUserId, hashedPassword);
    await this.authRepo.clearResetCode(targetUserId);
  }
}
