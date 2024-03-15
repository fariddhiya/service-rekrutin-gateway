import { Module } from '@nestjs/common';
import { HttpGatewayService } from './services/http.gateway.service';
import { GrpcDynamicGatewayService } from './services/grpc-dynamic.gateway.service';
import { LoggerModule } from '../../common/loggers/logger.module';
import { GatewayController } from './controller/gateway.controller';

@Module({
  imports: [LoggerModule],
  controllers: [GatewayController],
  providers: [HttpGatewayService, GrpcDynamicGatewayService],
})
export class GatewayModule {}
