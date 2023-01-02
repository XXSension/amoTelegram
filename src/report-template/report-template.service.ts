import { Injectable } from '@nestjs/common';
import { RequestAmoService } from 'src/request-amo/request-amo.service';
import * as fs from 'fs';

@Injectable()
export class ReportTemplateService {
  numberOfApplication: number;
  constructor(private requestAmoService: RequestAmoService) {
    this.numberOfApplication = 45;
  }

  AmountFormatting(amout: number): string {
    return amout.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  summationOfElements(array: Array<number>) {
    return array.reduce((sum, current) => sum + current, 0);
  }

  async leadsOfferController(
    eventsArray: Array<any>,
    managerId: number,
  ): Promise<object> {
    const leads = await this.requestAmoService.getLeads();
    const leadsOffer = eventsArray.filter(
      (event) =>
        event.value_after.length !== 0 &&
        event.value_after[0].hasOwnProperty('lead_status') &&
        event.created_by === managerId &&
        event.type === 'lead_status_changed' &&
        event.value_after[0].lead_status.id === 41893999 &&
        event.value_after[0].lead_status.pipeline_id === 4542283,
    );
    const arrayOfSentKP = [];
    for (const lead of leads) {
      for (const event of leadsOffer) {
        if (lead.id === event.entity_id) {
          arrayOfSentKP.push(lead);
        }
      }
    }
    return {
      count: arrayOfSentKP.length,
      sum: this.summationOfElements(arrayOfSentKP.map((lead) => lead.price)),
    };
  }

  async ManagersReportTemplate(managersId: Array<number>): Promise<string> {
    const managers = await this.requestAmoService.getManagers();
    const tasks = await this.requestAmoService.AmoTasks();
    const events = await this.requestAmoService.getEvents();
    const leadsColds = events.filter(
      (event) =>
        event.value_before.length !== 0 &&
        event.value_before[0].hasOwnProperty('lead_status'),
    );
    const arrayManagers = [];

    for (const managerId of managersId) {
      let template = '';
      template += this.lineCreation(
        'Менеджер',
        managers.filter((manager) => manager.id === managerId),
      );
      template += this.lineCreation(
        'Событий',
        events.filter((event) => event.created_by === managerId).length,
      );
      template += this.lineCreation(
        'Завершено задач',
        tasks.filter(
          (task) =>
            task.responsible_user_id === managerId &&
            task.is_completed === true,
        ).length,
      );
      template += this.lineCreation(
        'Исходящих звонков',
        events.filter(
          (event) =>
            event.created_by === managerId && event.type === 'outgoing_call',
        ).length,
      );
      template += this.lineCreation(
        'Назначено встреч',
        tasks.filter(
          (task) =>
            task.is_completed === false &&
            task.task_type_id === 2 &&
            task.responsible_user_id === managerId,
        ).length,
      );
      template += this.lineCreation(
        'Проведено встреч',
        tasks.filter(
          (task) =>
            task.task_type_id === 2 &&
            task.responsible_user_id === managerId &&
            task.is_completed === true &&
            task.result.text === 'Встреча проведена.',
        ).length,
      );
      template += this.lineCreation(
        'Отправлено КП',
        await this.leadsOfferController(events, managerId),
      );
      template += this.lineCreation(
        'Обработано из ХБ',
        leadsColds.filter(
          (event) =>
            event.created_by === managerId &&
            event.value_before[0].lead_status.pipeline_id === 5663368 &&
            event.value_before[0].lead_status.id === 49853296,
        ).length,
      );

      arrayManagers.push(template);
    }

    return arrayManagers.join('\n------------------\n\n');
  }
  lineCreation(text: string, essence: any) {
    if (text.indexOf('Менеджер') !== -1) {
      return `${text}: <strong>${essence[0].name}</strong>\n\n`;
    } else if (text.indexOf('КП') !== -1) {
      return `${text}: ${essence.count} на сумму ${this.AmountFormatting(
        essence.sum,
      )} рублей\n`;
    }
    return `${text}: ${essence}\n`;
  }
  async acceptedTemplate() {
    const remainder = await this.managersAccepted();
    return `Сегодня было принято ${remainder}\nВ это месяце осталось заявок ${this.counterDates(
      remainder,
    )}`;
  }

  counterDates(remainder: number): number {
    const Application = fs.readFileSync('dist/logs/numberOfapplications.txt');
    if (new Date().getDate() === 1) {
      fs.writeFileSync('dist/logs/numberOfapplications.txt', '45');
    } else {
      fs.writeFileSync(
        'dist/logs/numberOfapplications.txt',
        String(Number(Application) - remainder),
      );
    }
    return Number(Application) - remainder;
  }
  async managersAccepted(): Promise<number> {
    const managersEvent = await this.requestAmoService.countApplication();
    const acceptedManagers = await this.requestAmoService.countAmoCrm();
    return this.filtersAccepter(managersEvent, acceptedManagers);
  }
  filtersAccepter(
    managersEvent: Array<number>,
    acceptedManagers: Array<any>,
  ): number {
    return acceptedManagers.filter(
      (event) => managersEvent.indexOf(event.entity_id) !== -1,
    ).length;
  }
}
