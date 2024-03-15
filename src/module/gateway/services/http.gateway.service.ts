import { Injectable, HttpException, BadRequestException } from '@nestjs/common';
import { httpRequest } from '../../../common/utils/axios';
import { ShareFunction } from './share.function';
import { GatewayResponse, DataServiceResponse } from '../dtos/gateway.dto';
import { URLSearchParams } from 'url';

@Injectable()
export class HttpGatewayService {
  async passingRequest(request: any): Promise<GatewayResponse> {
    let { url } = request;
    const arrUrl = url.split('/');
    const pathPrefix = arrUrl[3] ? arrUrl[3] : '';

    if (pathPrefix === '') throw new BadRequestException('URL IP Not Found');

    /**
     * init share function
     */
    const shareFunction = new ShareFunction();

    /**
     * set request
     * get data services
     */
    const { method, body, query, contentType, user, headers } =
      await shareFunction.setRequest(request);
    const dataServices = shareFunction.getDataServices();

    const userId = user ? user.id : 0;
    // headers['content-type'] = contentType ? contentType : 'application/json';
    // headers['authorization'] = `${userId}:superdashboard`; //Comment. because not read oauth_access_token table anymore at backend serive
    headers['user'] = JSON.stringify(user);

    //Add validation query params limit.
    if (query && +query.limit > 100) {
      url = this._replaceLimitInUrl(url);
    }

    let apiUrl;

    if (pathPrefix === 'gateway') {
      apiUrl = this._setApiUrlFromGateway(url, dataServices);
    } else {
      /**
       * get service from dataService
       */
      const service = dataServices.find(
        (i) => i.pathPrefix === pathPrefix && i.serviceEnv === 'NESTJS',
      );
      if (!service) throw new BadRequestException('URL IP unregistered');

      apiUrl = service.gatewayIp + url;
    }

    /**
     * request to service
     */

    const { status, data } = await httpRequest.request({
      method,
      url: apiUrl,
      headers,
      data: body,
    });

    if (![200, 201].includes(status)) {
      throw new HttpException(data, status);
    } else {
      return data;
    }
  }

  private _setApiUrlFromGateway(
    url: string,
    dataServices: DataServiceResponse[],
  ): string {
    /**
     * replace gateway and version
     */
    let apiUrl = url.replace('/gateway', '');
    if (apiUrl.search('/v3/v2') > -1) {
      apiUrl = apiUrl.replace('/v3/v2', '/v2');
    } else if (apiUrl.search('/v3/v3') > -1) {
      apiUrl = apiUrl.replace('/v3/v3', '/v3');
    }

    /**
     * get service from dataService
     */
    const arrUrl = apiUrl.split('/');
    const pathPrefix = arrUrl[3] ? arrUrl[3] : '';
    const service = dataServices.find(
      (i) => i.pathPrefix === pathPrefix && i.serviceEnv === 'NODEJS',
    );

    /**
     * if service not found
     */
    if (!service) throw new BadRequestException('URL IP unregistered');

    /**
     * handle to gateway toba (salesforce)
     */
    if (apiUrl.substr(8, 4) == 'toba') {
      apiUrl = apiUrl.replace('api/v3/toba/', '');
    }

    return service.gatewayIp + apiUrl;
  }

  private _replaceLimitInUrl(url: string): string {
    const querySeparatorIndex = url.indexOf('?');

    if (querySeparatorIndex !== -1) {
      const urlPath = url.substring(0, querySeparatorIndex);
      const urlQueryParams = url.substring(querySeparatorIndex + 1);

      const queryParams = new URLSearchParams(urlQueryParams);

      // Update the 'limit' query parameter value to QUERY_LIMIT
      const paramsLimit = process.env.QUERY_LIMIT;
      queryParams.set('limit', paramsLimit);

      // Reconstruct the updated query string
      const updatedQueryString = queryParams.toString();

      // Reconstruct the updated URL
      const updatedUrl = urlPath + '?' + updatedQueryString;

      return updatedUrl;
    } else {
      return url;
    }
  }
}
