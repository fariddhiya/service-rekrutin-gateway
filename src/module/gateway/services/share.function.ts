import * as FormData from 'form-data';
import { DataServiceResponse } from '../dtos/gateway.dto';

export class ShareFunction {
  async setRequest(request) {
    const { method, url, query, params, raw } = request;
    const headers = {};
    const { user } = raw;
    const contentType = request.headers['content-type'] || 'application/json';
    headers['content-type'] =
      contentType.search('multipart/form-data') > -1
        ? 'multipart/form-data'
        : 'application/json';

    const body = request.isMultipart()
      ? await this.setBody(request.body)
      : request.body
        ? request.body
        : {};

    return {
      method,
      url,
      query,
      params,
      body,
      contentType,
      user,
      headers,
    };
  }

  async setBody(data) {
    const formData = new FormData();

    for (const key in data) {
      const value = data[key];
      if (
        value.mimetype.search('image') >= 0 ||
        value.mimetype === 'text/csv'
      ) {
        const buff = await value.toBuffer();
        formData.append(key, buff, {
          contentType: value.mimetype,
          filename: value.filename,
        });
      } else {
        formData.append(key, value.value);
      }
    }

    return formData;
  }

  getDataServices(): DataServiceResponse[] {
    const _env = process.env;
    const gatewayServices: DataServiceResponse[] = [];
    for (const [key, value] of Object.entries(_env)) {
      if (key.search('GATEWAY_SERVICE_') > -1) {
        const objValue = value.trim().split(' ');
        const regex = objValue[0];
        const gatewayIp = objValue[1];
        const serviceEnv = key.replace('GATEWAY_SERVICE_', '').split('_')[0];

        gatewayServices.push({ serviceEnv, gatewayIp, pathPrefix: `${regex}` });
      }
    }
    return gatewayServices;
  }

  async setRequestGrpc(request) {
    const { method, url, query, params, raw } = request;
    const headers = {};
    const { user } = raw;
    const contentType = request.headers['content-type'] || 'application/json';
    headers['content-type'] =
      contentType.search('multipart/form-data') > -1
        ? 'multipart/form-data'
        : 'application/json';

    const body = request.body ? request.body : {};

    //Add validation query params limit.
    if (query && +query.limit > 100) {
      const paramsLimit = process.env.QUERY_LIMIT;
      query.limit = paramsLimit;
    }

    return {
      method,
      url,
      query,
      params,
      body,
      contentType,
      user,
      headers,
    };
  }

  async setBodyGrpc(data) {
    const jsonData: any = {};
    for (const key in data) {
      const value = data[key];
      if (
        value.mimetype.search('image') >= 0 ||
        value.mimetype === 'text/csv'
      ) {
        const buff = await value.toBuffer();
        const buffBase64 = buff.toString('base64');
        jsonData[key] = buffBase64;
      } else {
        jsonData[key] = value.value;
      }
    }

    return jsonData;
  }
}
