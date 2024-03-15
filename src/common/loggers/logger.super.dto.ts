export type LogMessage = {
  timestamp: string;
  level: string;
  serviceName: string;
  responseTime: number;
  event: string;
  properties?: {
    req?: RequestLog;
    res?: Response;
    err?: CauseErr;
  };
};

export type RequestLog = {
  id?: string;
  method: string;
  url: string;
  ip?: string;
  headers: Record<string, string>;
  params?: Record<string, string>;
  query?: any;
  body?: any;
  requestId?: string;
};

export type Response = {
  status: number;
  message: string;
};

export type CauseErr = {
  err_name?: string;
  err_message?: string;
  err_trace?: string[];
  stack?: CauseErr;
};

export type LogLevel = 'info' | 'debug' | 'warn' | 'error';
