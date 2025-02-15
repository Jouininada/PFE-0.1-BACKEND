import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs';
import { LoggerService } from '../services/logger.service';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { getTokenPayload } from 'src/common/auth/utils/token-payload';
import { AccessTokenPayload } from 'src/common/auth/interfaces/access-token-payload.interface';
import { Request } from 'express';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly loggerService: LoggerService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    return next.handle().pipe(
      tap(async () => {
        const event = this.reflector.get<EVENT_TYPE>(
          'event',
          context.getHandler(),
        );
        if (event) {
          const request: Request = context.switchToHttp().getRequest();
          const { method, url, logInfo } = request;
          const payload: AccessTokenPayload = getTokenPayload(request);

          await this.loggerService.save({
            event,
            logInfo,
            api: url,
            method,
            userId: payload.sub,
          });
        }
      }),
    );
  }
}
