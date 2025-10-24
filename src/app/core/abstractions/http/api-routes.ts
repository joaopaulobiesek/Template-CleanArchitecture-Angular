import { environment } from "../../../../environments/environment";
import { LoginRequest } from "./models/request/auth/login";
import { AuthLoginResponse } from "./models/response/auth/login";
import { UserResponse } from "./models/response/auth/user";
import { createTypedEndpoint } from "./models/types";

const baseURL = environment.api;

export const apiRoutes = {
    // 🔐 AUTENTICAÇÃO
    auth: {
        login: () => createTypedEndpoint(`${baseURL}/api/v1/Auth/Login`, "post", LoginRequest, AuthLoginResponse),
        register: () => createTypedEndpoint(`${baseURL}/api/v1/Auth/Register`, "post"), // ✅ PÚBLICO - Registro com código de convite
        googleCallback: (code: string, state: string) => createTypedEndpoint(`${baseURL}/api/v1/Auth/Google/Callback?code=${code}&state=${state}`, "get"),
        google: () => createTypedEndpoint(`${baseURL}/api/v1/Auth/Google`, "get"),
        logout: () => createTypedEndpoint(`${baseURL}/api/v1/Auth/Logout`, "post"), // ✅ Invalida cookie HTTP-Only
    },

    // 👥 USUÁRIOS
    users: {
        create: () => createTypedEndpoint(`${baseURL}/api/v1/Users`, "post"),
        update: () => createTypedEndpoint(`${baseURL}/api/v1/Users`, "put"),
        list: () => createTypedEndpoint(`${baseURL}/api/v1/Users`, "get", undefined, UserResponse),
        getPolices: () => createTypedEndpoint(`${baseURL}/api/v1/Users/Polices`, "get"),
        getRoles: () => createTypedEndpoint(`${baseURL}/api/v1/Users/Roles`, "get"),
        delete: (id: string) => createTypedEndpoint(`${baseURL}/api/v1/Users/${id}`, "delete"),
    },

    // ☁️ AZURE BLOB STORAGE
    azureBlobStorage: {
        generateSasToken: () => createTypedEndpoint(`${baseURL}/api/v1/AzureBlobStorage/GenerateSasToken`, "post"),
        uploadFile: () => createTypedEndpoint(`${baseURL}/api/v1/AzureBlobStorage/UploadFile`, "post"),
        downloadFile: (fileName: string) => createTypedEndpoint(`${baseURL}/api/v1/AzureBlobStorage/DownloadFile?FileName=${fileName}`, "get"),
        deleteFile: () => createTypedEndpoint(`${baseURL}/api/v1/AzureBlobStorage/DeleteFile`, "delete"),
    },

    // 📅 GOOGLE CALENDAR
    google: {
        calendarEvents: () => createTypedEndpoint(`${baseURL}/api/v1/Google/Calendar/Events`, "get"),
    },

    // 🏥 HEALTH CHECK
    health: {
        check: () => createTypedEndpoint(`${baseURL}/api/Health`, "get"),
    },

    // 👥 CLIENTS - Gestão de Clientes
    clients: {
        create: () => createTypedEndpoint(`${baseURL}/tenant/api/v1/Client`, "post"),
        list: () => createTypedEndpoint(`${baseURL}/tenant/api/v1/Client`, "get"),
        getById: (id: string) => createTypedEndpoint(`${baseURL}/tenant/api/v1/Client/GetById?Id=${id}`, "get"),
        update: () => createTypedEndpoint(`${baseURL}/tenant/api/v1/Client`, "put"),
        deactivate: () => createTypedEndpoint(`${baseURL}/tenant/api/v1/Client/Deactivate`, "patch"),
        delete: (id: string) => createTypedEndpoint(`${baseURL}/tenant/api/v1/Client/Delete/${id}`, "delete"),
    },
};