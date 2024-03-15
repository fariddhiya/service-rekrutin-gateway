import { Controller, All, Req } from '@nestjs/common';
import { HttpGatewayService } from '../services/http.gateway.service';
import { GatewayResponse } from '../dtos/gateway.dto';
import { GrpcDynamicGatewayService } from '../services/grpc-dynamic.gateway.service';
import { SuperLogger } from '../../../common/loggers/logger.super.service';
import { SuperHelper } from '../../../common/loggers/logger.super.helper';

@Controller()
export class GatewayController {
  constructor(
    private httpGatewayService: HttpGatewayService,
    private grpcDynamicGatewayService: GrpcDynamicGatewayService,
    private readonly logger: SuperLogger,
    private readonly loggerHelper: SuperHelper,
  ) {}

  @All('v3/*')
  async passingRequestHttp(@Req() request: any): Promise<GatewayResponse> {
    const result = await this.httpGatewayService.passingRequest(request);

    //Setup Logger
    const { method, url, headersRedacted, bodiesRedacted, params, query } =
      this.loggerHelper.setRequestLogger(request);
    this.logger.log(200, 'gRPC', 'Success', 'info', {
      method: method,
      url: url,
      headers: headersRedacted,
      body: bodiesRedacted,
      params: params,
      query: query,
    });
    return result;
  }

  @All('*')
  async passingRequestRPC(@Req() request: any): Promise<GatewayResponse> {
    const result =
      await this.grpcDynamicGatewayService.passingGrpcService(request);

    //Setup Logger
    const { method, url, headersRedacted, bodiesRedacted, params, query } =
      this.loggerHelper.setRequestLogger(request);

    this.logger.log(200, 'gRPC', 'Success', 'info', {
      method: method,
      url: url,
      headers: headersRedacted,
      body: bodiesRedacted,
      params: params,
      query: query,
    });
    return result;
  }
}
