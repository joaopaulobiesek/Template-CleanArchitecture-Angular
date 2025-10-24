export interface RequestApi {
    method: "get" | "post" | "put" | "delete" | "patch",
    endpoint: string,
    data?: any,
    params?: object,
    errorMessage?: string;
    successMessage?: string;
}