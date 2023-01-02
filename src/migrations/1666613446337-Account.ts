import { MigrationInterface, QueryRunner } from 'typeorm';

export class Account1666613446337 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`account\`(
      \`id\` int AUTO_INCREMENT primary key NOT NULL,
      \`amoId\` int NOT NULL,
      \`domain\` varchar(255) NOT NULL,
      \`acessToken\` varchar(1000) NOT NULL,
      \`refreshToken\` varchar(1000) NOT NULL,
      \`expire\` int NOT NULL);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`account\``);
  }
}
