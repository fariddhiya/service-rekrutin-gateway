import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './common/config/config';
import { LoggerModule } from './common/loggers/logger.module';
import { GatewayModule } from './module/gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        autoLoadEntities: true,
        synchronize: false,
        replication: {
          master: {
            host: configService.get('mysqlConfig.master.host'),
            port: configService.get('mysqlConfig.master.port'),
            username: configService.get('mysqlConfig.master.user'),
            password: configService.get('mysqlConfig.master.password'),
            database: configService.get('mysqlConfig.master.database'),
          },
          slaves: [
            {
              host: configService.get('mysqlConfig.slave.host'),
              port: configService.get('mysqlConfig.slave.port'),
              username: configService.get('mysqlConfig.slave.user'),
              password: configService.get('mysqlConfig.slave.password'),
              database: configService.get('mysqlConfig.slave.database'),
            },
          ],
        },
      }),
    }),
    GatewayModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply()
      .forRoutes(
        { path: '*', method: RequestMethod.GET },
        { path: '*', method: RequestMethod.POST },
        { path: '*', method: RequestMethod.PUT },
        { path: '*', method: RequestMethod.PATCH },
        { path: '*', method: RequestMethod.DELETE },
      );
  }
}
