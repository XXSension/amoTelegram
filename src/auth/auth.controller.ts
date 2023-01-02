import { Controller, All, Query, Res } from '@nestjs/common';
import { AuthField } from 'src/interfaces/auth-field.interfaces';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @All('/callback')
  async callback(@Query() query: AuthField, @Res() res: Response) {
    return res.redirect(await this.authService.performCallback(query));
  }
}
