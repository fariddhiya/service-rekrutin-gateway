import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as WinstonTransport from 'winston-transport';
import { format, transports } from 'winston';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { WinstonModule } from 'nest-winston';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { SuperLogger } from './common/loggers/logger.super.service';
import { SuperHelper } from './common/loggers/logger.super.helper';
import { AllExceptionFilter } from './common/filters/exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const nodeEnv = process.env.NODE_ENV;

  const winstonTransport: WinstonTransport[] = [
    new transports.Console({
      format: format.printf((info) => {
        return info.message;
      }),
    }),
  ];

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      maxParamLength: 1000,
      bodyLimit: 30 * 1024 * 1024,
    }),
    { logger: WinstonModule.createLogger({ transports: winstonTransport }) },
  );

  /** get env */
  const configService = app.get(ConfigService);
  const appPrefix = configService.get('api.prefix');
  const appPort = configService.get('port');

  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  /** Enable auto validation level global */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  /** handle global response */
  app.useGlobalInterceptors(new ResponseInterceptor());

  /** handle global error */
  const logger = app.get(SuperLogger);
  const loggerHelper = app.get(SuperHelper);
  app.useGlobalFilters(new AllExceptionFilter(logger, loggerHelper));

  /** set global prefix */
  app.setGlobalPrefix(appPrefix);

  await app.listen(appPort, '0.0.0.0');
}

bootstrap().then(() => Logger.log(`App Started ${process.env.PORT || 3000}`));
