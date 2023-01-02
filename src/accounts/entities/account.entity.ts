import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'account',
})
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amoId: number;

  @Column()
  domain: string;

  @Column({ type: 'varchar', length: 1000 })
  accessToken: string;

  @Column({ type: 'varchar', length: 1000 })
  refreshToken: string;

  @Column()
  expire: number;

  get url(): string {
    return `https://${this.domain}`;
  }
}
