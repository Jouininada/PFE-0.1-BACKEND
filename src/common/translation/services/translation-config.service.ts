import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nOptionsFactory, I18nOptionsWithoutResolvers } from 'nestjs-i18n';
import { join } from 'path';

@Injectable()
export class TranslationConfigService implements I18nOptionsFactory {
  constructor(private configService: ConfigService) {}

  createI18nOptions(): I18nOptionsWithoutResolvers {
    return {
      fallbackLanguage: this.configService.get('i18n.language', {
        infer: true,
      }),
      loaderOptions: {
        path: join(__dirname, '../../../i18n/'),
        watch: true,
      },
      typesOutputPath: join(
        __dirname,
        '../../../../src/generated/i18n.generated.ts',
      ),
    } as I18nOptionsWithoutResolvers;
  }
}
