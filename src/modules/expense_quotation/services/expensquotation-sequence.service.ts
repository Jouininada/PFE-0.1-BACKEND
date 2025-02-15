/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { AppConfigService } from 'src/common/app-config/services/app-config.service';
import { QuotationSequentialNotFoundException } from '../errors/quotation.sequential.error';
import { AppConfigEntity } from 'src/common/app-config/repositories/entities/app-config.entity';
import { EventsGateway } from 'src/common/gateways/events/events.gateway';
import { formSequential } from 'src/utils/sequence.utils';
import { UpdateExpensQuotationSequenceDto } from '../dtos/expensquotation-seqence.update.dto';

@Injectable()
export class ExpensQuotationSequenceService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly wsGateway: EventsGateway,
  ) {}

  async get(): Promise<AppConfigEntity> {
    const sequence =
      await this.appConfigService.findOneByName('quotation_sequence');
    if (!sequence) {
      throw new QuotationSequentialNotFoundException();
    }
    return sequence;
  }

  async set(
    updateQuotationSequenceDto: UpdateExpensQuotationSequenceDto,
  ): Promise<AppConfigEntity> {
    const sequence = await this.get();
    const updatedSequence = await this.appConfigService.update(sequence.id, {
      value: updateQuotationSequenceDto,
    });
    return updatedSequence;
  }

  async getSequential(): Promise<string> {
    const sequence = await this.get();
    this.set({ ...sequence.value, next: sequence.value.next + 1 });
    this.wsGateway.server.emit('quotation-sequence-updated', {
      value: sequence.value,
    });
    return formSequential(
      sequence.value.prefix,
      sequence.value.dynamicSequence,
      sequence.value.next,
    );
  }

 
}
