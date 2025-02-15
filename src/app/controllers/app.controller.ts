import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TranslationService } from 'src/common/translation/services/translation.service';

@Controller('hello')
@ApiTags('hello')
export class HelloController {
  constructor(private readonly translationService: TranslationService) {}

  @Get()
  async hello(): Promise<string> {
    return await this.translationService.translate('common.hello');
  }
}
