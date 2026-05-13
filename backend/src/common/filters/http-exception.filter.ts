import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
  correlationId?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    const body: ErrorResponseBody = {
      statusCode: status,
      error: exception instanceof HttpException ? exception.name : 'InternalServerError',
      message: this.resolveMessage(exceptionResponse),
      path: request.url,
      timestamp: new Date().toISOString(),
      correlationId: request.headers['x-correlation-id']?.toString(),
    };

    response.status(status).json(body);
  }

  private resolveMessage(exceptionResponse: unknown): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const { message } = exceptionResponse;
      return Array.isArray(message) || typeof message === 'string'
        ? message
        : 'Unexpected error';
    }

    return 'Unexpected error';
  }
}
