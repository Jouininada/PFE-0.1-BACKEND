import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterlocutorRepository } from './repository/interlocutor.repository';
import { InterlocutorEntity } from './entity/interlocutor.entity';

@Module({
  controllers: [],
  providers: [InterlocutorRepository],
  exports: [InterlocutorRepository],
  imports: [TypeOrmModule.forFeature([InterlocutorEntity])],
})
export class InterlocutorRepositoryModule {}
