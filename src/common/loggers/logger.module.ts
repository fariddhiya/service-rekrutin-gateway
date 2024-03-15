import { Logger, Module } from '@nestjs/common';
import { SuperLogger } from './logger.super.service';
import { ConfigService } from '@nestjs/config';
import { SuperHelper } from './logger.super.helper';

@Module({
  providers: [
    {
      provide: 'NODE_ENV',
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        return cfg.get<string>('NODE_ENV');
      },
    },
    {
      provide: 'SERVICE_NAME',
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        return cfg.get<string>('SERVICE_NAME');
      },
    },
    Logger,
    SuperLogger,
    SuperHelper,
  ],
  exports: [SuperLogger, SuperHelper],
})
export class LoggerModule {}
