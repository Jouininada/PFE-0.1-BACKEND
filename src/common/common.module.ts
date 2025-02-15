import { Module } from '@nestjs/common';
import { GatewaysModule } from './gateways/gateways.module';
import { DatabaseModule } from './database/database.module';

@Module({
  controllers: [],
  providers: [],
  imports: [GatewaysModule, DatabaseModule],
  exports: [GatewaysModule, DatabaseModule],
})
export class CommonModule {}
