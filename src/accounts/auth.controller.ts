import { Controller, All, Query, Res } from '@nestjs/common';
import { AuthField } from 'src/interfaces/auth-field.interfaces';
import { Response } from 'express';
import { AccountsService } from './accounts.service';

@Controller('auth')
export class AuthController {
  constructor(private accountService: AccountsService) {}

  @All('/callback')
  async callback(@Query() query: AuthField, @Res() res: Response) {
    return res.redirect(await this.accountService.performCallback(query));
  }
}
