import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SuperLogger } from '../loggers/logger.super.service';
import { RequestLog } from '../loggers/logger.super.dto';
import { SuperHelper } from '../loggers/logger.super.helper';
import { RpcStatusToHttpStatus } from '../constants/status.code';
import { status } from '@grpc/grpc-js';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: SuperLogger,
    private readonly loggerHelper: SuperHelper,
  ) {}

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let errCode;
    let errMessage = { message: '' };

    if (Object.values(status).includes(exception.code)) {
      // Handle gRpc Exception
      errCode = RpcStatusToHttpStatus[exception.code]; //Convert Error from gRPC Exception to Http Exception
      errMessage = {
        message: exception.message ?? 'Error: Unknown Message Error',
      };
    } else {
      //Handle Http Exception
      const httpRespObj = JSON.parse(JSON.stringify(exception));
      errCode = httpRespObj.status;
      if (errCode == 400) {
        errMessage = { message: exception.response };
      } else {
        const messageTmp = exception.message ?? 'Error: ' + HttpStatus[errCode];
        errMessage = { message: messageTmp };
      }
    }

    //Set errCode (some error only return message without error code)
    if (!errCode) {
      errCode = 500; //--> Internal Error (Default)
    }

    //Set Exception Logger
    const { method, url, headersRedacted, bodiesRedacted, params, query } =
      this.loggerHelper.setRequestLogger(request);
    const arrUrl = url.split('/');
    const prefixUrl = arrUrl[2] ? arrUrl[2] : '';

    let transport;
    if (prefixUrl !== 'v3') {
      transport = 'gRPC';
    } else {
      transport = 'HTTP';
    }

    const requestCatcher: RequestLog = {
      method: method,
      url: url,
      headers: headersRedacted,
      body: bodiesRedacted,
      params: params,
      query: query,
    };
    this.logger.fromTransport(
      transport,
      requestCatcher,
      'error',
      exception,
      errCode,
      errMessage.message,
    );

    response.status(errCode).send(errMessage);
  }
}
