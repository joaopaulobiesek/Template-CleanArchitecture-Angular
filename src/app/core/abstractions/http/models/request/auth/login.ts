export class LoginRequest {
    constructor(
        public email: string,
        public password: string,
        public rememberMe?: boolean
    ) { }

    static fromObject(obj: any): LoginRequest {
        return new LoginRequest(
            obj.email,
            obj.password,
            obj.rememberMe
        );
    }
}