export class AuthLoginResponse {
    constructor(
        public name: string,
        public email: string,
        public modules: string[],
        public roles: string[],
        public polices: string[],
        public token: string,
        public tenantId: string
    ) { }

    static fromObject(obj: any): AuthLoginResponse {
        return new AuthLoginResponse(
            obj.name,
            obj.email,
            obj.modules || [],
            obj.roles || [],
            obj.polices || [],
            obj.token,
            obj.tenantId
        );
    }
}