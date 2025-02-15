import { Module } from '@nestjs/common';
import { TranslationConfigService } from './services/translation-config.service';
import { TranslationService } from './services/translation.service';

@Module({
  providers: [TranslationConfigService, TranslationService],
  exports: [TranslationConfigService, TranslationService],
})
export class TranslationModule {}
