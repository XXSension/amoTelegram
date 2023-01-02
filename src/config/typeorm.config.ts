import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
const configService = new ConfigService();
import { config } from 'dotenv';
config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: configService.get('TYPEORM_HOST'),
  port: +configService.get('TYPEORM_PORT'),
  username: configService.get('TYPEORM_USERNAME'),
  database: configService.get('TYPEORM_DATABASE'),
  password: configService.get('TYPEORM_PASSWORD'),
  synchronize: false,
  logging: true,
  entities: [configService.get('TYPEORM_ENTITIES')],
  migrations: [configService.get('TYPEORM_MIGRATIONS')],
};
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
