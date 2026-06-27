import { User } from '@domain/entities/User.entity';
import type { ITokenService } from '@domain/ports/ITokenService.interface';
import type { IUsersRepository } from '@domain/ports/IUsersRepository.interface';

export class ActiveUserUseCase {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(token: string): Promise<User> {
    const { email } =
      await this.tokenService.verifyEmailConfirmationToken(token);
    return this.usersRepository.activate(email);
  }
}
