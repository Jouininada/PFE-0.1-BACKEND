import { Module } from '@nestjs/common';
import { AppConfigService } from './services/app-config.service';
import { AppConfigRepositoryModule } from './repositories/app-config.repository.module';

@Module({
  controllers: [],
  providers: [AppConfigService],
  exports: [AppConfigService],
  imports: [AppConfigRepositoryModule],
})
export class AppConfigModule {}
