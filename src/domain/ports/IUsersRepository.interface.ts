import type { User } from '@domain/entities/User.entity';

export interface IUsersRepository {
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  save(data: { name: string; email: string; password: string }): Promise<User>;
  activate(email: string): Promise<User>;
  saveResetCode(
    userId: string,
    hashedCode: string,
    expiresAt: Date,
  ): Promise<void>;
  clearResetCode(userId: string): Promise<void>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
}
