import { Module } from '@nestjs/common';
import { ActivityRepositoryModule } from './repositories/activity.repository.module';
import { ActivityService } from './services/activity.service';

@Module({
  controllers: [],
  providers: [ActivityService],
  exports: [ActivityService],
  imports: [ActivityRepositoryModule],
})
export class ActivityModule {}
