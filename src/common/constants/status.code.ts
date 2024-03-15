import { status } from '@grpc/grpc-js';
import { HttpStatus } from '@nestjs/common';

export const RpcStatusToHttpStatus: Record<number, number> = {
  // standard gRPC error mapping
  // https://cloud.google.com/apis/design/errors#handling_errors
  [status.OK]: HttpStatus.OK,
  [status.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
  [status.FAILED_PRECONDITION]: HttpStatus.BAD_REQUEST,
  [status.OUT_OF_RANGE]: HttpStatus.BAD_REQUEST,
  [status.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
  [status.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
  [status.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [status.ABORTED]: HttpStatus.CONFLICT,
  [status.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [status.RESOURCE_EXHAUSTED]: HttpStatus.TOO_MANY_REQUESTS,
  [status.CANCELLED]: HttpStatus.INTERNAL_SERVER_ERROR,
  [status.DATA_LOSS]: HttpStatus.INTERNAL_SERVER_ERROR,
  [status.INTERNAL]: HttpStatus.INTERNAL_SERVER_ERROR,
  [status.UNKNOWN]: HttpStatus.INTERNAL_SERVER_ERROR,
  [status.UNIMPLEMENTED]: HttpStatus.NOT_IMPLEMENTED,
  [status.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [status.DEADLINE_EXCEEDED]: HttpStatus.GATEWAY_TIMEOUT,
};
