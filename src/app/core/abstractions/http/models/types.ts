import { ApiResponse } from "../../../models/apiResponse";

export type Method = "post" | "get" | "put" | "delete" | "patch";

export type TypedUrlProps<TRequest = any, TResponse = any> = [string, Method, TRequest?, ApiResponse<TResponse>?];

export type EndpointConfig<TRequest = any, TResponse = any> = {
    url: TypedUrlProps | (() => TypedUrlProps) | ((id: string) => TypedUrlProps);
    requestClass?: new (...args: any[]) => TRequest;
    responseClass?: new (...args: any[]) => TResponse;
};

export function createTypedEndpoint<TReq = any, TRes = any>(
    url: string,
    method: Method,
    requestClass?: new (...args: any[]) => TReq,
    responseClass?: new (...args: any[]) => TRes
): EndpointConfig<TReq, ApiResponse<TRes>> {
    return {
        url: [url, method] as TypedUrlProps,
        requestClass,
        responseClass: ApiResponse as any
    };
}