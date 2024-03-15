import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class ResponseFormat<T> {
  @ApiProperty()
  code: number;
  @ApiProperty()
  status: string | number;
  result?: T;
  message?: any;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const now = Date.now();
    request['response-times'] = now;
    return next.handle().pipe(
      map((data) => ({
        ...data,
      })),
    );
  }
}
