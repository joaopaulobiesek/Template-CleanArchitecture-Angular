import { HttpParams, HttpClient as AngularHttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { RequestApi } from "./models/request.model";

@Injectable({
    providedIn: 'root'
})
export class Client {
    private http = inject(AngularHttpClient)

    private addParams(params: object) {
        let httpParams = new HttpParams();

        if (params) {
            for (const key in params) {
                if (Object.hasOwn(params, key)) {
                    const value = params[key as keyof typeof params];
                    if (value != null && value != undefined) {
                        httpParams = httpParams.append(key, value);
                    }
                }
            }
        }

        return httpParams;
    }

    public async request<T>({
        endpoint,
        method,
        data = null,
        params = null!,
    }: RequestApi): Promise<T> {
        
        let httpParams = this.addParams(params);
        try {
            let response = null;
            switch (method) {
                case 'get':
                    response = await lastValueFrom(this.http.get(endpoint, { params: httpParams }));
                    break;

                case 'delete':
                    response = await lastValueFrom(this.http.delete(endpoint, { params: httpParams, body: data }));
                    break;

                case 'patch':
                    response = await lastValueFrom(this.http.patch(endpoint, data, { params: httpParams }));
                    break;

                case 'put':
                    response = await lastValueFrom(this.http.put(endpoint, data, { params: httpParams }));
                    break;

                case 'post':
                    response = await lastValueFrom(this.http.post(endpoint, data, { params: httpParams }));
                    break;

                default:
                    throw new Error(`Método HTTP não suportado: ${method}`);
            }

            return response as Promise<T>;
        } catch (error) {
            throw error;
        }
    }
}