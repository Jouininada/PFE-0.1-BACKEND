import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/modules/user/user.module';
import { UserEntity } from 'src/modules/user/repositories/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), UsersModule, ConfigModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
