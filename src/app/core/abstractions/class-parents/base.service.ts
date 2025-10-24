import { inject } from '@angular/core';
import { Client } from '../http/client-http';
import { ToastService } from '../toast/toast.service';
import { ApiResponse } from '../../models/apiResponse';
import { PaginatedList } from '../../interfaces/paginated-list.interface';
import { SearchParams } from '../../interfaces/search-params';
import { HandlerBase } from './handler.base';
import { EndpointConfig, Method, TypedUrlProps } from '../http/models/types';
import { AnotherArgs } from '../../interfaces/another-args.interface';
import { PlatformService } from '../../services/platform.service';

export abstract class BaseService {
  protected platform = inject(PlatformService);
  protected get isBrowser(): boolean {
    return this.platform.isBrowser();
  }
  protected http = inject(Client);
  protected toast = inject(ToastService);
  private executor: HandlerBase;

  constructor() {
    this.executor = new HandlerBase(this.http, this.toast);
  }

  public get loading() {
    return this.executor.loading;
  }

  protected abstract getEndpoints(): {
    list?: EndpointConfig | (() => EndpointConfig);
    getById?: EndpointConfig | (() => EndpointConfig) | ((id: string) => EndpointConfig);
    create?: EndpointConfig | (() => EndpointConfig);
    update?: EndpointConfig | (() => EndpointConfig) | ((id: string) => EndpointConfig);
    delete?: EndpointConfig | (() => EndpointConfig) | ((id: string) => EndpointConfig);
  };

  private validateRequest<T>(data: any, RequestClass: (new (...args: any[]) => T) | undefined, operation: string): void {
    if (RequestClass && !(data instanceof RequestClass)) {
      throw new Error(`${operation}: O parâmetro deve ser uma instância de ${RequestClass.name}`);
    }
  }

  private validateResponse<T>(response: any, ResponseClass: (new (...args: any[]) => T) | undefined, operation: string): void {
    if (ResponseClass && response?.data && !(response.data instanceof ResponseClass)) {
      console.warn(`${operation}: A resposta deveria ser uma instância de ${ResponseClass.name}`);
    }
  }

  private resolveEndpointConfig(endpoint: EndpointConfig | (() => EndpointConfig) | ((id: string) => EndpointConfig) | undefined, id?: string): { endpoint: string; method: Method; requestClass?: any; responseClass?: any } {
    if (!endpoint) {
      throw new Error('Endpoint not configured');
    }

    // Resolve a config
    let config: EndpointConfig;
    if (typeof endpoint === 'function') {
      // Se tem id e a função aceita id
      if (id !== undefined && endpoint.length > 0) {
        config = (endpoint as (id: string) => EndpointConfig)(id);
      } else {
        config = (endpoint as () => EndpointConfig)();
      }
    } else {
      config = endpoint;
    }

    // Resolve a URL
    const { url, requestClass, responseClass } = config;
    const [endpointUrl, method] = typeof url === 'function'
      ? (id !== undefined && url.length > 0
        ? (url as (id: string) => TypedUrlProps)(id)
        : (url as () => TypedUrlProps)())
      : url as TypedUrlProps;

    return {
      endpoint: endpointUrl,
      method,
      requestClass,
      responseClass
    };
  }

  async create<TRequest, TResponse>(data: TRequest, options?: AnotherArgs): Promise<ApiResponse<TResponse>> {
    const { endpoint, method, requestClass, responseClass } = this.resolveEndpointConfig(this.getEndpoints().create);

    this.validateRequest(data, requestClass, 'create');

    const response = await this.executor.executeRequest<TRequest, ApiResponse<TResponse>>(endpoint, method, data, options);

    this.validateResponse(response, responseClass, 'create');
    return response;
  }

  async update<TRequest, TResponse>(id: string, data: TRequest, options?: AnotherArgs): Promise<ApiResponse<TResponse>> {
    const { endpoint, method, requestClass, responseClass } = this.resolveEndpointConfig(this.getEndpoints().update, id);

    this.validateRequest(data, requestClass, 'update');

    const response = await this.executor.executeRequest<TRequest, ApiResponse<TResponse>>(endpoint, method, data, options);

    this.validateResponse(response, responseClass, 'update');
    return response;
  }

  async getById<TResponse>(id: string, options?: AnotherArgs): Promise<ApiResponse<TResponse>> {
    const { endpoint, method, responseClass } = this.resolveEndpointConfig(this.getEndpoints().getById, id);

    const response = await this.executor.executeSimpleRequest<ApiResponse<TResponse>>(endpoint, method, options);

    this.validateResponse(response, responseClass, 'getById');
    return response;
  }

  async delete(id: string, options?: AnotherArgs): Promise<ApiResponse<void>> {
    const { endpoint, method } = this.resolveEndpointConfig(this.getEndpoints().delete, id);
    return await this.executor.executeSimpleRequest<ApiResponse<void>>(endpoint, method, options);
  }

  async search<TResponse>(params: SearchParams, options?: AnotherArgs): Promise<PaginatedList<TResponse>> {
    const { endpoint, method, responseClass } = this.resolveEndpointConfig(this.getEndpoints().list);

    const searchParams: any = {
      PageNumber: params.pageNumber,
      PageSize: params.pageSize
    };

    // ⚠️ IMPORTANTE: Backend usa 'src' em vez de 'SearchText' conforme CLAUDE.md
    if (params.src) searchParams.src = params.src;
    if (params.columnName) searchParams.ColumnName = params.columnName;
    if (params.ascDes !== undefined) searchParams.AscDesc = params.ascDes;
    if (params.customFilter) {
      searchParams.CustomFilter = JSON.stringify(params.customFilter);
    }

    const response = await this.executor.executeSearchRequest<PaginatedList<TResponse>>(endpoint, method, searchParams, options);

    if (responseClass && response && 'data' in response && Array.isArray(response.data)) {
      response.data.forEach((item: any, index: number) => {
        if (!(item instanceof responseClass)) {
          console.warn(`search: Item ${index} deveria ser uma instância de ${responseClass.name}`);
        }
      });
    }

    return response;
  }

  protected async executeWithHandler<TRequest = any, TResponse = any>(endpointConfig: EndpointConfig<TRequest, TResponse>, data?: TRequest, options?: AnotherArgs): Promise<TResponse> {
    const { endpoint, method, requestClass, responseClass } = this.resolveEndpointConfig(endpointConfig);

    // Validar request se fornecido
    if (data !== undefined && requestClass) {
      this.validateRequest(data, requestClass, 'executeWithHandler');
    }

    let response: TResponse;

    if (data !== undefined && data !== null) {
      response = await this.executor.executeRequest<TRequest, TResponse>(endpoint, method, data, options);
    } else {
      response = await this.executor.executeSimpleRequest<TResponse>(endpoint, method, options);
    }

    if (responseClass) {
      this.validateResponse(response, responseClass, 'executeWithHandler');
    }

    return response;
  }
}