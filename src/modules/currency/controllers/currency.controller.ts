import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { CurrencyService } from '../services/currency.service';
import { ResponseCurrencyDto } from '../dtos/currency.response.dto';
import { CreateCurrencyDto } from '../dtos/currency.create.dto';

@ApiTags('currency')
@Controller({
  version: '1',
  path: '/currency',
})
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('/all')
  async findAll(): Promise<ResponseCurrencyDto[]> {
    return await this.currencyService.findAll();
  }

  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(@Param('id') id: number): Promise<ResponseCurrencyDto> {
    return await this.currencyService.findOneById(id);
  }

  @Post('')
  async save(
    @Body() createCurrencyDto: CreateCurrencyDto,
  ): Promise<ResponseCurrencyDto> {
    return await this.currencyService.save(createCurrencyDto);
  }
}
