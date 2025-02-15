import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { CountryService } from '../services/country.service';
import { ResponseCountryDto } from '../dtos/country.response.dto';

@ApiTags('country')
@Controller({
  version: '1',
  path: '/country',
})
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get('/all')
  async findAll(): Promise<ResponseCountryDto[]> {
    return await this.countryService.findAll();
  }

  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(@Param('id') id: number): Promise<ResponseCountryDto> {
    return await this.countryService.findOneById(id);
  }
}
