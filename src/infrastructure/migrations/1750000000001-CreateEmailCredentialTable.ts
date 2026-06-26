import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmailCredentialTable1750000000001 implements MigrationInterface {
  name = 'CreateEmailCredentialTable1750000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "email_credential" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "id_user" uuid NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        CONSTRAINT "PK_email_credential_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_email_credential_user" FOREIGN KEY ("id_user")
          REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_email_credential_id_user" ON "email_credential" ("id_user")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_email_credential_id_user"`);
    await queryRunner.query(`DROP TABLE "email_credential"`);
  }
}
