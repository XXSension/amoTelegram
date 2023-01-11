import { Module } from '@nestjs/common';
import { RequestAmoService } from './request-amo.service';
import { AccountsModule } from 'src/accounts/accounts.module';

@Module({
  imports: [AccountsModule],
  providers: [RequestAmoService],
  exports: [RequestAmoService],
})
export class RequestAmoModule {}
