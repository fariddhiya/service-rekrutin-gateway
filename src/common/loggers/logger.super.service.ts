import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';

import { LogMessage, LogLevel, RequestLog } from './logger.super.dto';

@Injectable()
export class SuperLogger {
  private readonly serviceName: string;

  constructor(
    @Inject('NODE_ENV')
    env: string,

    @Inject('SERVICE_NAME')
    name: string,

    @Inject(Logger) private readonly logger: LoggerService,
  ) {
    if (!name) {
      name = 'GATEWAY SERVICE';
    }

    this.serviceName = `[${env}] ${name}`;
  }

  // For Global Log
  public log(
    code: number,
    trans: 'gRPC' | 'HTTP',
    message: string,
    level: LogLevel,
    req: RequestLog,
    e?: Error,
  ) {
    const eventDescr = this.getEventService(req.url);
    const eventService = `[${trans}] ${eventDescr}`;
    const lm = this._setLogMessage(level, eventService);
    lm.properties = {
      res: {
        status: code,
        message: message,
      },
      req: req,
    };

    if (e) {
      this._setError(lm, e);
    }

    this.logger.log(JSON.stringify(lm));
  }

  // For Log Catch Error
  public fromTransport(
    trans: 'gRPC' | 'HTTP',
    req: RequestLog,
    level: LogLevel,
    err: Error,
    errCode: number,
    errMessage: string,
  ) {
    const eventDescr = this.getEventService(req.url);
    const eventService = `[${trans}] ${eventDescr}`;
    const lm = this._setLogMessage(level, eventService);
    lm.properties = {
      res: {
        status: errCode,
        message: errMessage,
      },
      req: req,
    };
    this._setError(lm, err);
    this.logger.error(JSON.stringify(lm));
  }

  private _setError(lm: LogMessage, err?: Error) {
    if (!err) {
      return;
    }

    lm.properties.err = {
      err_name: err.name ? err.name : '',
      err_message: err.message ? err.message : '',
    };

    if (err.stack && err.stack.length > 0) {
      lm.properties.err.err_trace = err.stack
        .split('\n')
        .map((line) => line.trim())
        .slice(0, 10);
    }
  }

  private _setLogMessage(lvl: LogLevel, event: string) {
    const lm: LogMessage = {
      timestamp: new Date().toISOString(),
      level: lvl,
      serviceName: this.serviceName,
      responseTime: 0,
      event: event,
    };

    return lm;
  }

  private getEventService(url: string): string {
    const arrUrl = url.split('/');
    const prefixUrl = arrUrl[2] ? arrUrl[2] : '';
    let eventService = '';

    if (prefixUrl == 'v3') {
      const svcname = arrUrl[3] ? arrUrl[3] : 'unknown service';
      const event = arrUrl[4] ? arrUrl[4] : 'unknown event';
      eventService = svcname + ' ' + event;
    } else {
      const event = arrUrl[3] ? arrUrl[3] : 'unknown event';
      eventService = prefixUrl + ' ' + event;
    }

    return eventService;
  }
}
