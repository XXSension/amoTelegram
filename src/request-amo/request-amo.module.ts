import { forwardRef, Module } from '@nestjs/common';
import { RequestAmoService } from './request-amo.service';
import { AccountsModule } from 'src/accounts/accounts.module';
import { AuthModule } from 'src/auth/auth.module';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  imports: [AccountsModule, AuthModule, forwardRef(() => TelegramModule)],
  providers: [RequestAmoService],
  exports: [RequestAmoService],
})
export class RequestAmoModule {}
