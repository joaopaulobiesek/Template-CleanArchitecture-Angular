export class AuthLoginResponse {
   constructor(
    public name: string,
    public email: string,
    public modules: string[],
    public roles: string[],
    public policies: string[], // ✅ Corrigido de "polices" para "policies"
    public token: string,
    public tenantId: string,
  ) {}
}