import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressRepository } from './repository/address.repository';
import { AddressEntity } from './entities/address.entity';

@Module({
  controllers: [],
  providers: [AddressRepository],
  exports: [AddressRepository],
  imports: [TypeOrmModule.forFeature([AddressEntity])],
})
export class AddressRepositoryModule {}
