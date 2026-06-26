import type { User } from '@domain/entities/User.entity';

export interface IUsersRepository {
  findById(id: string): Promise<User>;
}
