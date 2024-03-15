export class SuperHelper {
  private _redactHeaders(headers: any): Record<string, string> {
    // Redact sensitive headers
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'set-cookie',
      'accept',
      'accept-encoding',
    ];
    const redactedHeaders: any = {};

    for (const [key, value] of Object.entries(headers)) {
      redactedHeaders[key] = sensitiveHeaders.includes(key.toLowerCase())
        ? '[REDACTED]'
        : value;
    }

    return redactedHeaders;
  }

  private _redactBodies(body: any): Record<string, any> {
    const sensitiveHeaders = ['password'];
    /**
     * An object that stores the redacted headers.
     */
    const redactBodies: any = {};

    for (const [key, value] of Object.entries(body)) {
      redactBodies[key] = sensitiveHeaders.includes(key.toLowerCase())
        ? '[REDACTED]'
        : value;
    }

    return redactBodies;
  }

  public setRequestLogger(request) {
    const { method, url, body, params, query, headers } = request;
    //Handle body with buffer datatype
    let dataBody: any;

    dataBody = body;

    const headersRedacted = headers ? this._redactHeaders(headers) : undefined;
    const bodiesRedacted = dataBody ? this._redactBodies(dataBody) : undefined;

    return {
      method,
      url,
      headersRedacted,
      bodiesRedacted,
      params,
      query,
    };
  }
}
