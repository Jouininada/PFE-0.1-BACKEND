import { Module } from '@nestjs/common';
import { InvoicingCalculationsService } from './services/invoicing.calculations.service';

@Module({
  exports: [InvoicingCalculationsService],
  providers: [InvoicingCalculationsService],
  controllers: [],
})
export class CalculationsModule {}
