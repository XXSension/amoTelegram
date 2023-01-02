import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import axios, { AxiosInstance } from 'axios';
import { AuthService } from 'src/auth/auth.service';
import { GrantTypes } from 'src/enums/grant-types.enum';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepo: Repository<Account>,
    @Inject(forwardRef(() => AuthService))
    private authSevice: AuthService,
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
      const newToken = await this.authSevice.getNewTokens(
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
}
