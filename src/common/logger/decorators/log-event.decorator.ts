import { SetMetadata } from '@nestjs/common';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';

// Define a custom decorator
export const LogEvent = (event: EVENT_TYPE) => SetMetadata('event', event);
