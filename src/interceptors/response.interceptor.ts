import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<ApiResponse<T>>,
  ): Observable<{ success: true; data: T; message: string }> {
    return next.handle().pipe(
      map((data) => {
        return {
          success: true,
          message: data?.message ?? 'Request successful',
          meta: data?.meta,
          data: data?.data ?? (data as T),
        };
      }),
    );
  }
}

//I COPIED THIS CODE FROM https://dev.to/nurulislamrimon/enhancing-api-responses-with-a-global-response-interceptor-in-nestjs-124i CONGRATS TO THAT GUY FOR BEING SMART
