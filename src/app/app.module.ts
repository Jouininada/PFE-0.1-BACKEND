import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { HelloController } from './controllers/app.controller';
import { ConfigModule } from '@nestjs/config';
import configs from 'src/configs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from 'src/common/database/services/database-config.service';
import { RouterModule } from 'src/routers/router.module';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { TranslationConfigService } from 'src/common/translation/services/translation-config.service';
import { TranslationModule } from 'src/common/translation/translation.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [HelloController],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: !process.env.NODE_ENV
        ? '.env'
        : `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    I18nModule.forRootAsync({
      imports: [TranslationModule],
      useClass: TranslationConfigService,
      resolvers: [new HeaderResolver(['x-custom-lang'])],
    }),
    CommonModule,
    TranslationModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          imports: [TypeOrmModule],
          adapter: new TransactionalAdapterTypeOrm({
            dataSourceToken: DataSource,
          }),
        }),
      ],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    RouterModule.forRoot(),
  ],
})
export class AppModule {}
