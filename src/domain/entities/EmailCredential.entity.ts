import { BaseEntity } from '@shared/entitie/base.entity';
import { Exclude } from 'class-transformer';
import { Column, Entity } from 'typeorm';

@Entity('email_credential')
export class EmailCredential extends BaseEntity {
  @Column({ type: 'uuid' })
  id_user!: string;

  @Column({ type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar' })
  @Exclude()
  password!: string;
}
