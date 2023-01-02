import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ReportTemplateService } from 'src/report-template/report-template.service';
import { Cron } from '@nestjs/schedule';
import { logger } from 'src/logger/logger';
import { RequestAmoService } from '../request-amo/request-amo.service';

@Injectable()
export class TelegramService {
  logger: Logger;
  token: string;
  chatId: number;
  constructor(
    @Inject(forwardRef(() => ReportTemplateService))
    private reportTemplateService: ReportTemplateService,
    private configService: ConfigService,
  ) {
    this.token = this.configService.get('token');
    this.chatId = +this.configService.get('chatId');
    this.logger = new Logger();
  }

  async requestInTheTelegram(template: string): Promise<void> {
    await axios
      .get(`https://api.telegram.org/bot${this.token}/sendMessage`, {
        params: {
          chat_id: this.chatId,
          text: template,
          parse_mode: 'html',
        },
      })
      .then((response) => {
        response;
      })
      .catch((err) => logger.error(err));
  }

  @Cron('0 0 9,12,15,18 * * *')
  async onModule(): Promise<void> {
    console.log(Math.round(Number(new Date()) / 1000) + 86400);
    console.log(
      await this.requestInTheTelegram(
        await this.reportTemplateService.ManagersReportTemplate([
          7326229, 8353078, 8829631,
        ]),
      ),
    );
  }

  @Cron('0 0 20 * * *')
  async onModuleI(): Promise<void> {
    await this.requestInTheTelegram(
      await this.reportTemplateService.acceptedTemplate(),
    );
  }
}
