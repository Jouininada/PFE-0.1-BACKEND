import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { FirmInterlocutorEntryService } from '../services/firm-interlocutor-entry.service';
import { ResponseFirmInterlocutorEntryDto } from '../dtos/firm-interlocutor-entry.response.dto';
import { CreateFirmInterlocutorEntryDto } from '../dtos/firm-interlocutor-entry.create.dto';
import { UpdateFirmInterlocutorEntryDto } from '../dtos/firm-interlocutor-entry.update.dto';

@ApiTags('firm-interlocutor-entry')
@Controller({
  version: '1',
  path: '/firm-interlocutor-entry',
})
export class FirmInterlocutorEntryController {
  constructor(
    private readonly firmInterlocutorEntryService: FirmInterlocutorEntryService,
  ) {}
  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(
    @Param('id') id: number,
  ): Promise<ResponseFirmInterlocutorEntryDto> {
    return await this.firmInterlocutorEntryService.findOneById(id);
  }

  @Post('')
  async save(
    @Body()
    createFirmInterlocutorEntryDtos:
      | CreateFirmInterlocutorEntryDto
      | CreateFirmInterlocutorEntryDto[],
  ): Promise<
    ResponseFirmInterlocutorEntryDto | ResponseFirmInterlocutorEntryDto[]
  > {
    if (Array.isArray(createFirmInterlocutorEntryDtos)) {
      return await this.firmInterlocutorEntryService.saveMany(
        createFirmInterlocutorEntryDtos,
      );
    } else {
      return await this.firmInterlocutorEntryService.save(
        createFirmInterlocutorEntryDtos,
      );
    }
  }

  @Put('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async update(
    @Param('id') id: number,
    @Body() updateFirmInterlocutorEntryDto: UpdateFirmInterlocutorEntryDto,
  ): Promise<ResponseFirmInterlocutorEntryDto> {
    return await this.firmInterlocutorEntryService.update(
      id,
      updateFirmInterlocutorEntryDto,
    );
  }

  @Delete('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async delete(
    @Param('id') id: number,
  ): Promise<ResponseFirmInterlocutorEntryDto> {
    return await this.firmInterlocutorEntryService.softDelete(id);
  }

  @Delete('/:firmId/:interlocutorId')
  @ApiParam({
    name: 'firmId',
    type: 'number',
    required: true,
  })
  @ApiParam({
    name: 'interlocutorId',
    type: 'number',
    required: true,
  })
  async deleteByFirmIdAndInterlocutorId(
    @Param('firmId') firmId: number,
    @Param('interlocutorId') interlocutorId: number,
  ): Promise<ResponseFirmInterlocutorEntryDto> {
    return await this.firmInterlocutorEntryService.softDeleteByFirmIdAndInterlocutorId(
      firmId,
      interlocutorId,
    );
  }
}
