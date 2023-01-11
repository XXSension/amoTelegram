import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import axios, { AxiosInstance } from 'axios';
import { GrantTypes } from 'src/enums/grant-types.enum';
import { ConfigService } from '@nestjs/config';
import { AuthField } from '../interfaces/auth-field.interfaces';
import { OAuthField } from '../interfaces/oauth-field.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AccountsService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Account)
    private accountsRepo: Repository<Account>,
  ) {}

  findByAmoID(amoId: number): Promise<Account> {
    return this.accountsRepo.findOne({ where: { amoId: amoId } });
  }

  create(data: Partial<Account>): Promise<Account> {
    return this.accountsRepo.save(data);
  }

  async update(id: number, data: Partial<Account>) {
    await this.accountsRepo.save({ ...data, id });
    return this.accountsRepo.findOne({ where: { id: id } });
  }

  async TokenVerification(amoId: number) {
    let account: Account;
    account = await this.findByAmoID(amoId);

    if (!account) {
      throw new Error('Не найден аккаунт по данному id');
    }

    if (Number(account.expire) - 60 < Math.round(Number(new Date()) / 1000)) {
      const newToken = await this.getNewTokens(
        account.refreshToken,
        account.domain,
        GrantTypes.RefreshToken,
      );
      account = await this.update(account.id, {
        accessToken: newToken.accessToken,
        refreshToken: newToken.refreshToken,
        expire: newToken.expire,
      });
    }
    return account;
  }

  createConnector(amoId: number): AxiosInstance {
    const api = axios.create();

    api.interceptors.request.use(
      async (config) => {
        const account = await this.TokenVerification(amoId);

        config.baseURL = `https://${account.domain}`;

        config.headers.Authorization = `Bearer ${account.accessToken}`;

        return config;
      },
      (e) => Promise.reject(e),
    );
    return api;
  }

  async getNewTokens(
    i: string,
    domain: string,
    type: GrantTypes = GrantTypes.AuthCode,
  ) {
    try {
      const { data } = await axios.post(
        `https://${domain}/oauth2/access_token`,
        {
          client_id: this.configService.get('clientId'),
          client_secret: this.configService.get('clientSecret'),
          redirect_uri: this.configService.get('redirectUri'),
          grant_type: type,
          [type === GrantTypes.AuthCode ? 'code' : 'refresh_token']: i,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expire: Math.round(Number(new Date()) / 1000) + data.expires_in,
      };
    } catch {
      console.log({
        'Content-Type': 'application/json',
      });
    }
  }

  async performCallback(query: AuthField): Promise<string> {
    const oauth: OAuthField = await this.getNewTokens(
      query.code,
      query.referer,
    );

    const decoded = jwt.decode(oauth.accessToken, { json: true }); //дешифрование accessToken и на этом основная получения объекта account_id
    const account = await this.findByAmoID(decoded.account_id);
    if (!account) {
      await this.create({
        amoId: decoded.account_id,
        domain: query.referer,
        accessToken: oauth.accessToken,
        refreshToken: oauth.refreshToken,
        expire: oauth.expire,
      });
    } else {
      await this.update(account.id, {
        domain: query.referer,
        accessToken: oauth.accessToken,
        refreshToken: oauth.refreshToken,
        expire: oauth.expire,
      });
    }

    return `https://${query.referer}`;
  }
}
