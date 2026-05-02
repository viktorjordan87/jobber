import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GraphqlLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GraphqlLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler().name;
    const args = context.getArgs().at(0);
    const startTime = Date.now();
    const requestId = uuidv4();

    this.logger.log({
      requestId,
      handler,
      args,
      startTime,
    });

    return next.handle().pipe(
      tap((_response) => {
        this.logger.log({
          requestId,
          handler,
          duration: Date.now() - startTime,
        });
      }),
    );
  }
}
