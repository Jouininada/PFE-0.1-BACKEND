import {
  Controller,
  Param,
  Get,
  Body,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { CabinetService } from '../services/cabinet.service';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { CabinetEntity } from '../repositories/entities/cabinet.entity';
import { CreateCabinetDto } from '../dtos/cabinet.create.dto';
import { ResponseCabinetDto } from '../dtos/cabinet.response.dto';
import { UpdateCabinetDto } from '../dtos/cabinet.update.dto';

@ApiTags('cabinet')
@Controller({
  version: '1',
  path: '/cabinet',
})
export class CabinetController {
  constructor(private readonly cabinetService: CabinetService) {}

  @Get('/list')
  async findAll(): Promise<ResponseCabinetDto[]> {
    return await this.cabinetService.findAll();
  }

  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(@Param('id') id: number): Promise<ResponseCabinetDto> {
    const cabinet = await this.cabinetService.findOneById(id);
    return {
      ...cabinet,
    };
  }

  @Post('')
  async save(
    @Body() createCabinetDto: CreateCabinetDto,
  ): Promise<ResponseCabinetDto> {
    return this.cabinetService.save(createCabinetDto);
  }

  @Put('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async update(
    @Param('id') id: number,
    @Body() updateCabinetDto: UpdateCabinetDto,
  ): Promise<CabinetEntity> {
    return this.cabinetService.update(id, updateCabinetDto);
  }

  @Delete('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async delete(@Param('id') id: number): Promise<CabinetEntity> {
    return this.cabinetService.softDelete(id);
  }
}
