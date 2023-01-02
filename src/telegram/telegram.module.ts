import { Module } from '@nestjs/common';
import { AccountsModule } from 'src/accounts/accounts.module';
import { TelegramService } from './telegram.service';
import { ReportTemplateModule } from 'src/report-template/report-template.module';

@Module({
  providers: [TelegramService],
  imports: [AccountsModule, ReportTemplateModule],
})
export class TelegramModule {}
