import { Global, Module } from '@nestjs/common';
import { EventsGateway } from './events/events.gateway';

@Global()
@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
  imports: [],
})
export class GatewaysModule {}
