import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@domain/entities/User.entity';
import type { IUsersRepository } from '@domain/ports/IUsersRepository.interface';
import { NotFoundException } from '@shared/exceptions/exceptions';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async save(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    return this.userRepository.save(data);
  }

  async activate(email: string): Promise<User> {
    const user = await this.userRepository.findOneByOrFail({ email });
    if (!user.is_active) {
      user.is_active = true;
      await this.userRepository.save(user);
    }
    return user;
  }

  async saveResetCode(
    userId: string,
    hashedCode: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      reset_password_code: hashedCode,
      reset_password_expires_at: expiresAt,
    });
  }

  async clearResetCode(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      reset_password_code: null,
      reset_password_expires_at: null,
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, { password: hashedPassword });
  }
}
