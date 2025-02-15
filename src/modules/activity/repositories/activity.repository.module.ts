import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityRepository } from './repository/activity.repository';
import { ActivityEntity } from './entities/activity.entity';

@Module({
  controllers: [],
  providers: [ActivityRepository],
  exports: [ActivityRepository],
  imports: [TypeOrmModule.forFeature([ActivityEntity])],
})
export class ActivityRepositoryModule {}
