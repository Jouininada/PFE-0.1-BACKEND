import { Module } from '@nestjs/common';
import { LoggerController } from 'src/common/logger/controllers/logger.controller';
import { LoggerModule } from 'src/common/logger/logger.module';

@Module({
  controllers: [LoggerController],
  providers: [],
  exports: [],
  imports: [LoggerModule],
})
export class RoutesAdminModule {}
