import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class TranslationService {
  constructor(private readonly i18n: I18nService) {}

  async translate(namespace: string): Promise<string> {
    return this.i18n.t(namespace, { lang: I18nContext.current().lang });
  }
}
