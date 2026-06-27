import { User } from '@domain/entities/User.entity';
import type { IUsersRepository } from '@domain/ports/IUsersRepository.interface';
import type { IHashService } from '@domain/ports/IHashService.interface';

export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly hashService: IHashService,
  ) {}

  async execute(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    const hashedPassword = await this.hashService.hash(data.password);
    return this.usersRepository.save({ ...data, password: hashedPassword });
  }
}
