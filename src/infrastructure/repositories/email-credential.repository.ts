import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { EmailCredential } from '@domain/entities/EmailCredential.entity';
import type {
  IEmailCredentialRepository,
  PublicEmailCredential,
} from '@domain/ports/IEmailCredentialRepository.interface';
import { NotFoundException } from '@shared/exceptions/exceptions';

@Injectable()
export class EmailCredentialRepository implements IEmailCredentialRepository {
  constructor(
    @InjectRepository(EmailCredential)
    private readonly repo: Repository<EmailCredential>,
  ) {}

  async findByUserId(userId: string): Promise<PublicEmailCredential[]> {
    const credentials = await this.repo.findBy({
      id_user: userId,
      deleted_at: IsNull(),
    });
    return credentials.map(({ password: _, ...rest }) => rest);
  }

  async create(data: {
    id_user: string;
    email: string;
    password: string;
  }): Promise<PublicEmailCredential> {
    const saved = await this.repo.save(this.repo.create(data));
    const { password: _, ...rest } = saved;
    return rest;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<{ email: string; password: string }>,
  ): Promise<PublicEmailCredential> {
    const credential = await this.repo.findOneBy({
      id,
      id_user: userId,
      deleted_at: IsNull(),
    });
    if (!credential) throw new NotFoundException('Email credential not found');

    Object.assign(credential, data);
    const saved = await this.repo.save(credential);
    const { password: _, ...rest } = saved;
    return rest;
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const credential = await this.repo.findOneBy({
      id,
      id_user: userId,
      deleted_at: IsNull(),
    });
    if (!credential) throw new NotFoundException('Email credential not found');
    await this.repo.softDelete({ id });
  }
}
