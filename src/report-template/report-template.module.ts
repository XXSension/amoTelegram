import { Module } from '@nestjs/common';
import { RequestAmoModule } from 'src/request-amo/request-amo.module';
import { ReportTemplateService } from './report-template.service';

@Module({
  providers: [ReportTemplateService],
  imports: [RequestAmoModule],
  exports: [ReportTemplateService],
})
export class ReportTemplateModule {}
