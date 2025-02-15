import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultConditionRepository } from './repository/default-condition.repository';
import { DefaultConditionEntity } from './entities/default-condition.entity';

@Module({
  controllers: [],
  providers: [DefaultConditionRepository],
  exports: [DefaultConditionRepository],
  imports: [TypeOrmModule.forFeature([DefaultConditionEntity])],
})
export class DefaultConditionRepositoryModule {}
