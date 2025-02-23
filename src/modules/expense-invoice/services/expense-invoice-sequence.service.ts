import { Injectable } from '@nestjs/common';
import { AppConfigService } from 'src/common/app-config/services/app-config.service';
import { AppConfigEntity } from 'src/common/app-config/repositories/entities/app-config.entity';
import { EventsGateway } from 'src/common/gateways/events/events.gateway';
import { formSequential } from 'src/utils/sequence.utils';
import { WSRoom } from 'src/app/enums/ws-room.enum';
import { ExpenseUpdateInvoiceSequenceDto } from '../dtos/expense-invoice-sequence.update.dto';
import { ExpenseInvoiceSequentialNotFoundException } from '../errors/expense-invoice-sequential.error';

@Injectable()
export class ExpenseInvoiceSequenceService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly wsGateway: EventsGateway,
  ) {}

  async get(): Promise<AppConfigEntity> {
    const sequence =
      await this.appConfigService.findOneByName('invoice_sequence');
    if (!sequence) {
      throw new ExpenseInvoiceSequentialNotFoundException();
    }
    return sequence;
  }

  async set(
    updateInvoiceSequenceDto: ExpenseUpdateInvoiceSequenceDto,
  ): Promise<AppConfigEntity> {
    const sequence = await this.get();
    const updatedSequence = await this.appConfigService.update(sequence.id, {
      value: updateInvoiceSequenceDto,
    });
    return updatedSequence;
  }

  async getSequential(): Promise<string> {
    const sequence = await this.get();
    this.set({ ...sequence.value, next: sequence.value.next + 1 });
    this.wsGateway.sendToRoom(
      WSRoom.INVOICE_SEQUENCE,
      'invoice-sequence-updated',
      {
        value: sequence.value.next + 1,
      },
    );
    return formSequential(
      sequence.value.prefix,
      sequence.value.dynamicSequence,
      sequence.value.next,
    );
  }
}
