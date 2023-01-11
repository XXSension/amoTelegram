import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from './accounts/accounts.module';
import { config } from './config';
import { TelegramModule } from './telegram/telegram.module';
import { RequestAmoModule } from './request-amo/request-amo.module';
import { ReportTemplateModule } from './report-template/report-template.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'db.onix-tech.ru',
      port: 3306,
      username: 'timur',
      database: 'report_to_telegram_timur',
      password: 'q@FqYM(krB!36V1n',
      entities: ['dist/**/*.entity.js'],
      synchronize: false,
    }),
    AccountsModule,
    TelegramModule,
    RequestAmoModule,
    ReportTemplateModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
