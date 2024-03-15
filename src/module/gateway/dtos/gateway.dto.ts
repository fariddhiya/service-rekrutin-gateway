import { Method } from 'axios';

export interface GatewayResponse {
  code: number;
  status: string;
  result?: Record<string, string[]> | string[] | null;
  message?: string[];
}
export interface DataServiceResponse {
  serviceEnv: string;
  gatewayIp: string;
  pathPrefix: string;
}

export interface RoutingMethodGrpc {
  service: string;
  method: string;
  signurl_columns?: string[];
}
export type RoutingGrpc = Map<Method, RoutingMethodGrpc>;
export type RoutingPathGrpc = Map<string, RoutingGrpc>;
export interface RoutingConfig {
  name: string;
  envhost: string;
  package: string[];
  protoPath: string[];
  protoDirsPath: string[];
  routes: RoutingPathGrpc[];
}
export type ClientConfig = Map<string, RoutingConfig>;

export interface RouteAndPathResponse {
  rpcRoute: RoutingMethodGrpc;
  pathRoute: string;
}
