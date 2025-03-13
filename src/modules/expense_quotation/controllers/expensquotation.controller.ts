/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Query,
  Req, // ✅ Correction ici (au lieu de `Request`)
} from '@nestjs/common';
import { Request } from 'express'; // ✅ Correction de l'import Express

import { ApiTags, ApiParam } from '@nestjs/swagger';

import { ExpensQuotationService } from '../services/expensquotation.service';

import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';

import { ResponseExpensQuotationDto } from '../dtos/expensquotation.response.dto';
import { CreateExpensQuotationDto } from '../dtos/expensquotation.create.dto';

import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { UpdateExpensQuotationDto } from '../dtos/expensquotation.update.dto';
import { DuplicateExpensQuotationDto } from '../dtos/expensquotation.duplicate.dto';
import { ExpensQuotationEntity } from '../repositories/entities/expensquotation.entity';


@ApiTags('expensquotation')
@Controller({
  version: '1',
  path: '/expensquotation',
})
export class ExpensQuotationController {
  constructor(
    private readonly expensQuotationService: ExpensQuotationService,
  ) {}

  @Get('/all')
async findAll(
  @Query('status') status: string,
  @Query() options: IQueryObject,
): Promise<ResponseExpensQuotationDto[]> {
  // Si 'status' est fourni, l'ajouter aux options pour la recherche
  if (status) {
    options.filter = options.filter 
      ? `${options.filter},status||$eq||${status}` 
      : `status||$eq||${status}`;  // Applique le filtre de statut
  }

  return await this.expensQuotationService.findAll(options);  // Passer les options au service
}

  


  @Get('/list')
  @ApiPaginatedResponse(ResponseExpensQuotationDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseExpensQuotationDto>> {
    return await this.expensQuotationService.findAllPaginated(query);
  }

//fonctionne
    @Get('/:id')
    @ApiParam({
      name: 'id',
      type: 'number',
      required: true,
    })
    async findOneById(
      @Param('id') id: number,
      @Query() query: IQueryObject,
    ): Promise<ResponseExpensQuotationDto> {
      query.filter
        ? (query.filter += `,id||$eq||${id}`)
        : (query.filter = `id||$eq||${id}`);
      return await this.expensQuotationService.findOneByCondition(query);
    }
//fonctionne
    @Post('/save')
  async save(
    @Body() createExpensQuotationDto: CreateExpensQuotationDto,
  ): Promise<ResponseExpensQuotationDto> {
    return await this.expensQuotationService.save(createExpensQuotationDto);
  }

  
  @Post('/duplicate')
  async duplicate(
    @Body() duplicateExpensQuotationDto: DuplicateExpensQuotationDto,
  ): Promise<ResponseExpensQuotationDto> {
    return await this.expensQuotationService.duplicate(duplicateExpensQuotationDto);
  }


@Delete('/delete/:id')
  @LogEvent(EVENT_TYPE.BUYING_QUOTATION_DELETED)
  async delete(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<ResponseExpensQuotationDto> {
    req.logInfo = { id };
    return this.expensQuotationService.softDelete(id);
  }



  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Put('/:id')
  @LogEvent(EVENT_TYPE.BUYING_QUOTATION_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateQuotationDto: UpdateExpensQuotationDto,
    @Req() req: Request,
  ): Promise<ResponseExpensQuotationDto> {
    // Setting logInfo on the request object
    req.logInfo = { action: 'update', id };  // Adding action to provide more context in logs
    return this.expensQuotationService.update(id, updateQuotationDto);
  }
  // Dans votre contrôleur backend (expense-quotation.controller.ts)
@Delete(':id/pdf')
async deletePdfFile(@Param('id') id: number): Promise<void> {
  await this.expensQuotationService.deletePdfFile(id);
}

@Put(':id/update-status-if-expired') // Définissez la route
  async updateQuotationStatusIfExpired(
    @Param('id') quotationId: number, // Récupérez l'ID depuis l'URL
  ): Promise<ExpensQuotationEntity> {
    return this.expensQuotationService.updateQuotationStatusIfExpired(quotationId); // Appelez la méthode du service
  }


 
}
