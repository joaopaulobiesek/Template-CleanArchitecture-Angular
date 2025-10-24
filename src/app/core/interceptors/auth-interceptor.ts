import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * 🍪 Auth Interceptor com Cookie HTTP-Only
 *
 * ANTES: Adicionava Authorization: Bearer {token} do localStorage
 * AGORA: Apenas adiciona withCredentials: true
 *
 * O token está no cookie HTTP-Only (auth_token)
 * e é enviado AUTOMATICAMENTE pelo navegador
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // ✅ Adiciona withCredentials em TODAS as requisições
  // Isso faz o navegador enviar o cookie automaticamente
  const authReq = req.clone({
    withCredentials: environment.withCredentials
  });

  return next(authReq);
};