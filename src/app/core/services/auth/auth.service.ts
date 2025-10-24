import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { AuthLoginResponse } from './model/auth-login.response';
import { ApiResponse } from '../../models/apiResponse';
import { BaseService } from '../../abstractions/class-parents/base.service';
import { apiRoutes } from '../../abstractions/http/api-routes';
import { LoginRequest } from '../../abstractions/http/models/request/auth/login';
import { TranslationService } from '../translation.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService {
  protected getEndpoints() { return {}; }

  private router = inject(Router);
  private translationService = inject(TranslationService);

  // Signals para gerenciar estado
  private currentUser = signal<AuthLoginResponse | null>(null);
  private _isAuthenticated = signal<boolean>(false);
  public get isAuthenticated(): boolean {
    return this._isAuthenticated();
  }

  private userDataSubject = new BehaviorSubject<AuthLoginResponse | null>(null);

  // Getters públicos
  user = this.currentUser.asReadonly();
  authenticated = this._isAuthenticated.asReadonly();

  constructor() {
    super();
    // Verificar se existe token salvo no localStorage
    if (this.isBrowser)
      this.checkStoredAuth();
  }

  private checkStoredAuth() {
    const localStorage = this.platform.getLocalStorage();
    const userData = localStorage?.getItem('user_data');

    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUser.set(user);
        this.userDataSubject.next(user);
        this._isAuthenticated.set(true);
      } catch (error) {
        console.error('[AuthService] checkStoredAuth - Error parsing user data:', error);
        this.clearStoredAuth();
      }
    }
  }

  private clearStoredAuth() {
    if (this.isBrowser) {
      const localStorage = this.platform.getLocalStorage();
      localStorage?.removeItem('user_data');
    }

    this.currentUser.set(null);
    this.userDataSubject.next(null);
    this._isAuthenticated.set(false);
  }

  async login(log: any): Promise<void> {
    const credentials = new LoginRequest(log.email, log.password, log.rememberMe);
    const res = await this.executeWithHandler(apiRoutes.auth.login(), credentials, {
      successMessage: { title: "Bem vindo(a) ao ExpoHub", message: "O melhor gestor de exposições de 2025!" },
      errorMessage: { title: "Falha ao logar-se", message: "Usuário ou senha incorretos" }
    });

    if (res.success) {
      const { data: userData } = res as any as ApiResponse<AuthLoginResponse>;

      // 🍪 Cookie auth_token foi salvo AUTOMATICAMENTE pelo navegador
      // ❌ NÃO salva token no localStorage

      // ✅ Salva APENAS user data (SEM TOKEN - para UI)
      if (this.isBrowser) {
        const localStorage = this.platform.getLocalStorage();
        const { token, ...userDataWithoutToken } = userData;
        localStorage?.setItem('user_data', JSON.stringify(userDataWithoutToken));
      }

      this.currentUser.set(userData);
      this.userDataSubject.next(userData);
      this._isAuthenticated.set(true);

      const currentLang = this.translationService.getCurrentLanguage();
      this.router.navigate([`/${currentLang}/auth/login-loading`]);

    }
  }

  /**
   * Inicia o fluxo de autenticação com Google OAuth
   * 1. Chama API para obter URL de autenticação
   * 2. Redireciona usuário para Google
   * 3. Google redireciona de volta para http://localhost:4200/auth/google-callback
   * 4. Frontend chama handleGoogleCallback() para processar code e state
   *
   * @param inviteCode - Código de convite (opcional) - será passado no state do OAuth
   */
  async loginWithGoogle(inviteCode?: string): Promise<void> {
    try {
      // Chama API para obter URL de autenticação Google
      const res = await this.executeWithHandler(
        apiRoutes.auth.google(),
        undefined,
        {
          successMessage: { title: "Redirecionando", message: "Você será redirecionado para o Google..." },
          errorMessage: { title: "Erro", message: "Falha ao iniciar autenticação com Google" }
        }
      );

      if (res.success) {
        let { data: authUrl } = res as any as ApiResponse<string>;

        // 🎟️ Se tem código de convite, substitui o state=00000000-0000-0000-0000-000000000000 pelo código
        if (inviteCode && authUrl) {
          authUrl = authUrl.replace(
            /state=[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
            `state=${inviteCode}`
          );
        }

        // Redireciona para URL de autenticação do Google
        if (this.isBrowser && authUrl) {
          window.location.href = authUrl;
        }
      }
    } catch (error) {
      console.error('Erro ao iniciar login com Google:', error);
    }
  }

  /**
   * Processa callback do Google OAuth
   * Chamado quando Google redireciona de volta para /auth/google-callback?code=XXX&state=YYY
   *
   * @param code - Código de autorização do Google
   * @param state - Estado (pode ser invite code)
   * @returns Promise com resultado da autenticação
   */
  async handleGoogleCallback(code: string, state: string): Promise<any> {
    try {

      const response = await this.executeWithHandler(
        apiRoutes.auth.googleCallback(encodeURIComponent(code), encodeURIComponent(state)),
        undefined,
        {
          successMessage: undefined,
          errorMessage: {
            title: "Erro",
            message: "Falha ao obter politicas do usuáriro"
          }
        }
      );

      if (response && response.success) {
        // Usa a MESMA lógica do login normal
        const { data: userData } = response as any as ApiResponse<AuthLoginResponse>;

        // 🍪 Cookie auth_token foi salvo AUTOMATICAMENTE pelo navegador
        // ❌ NÃO salva token no localStorage

        // ✅ Salva APENAS user data (SEM TOKEN - para UI)
        if (this.isBrowser) {
          const localStorage = this.platform.getLocalStorage();

          // Remove token antes de salvar
          const { token, ...userDataWithoutToken } = userData;

          localStorage?.setItem('user_data', JSON.stringify(userDataWithoutToken));
        }

        // Atualiza signals e BehaviorSubject
        this.currentUser.set(userData);
        this.userDataSubject.next(userData);
        this._isAuthenticated.set(true);

        this.toast.showSuccess(
          'Autenticação com Google realizada!',
          `Bem-vindo(a), ${userData.name}!`
        );

        return { success: true };
      } else {
        this.toast.showError('Erro', 'Falha ao processar autenticação com Google');
        return { success: false };
      }
    } catch (error) {
      console.error('Erro ao processar callback do Google:', error);
      this.toast.showError('Erro', 'Falha ao processar autenticação com Google');
      return { success: false };
    }
  }

  async logout(): Promise<void> {
    try {
      // 1️⃣ Chama backend para INVALIDAR cookie (delete cookie)
      // Backend vai fazer: Response.Cookies.Delete("auth_token")
      await this.executeWithHandler(
        apiRoutes.auth.logout(),
        {}, // body vazio
        {
          successMessage: {
            title: "Logout realizado",
            message: "Até logo!"
          },
          errorMessage: undefined // Não mostra erro (logout local sempre funciona)
        }
      );
    } catch (error) {
      console.error('[AuthService] Erro ao fazer logout no backend:', error);
      // Continua mesmo com erro (limpa local sempre)
    }

    // 2️⃣ Limpa localStorage
    this.clearStoredAuth();

    // 4️⃣ Redireciona para login com idioma atual
    const currentLang = this.translationService.getCurrentLanguage();
    this.router.navigate([`/${currentLang}/auth/login`]);
  }

  register(userData: any) {
    //this.loading.set(true);

    // TODO implementar lógica de registro
    throw new Error("Methord not implemented");

  }

  forgotPassword(email: string) {
    //this.loading.set(true);

    //TODO implementar logica para trocar a senha
    throw new Error("Methord not implemented");
  }

  refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    //TODO implementar lógica do refresh token
    throw new Error("Methord not implemented");
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user ? user.roles.includes(role) : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.some(role => user.roles.includes(role)) : false;
  }

  getCurrentUserData(): AuthLoginResponse | null {
    return this.userDataSubject.value;
  }

  getUserRoles(): string[] {
    const userData = this.getCurrentUserData();
    return userData?.roles || [];
  }

  hasAllRoles(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.every(role => userRoles.includes(role));
  }

  getUserPolicies(): string[] {
    const userData = this.getCurrentUserData();
    return userData?.policies || [];
  }

  hasAllPolicies(policies: string[]): boolean {
    const userPolicies = this.getUserPolicies();
    return policies.every(policy => userPolicies.includes(policy));
  }

  hasAnyPolicy(policies: string[]): boolean {
    const userPolicies = this.getUserPolicies();
    return policies.some(policy => userPolicies.includes(policy));
  }

  public hasAllModules(modules: string[]): boolean {
    const userModules = this.getUserModules();
    return modules.every(module => userModules.includes(module));
  }

  getUserModules(): string[] {
    const userData = this.getCurrentUserData();
    return userData?.modules || [];
  }

  hasAnyModule(modules: string[]): boolean {
    const userModules = this.getUserModules();
    return modules.some(module => userModules.includes(module));
  }
}
