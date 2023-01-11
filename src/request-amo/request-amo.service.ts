import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { AccountsService } from 'src/accounts/accounts.service';
import { AxiosInstance } from 'axios';
import { logger } from 'src/logger/logger';

@Injectable()
export class RequestAmoService {
  api: AxiosInstance;
  constructor(private accountService: AccountsService) {
    this.api = accountService.createConnector(29639002);
  }

  /**
   * Задачи*/
  async AmoTasks(): Promise<any> {
    return await this.api
      .get('/api/v4/tasks', {
        params: {
          limit: 250,
          'filter[updated_at][from]': new Date().setHours(6, 0, 0, 0) / 1000,
        },
      })
      .then((response) => {
        if (response.data === '' || response.data === undefined) {
          return [];
        } else {
          return response.data._embedded.tasks;
        }
      })
      .catch((err) => {
        logger.error(err);
      });
  }

  /**
   * Cобытия
   */
  async getEvents(): Promise<any> {
    let eventsArray = [];
    let pageNumber = 0;
    while (true) {
      const managersEvents = await this.api
        .get('/api/v4/events', {
          params: {
            limit: 100,
            page: pageNumber,
            'filter[created_at][from]': new Date().setHours(6, 0, 0, 0) / 1000,
          },
        })
        .then((response) => {
          return response.data;
        })
        .catch((err) => logger.error(err)); //Количество событий

      if (managersEvents === '' || managersEvents === undefined) {
        break;
      }
      eventsArray = eventsArray.concat(managersEvents._embedded.events);
      pageNumber += 1;
    }

    return eventsArray;
  }

  /**
   * Менеджер*/
  async getManagers(): Promise<any> {
    return await this.api
      .get(`/api/v4/users`)
      .then((response) => response.data._embedded.users)
      .catch((err) => logger.error(err));
  }

  /**
   * Сделки
   */
  async getLeads(): Promise<any> {
    return await this.api
      .get('/api/v4/leads', {
        params: {
          limit: 250,
          'filter[updated_at][from]': new Date().setHours(6, 0, 0, 0) / 1000,
        },
      })
      .then((response) => {
        if (response.data === '' || response.data === undefined) {
          return [];
        } else {
          return response.data._embedded.leads;
        }
      })
      .catch((err) => {
        logger.error(err);
      });
  }

  async countAmoCrm(): Promise<any> {
    return await this.api
      .get('/api/v4/events', {
        params: {
          limit: 100,
          'filter[created_at][from]': new Date().setHours(6, 0, 0, 0) / 1000,
          'filter[type]': 'custom_field_448007_value_changed',
          'filter[value_after][value]': 'amoCRM',
          'filter[entity]': 'lead',
        },
      })
      .then((response) => response.data._embedded.events)
      .catch((err) => logger.error(err)); //Количество событий
  }

  async countApplication(): Promise<any> {
    const managersEvents = await this.api
      .get('/api/v4/events', {
        params: {
          limit: 100,
          'filter[created_at][from]': new Date().setHours(6, 0, 0, 0) / 1000,
          'filter[value_after][leads_statuses][0][pipeline_id]': 4542283,
          'filter[value_after][leads_statuses][0][status_id]': 41893990,
        },
      })
      .then((response) => response.data._embedded)
      .catch((err) => logger.error(err)); //Количество событий
    return managersEvents.events.map((event) => event.entity_id);
  }
}
