import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { GrantTypes } from 'src/enums/grant-types.enum';
import { AuthField } from 'src/interfaces/auth-field.interfaces';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { OAuthField } from 'src/interfaces/oauth-field.interface';
import { AccountsService } from 'src/accounts/accounts.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => AccountsService))
    private accountsService: AccountsService,
  ) {}

  async performCallback(query: AuthField): Promise<string> {
    const oauth: OAuthField = await this.getNewTokens(
      query.code,
      query.referer,
    );

    const decoded = jwt.decode(oauth.accessToken, { json: true }); //дешифрование accessToken и на этом основная получения объекта account_id
    const account = await this.accountsService.findByAmoID(decoded.account_id);
    if (!account) {
      await this.accountsService.create({
        amoId: decoded.account_id,
        domain: query.referer,
        accessToken: oauth.accessToken,
        refreshToken: oauth.refreshToken,
        expire: oauth.expire,
      });
    } else {
      await this.accountsService.update(account.id, {
        domain: query.referer,
        accessToken: oauth.accessToken,
        refreshToken: oauth.refreshToken,
        expire: oauth.expire,
      });
    }

    return `https://${query.referer}`;
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
}
