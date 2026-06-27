import type { EmailCredential } from '@domain/entities/EmailCredential.entity';

export type PublicEmailCredential = Omit<EmailCredential, 'password'>;

export interface IEmailCredentialRepository {
  findByUserId(userId: string): Promise<PublicEmailCredential[]>;
  create(data: {
    id_user: string;
    email: string;
    password: string;
  }): Promise<PublicEmailCredential>;
  update(
    id: string,
    userId: string,
    data: Partial<{ email: string; password: string }>,
  ): Promise<PublicEmailCredential>;
  softDelete(id: string, userId: string): Promise<void>;
}
