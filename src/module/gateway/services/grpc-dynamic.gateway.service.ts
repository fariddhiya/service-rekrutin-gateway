import { Metadata } from '@grpc/grpc-js';
import {
  BadGatewayException,
  HttpException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc, ClientGrpcProxy } from '@nestjs/microservices';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { parse } from 'regexparam';
import { firstValueFrom } from 'rxjs';
import {
  ClientConfig,
  GatewayResponse,
  RouteAndPathResponse,
  RoutingConfig,
} from '../dtos/gateway.dto';
import { ShareFunction } from './share.function';

export class GrpcDynamicGatewayService implements OnModuleInit {
  private clientConfig: ClientConfig; // Variable to store the loaded grpc client configuration

  // key format: $pathPrefix-$serviceName
  private grpcClientsByPathPrefix: Map<string, any>;

  onModuleInit() {
    // Load the grpc configuration
    this.clientConfig = this.loadGrpcConfig();
    this.grpcClientsByPathPrefix = new Map();

    for (const prefix of Object.keys(this.clientConfig)) {
      this.initConnections(prefix);
    }
  }

  initConnections(pathPrefix: string): Promise<void> {
    //Extract url prefix
    const grpcConfig = this.clientConfig[pathPrefix];

    if (!grpcConfig) {
      return;
    }

    try {
      const URL_HOST = process.env[grpcConfig.envhost];
      const packageConfig = grpcConfig.package;

      const protoPath: string[] = [];
      const protoPathConfig = grpcConfig.protoPath;
      protoPathConfig.forEach((path) => {
        protoPath.push(join(__dirname, path));
      });

      const protoDirs: string[] = [];
      const protoDirsConfig = grpcConfig.protoDirsPath;
      protoDirsConfig.forEach((dir) => {
        protoDirs.push(join(__dirname, dir));
      });

      // Init GrpcClient
      const grpcClient = new ClientGrpcProxy({
        package: [...packageConfig],
        url: URL_HOST,
        protoPath: [...protoPath],
        keepalive: {
          keepaliveTimeMs: 20000, //20 seconds
          keepaliveTimeoutMs: 240000, //4 Minutes
        },
        loader: {
          keepCase: true,
          longs: Number,
          enums: String,
          defaults: false,
          arrays: true,
          objects: true,
          includeDirs: [...protoDirs],
        },
      });

      for (const route of Object.keys(grpcConfig.routes)) {
        for (const reqMethod of Object.keys(grpcConfig.routes[route])) {
          const detailService = grpcConfig.routes[route][reqMethod];
          if (!detailService.service) {
            throw new BadGatewayException(
              'Each config should have service name',
            );
          }

          const key = `${pathPrefix}-${detailService.service}`;
          const svc = this.grpcClientsByPathPrefix.get(key);

          if (!svc) {
            const newService = grpcClient.getService(detailService.service);
            this.grpcClientsByPathPrefix.set(key, newService);
          }
        }
      }
    } catch (e) {
      throw e;
    }
  }

  private async _getPrefix(req: any): Promise<string> {
    //Extract url prefix
    const arrUrl = req.url.split('/');
    const pathPrefix = arrUrl[2] ? arrUrl[2] : '';

    return pathPrefix;
  }

  private async _getGrpcConnection(
    pathPrefix: string,
    serviceName: string,
  ): Promise<ClientGrpc> {
    const client = this.grpcClientsByPathPrefix.get(
      `${pathPrefix}-${serviceName}`,
    );
    if (!client) {
      throw new HttpException({ message: 'REQUEST NOT FOUND' }, 404);
    }

    return client;
  }

  async passingGrpcService(request: Request): Promise<GatewayResponse> {
    try {
      const pathPrefix = await this._getPrefix(request);

      //extract request payload
      const shareFunction = new ShareFunction();
      const { method, body, params, query, url, user } =
        await shareFunction.setRequestGrpc(request);

      /**
       * get route and path
       */
      const grpcConfig = this.clientConfig[pathPrefix];
      const { rpcRoute, pathRoute } = this._getRouteAndPath(
        url,
        method,
        grpcConfig,
      );

      //prepare params
      const paramExtracted = this.extractParams(pathRoute, params);
      const dataParams = { ...query, ...paramExtracted, ...body, user };

      // Construct user metadata
      let userMap: Map<string, string>;
      let metadata: Metadata = Object.create({});
      if (user) {
        userMap = new Map<string, string>(Object.entries(user));
        metadata = this.constructMetadata(userMap);
      }

      //Request to client via gRPC
      // 2nd approach : singleton initialize rpc service
      //get gRPC Connection
      const client = await this._getGrpcConnection(
        pathPrefix,
        rpcRoute.service,
      );

      const response = await this.sendGrpcRequest(
        rpcRoute.method,
        metadata,
        dataParams,
        client,
      );
      // end of 2nd approach

      return response;
    } catch (err) {
      throw err;
    }
  }

  private async sendGrpcRequest(
    methodName: string,
    metadata: Metadata,
    request: any,
    client: any,
  ): Promise<any> {
    let response = { code: 400, status: 'failed', result: null };
    if (client[methodName]) {
      response = await firstValueFrom(client[methodName](request, metadata));
    }

    return response;
  }

  private loadGrpcConfig(): any {
    try {
      const config = yaml.load(fs.readFileSync('service.config.yaml', 'utf8')); // Load the YAML file (replace with your file path)
      return config;
    } catch (error) {
      throw error;
    }
  }

  private extractParams(
    path: string,
    urlObject: string,
  ): Record<string, string> | null {
    const url = Object.values(urlObject)[0];
    const pathSegments = path.split('/').filter((segment) => segment !== ''); // Split the path and remove empty segments
    const urlSegments = url.split('/').filter((segment) => segment !== ''); // Split the URL and remove empty segments

    if (pathSegments.length !== urlSegments.length) {
      return null; // Return null if the number of segments doesn't match
    }

    const params: Record<string, string> = {};
    let positionParam: number;
    let pathSegment: string;
    let urlSegment: string;
    let paramName: string;
    for (let i = 0; i < pathSegments.length; i++) {
      pathSegment = pathSegments[i];
      urlSegment = urlSegments[i];

      positionParam = pathSegment.search(':');
      if (positionParam !== -1) {
        paramName = pathSegment.slice(positionParam + 1); // Remove the leading ':' from the parameter name
        params[paramName] = urlSegment;
      } else if (pathSegment !== urlSegment) {
        return null; // Return null if any non-parameter segment doesn't match
      }
    }

    return params;
  }

  private constructMetadata(metaMap: Map<string, string>): Metadata {
    const metadata = new Metadata();
    metaMap.forEach((value, key, _) => {
      metadata.set(key, value);
    });

    return metadata;
  }

  private _getRouteAndPath(
    url: string,
    method: string,
    grpcConfig: RoutingConfig,
  ): RouteAndPathResponse {
    const pattern = /^\/([^?]+)(?:\?.*)?$/; //Remove parameter Querystring
    const match = url.match(pattern);

    const urlPath =
      match && match[1] ? match[1].split('/').slice(1).join('/') : '';

    /**
     * get route match
     */
    const pathData: string[] = [];
    for (const route in grpcConfig.routes) {
      if (parse(route).pattern.test('/' + urlPath)) {
        pathData.push(route);
      }
    }

    /** route not found */
    if (pathData.length === 0) {
      throw new HttpException({ message: 'REQUEST NOT FOUND' }, 404);
    }

    /** set route */
    let pathRoute: string;
    if (pathData.length === 1) {
      pathRoute = pathData[0];
    } else {
      pathRoute = pathData.find((p) => p === urlPath);
      if (!pathRoute) {
        pathRoute = pathData.find((p) => p.search(':') !== -1);
      }
    }

    /** check route method and data route */
    const routeParent = grpcConfig.routes[pathRoute];
    const rpcRoute = routeParent[method];
    if (!rpcRoute) {
      throw new HttpException({ message: 'HTTP METHOD IS NOT VALID' }, 400);
    }

    return { rpcRoute, pathRoute };
  }
}
