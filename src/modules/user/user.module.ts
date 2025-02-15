import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserRepositoryModule } from './repositories/user.repository.module';

@Module({
  controllers: [],
  providers: [UserService],
  exports: [UserService],
  imports: [UserRepositoryModule],
})
export class UsersModule {}
