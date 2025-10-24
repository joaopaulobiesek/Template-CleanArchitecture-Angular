import { AnotherArgs } from "../../interfaces/another-args.interface";
import { Client } from "../http/client-http";
import { Method } from "../http/models/types";
import { ToastService } from "../toast/toast.service";

export class HandlerBase {
    private _loading = false;

    constructor(
        private http: Client,
        private toast: ToastService
    ) { }

    public get loading() {
        return this._loading;
    }

    public async execute<TRequest, TResponse>(
        executeFunction: (data: TRequest) => Promise<TResponse>,
        data: TRequest,
        options?: AnotherArgs
    ): Promise<TResponse> {
        const errorMessage = options?.errorMessage;
        const successMessage = options?.successMessage;
        const hiddenToast = options?.hiddenToast || false;

        try {
            this._loading = true;
            const result = await executeFunction(data);

            if (successMessage) {
                this.toast.showSuccess(successMessage.title, successMessage.message);
            }

            return result;
        } catch (error: any) {
            if (!hiddenToast) {
                const message = errorMessage?.message || error?.error?.message || error?.message || "Ocorreu um erro inesperado.";
                const title = errorMessage?.title || "Error: ";
                this.toast.showError(title, message);
            }

            return null as any;
        } finally {
            this._loading = false;
        }
    }

    public async executeRequest<TRequest, TResponse>(
        endpoint: string,
        method: Method,
        data: TRequest,
        options?: AnotherArgs
    ): Promise<TResponse> {
        return this.execute(
            async (requestData: TRequest) => {
                return await this.http.request<TResponse>({
                    endpoint,
                    method: method as any,
                    data: requestData
                });
            },
            data,
            options
        );
    }

    public async executeSimpleRequest<TResponse>(
        endpoint: string,
        method: Method,
        options?: AnotherArgs
    ): Promise<TResponse> {
        return this.execute(
            async () => {
                return await this.http.request<TResponse>({
                    endpoint,
                    method: method as any
                });
            },
            undefined as any,
            options
        );
    }

    public async executeSearchRequest<TResponse>(
        endpoint: string,
        method: Method,
        params: any,
        options?: AnotherArgs
    ): Promise<TResponse> {
        return this.execute(
            async () => {
                return await this.http.request<TResponse>({
                    endpoint,
                    method: method as any,
                    params
                });
            },
            undefined as any,
            options
        );
    }
}