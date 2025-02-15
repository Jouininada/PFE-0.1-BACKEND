import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repository/user.repository';

@Module({
  controllers: [],
  providers: [UserRepository],
  exports: [UserRepository],
  imports: [TypeOrmModule.forFeature([UserEntity])],
})
export class UserRepositoryModule {}
