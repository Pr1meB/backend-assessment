import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Unexpected error: ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      
      response.status(status).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected internal error occurred',
        },
      });
      return;
    }

    if (exception instanceof HttpException) {
      const resp = exception.getResponse();
      
      if (typeof resp === 'object' && resp !== null && 'error' in resp && typeof (resp as any).error === 'object') {
        response.status(status).json(resp);
        return;
      }

      response.status(status).json({
        error: {
          code: status === HttpStatus.CONFLICT ? 'CONFLICT' : 'HTTP_ERROR',
          message: typeof resp === 'string' ? resp : (resp as any).message || exception.message,
        },
      });
      return;
    }
    
    response.status(status).json({
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
      },
    });
  }
}
