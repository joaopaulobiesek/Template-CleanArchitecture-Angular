export class UserResponse {
    constructor(
        public id: string,
        public email: string,
        public fullName: string,
        public profileImageUrl: string,
        public tenantId: string,
        public roles: string[],
        public policies: string[],
        public phoneNumber?: string,
    ) { }

    static fromObject(obj: any): UserResponse {
        return new UserResponse(
            obj.id,
            obj.email,
            obj.fullName,
            obj.profileImageUrl,
            obj.tenantId,
            obj.roles || [],
            obj.policies || [],
            obj.phoneNumber || ''
        );
    }
}