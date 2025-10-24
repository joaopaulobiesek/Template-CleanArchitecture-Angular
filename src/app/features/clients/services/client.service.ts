import { Injectable } from '@angular/core';
import { BaseService } from '../../../core/abstractions/class-parents/base.service';
import { apiRoutes } from '../../../core/abstractions/http/api-routes';
import { ApiResponse } from '../../../core/models/apiResponse';
import { AnotherArgs } from '../../../core/interfaces/another-args.interface';

/**
 * 🎯 CLIENT SERVICE
 *
 * Serviço para gestão de clientes
 * Herda de BaseService para ter métodos CRUD automáticos
 *
 * Endpoints disponíveis (via apiRoutes.clients):
 * - GET    /tenant/api/v1/Client (list com paginação)
 * - POST   /tenant/api/v1/Client (create)
 * - PUT    /tenant/api/v1/Client (update)
 * - PATCH  /tenant/api/v1/Client/Deactivate (deactivate)
 * - DELETE /tenant/api/v1/Client/Delete/{id} (delete físico)
 */
@Injectable({
  providedIn: 'root'
})
export class ClientService extends BaseService {

  // ========================================
  // CONFIGURAÇÃO DE ENDPOINTS (BaseService)
  // ========================================
  protected override getEndpoints() {
    return {
      create: apiRoutes.clients.create(),
      update: apiRoutes.clients.update(),
      list: apiRoutes.clients.list(),
      getById: (id: string) => apiRoutes.clients.getById(id),
      delete: (id: string) => apiRoutes.clients.delete(id)
    };
  }

  // ========================================
  // MÉTODO ESPECÍFICO: DESATIVAR CLIENTE
  // ========================================
  /**
   * Desativa um cliente (soft delete)
   * PATCH /tenant/api/v1/Client/Deactivate
   *
   * @param clientId - ID do cliente a ser desativado
   * @param options - Opções adicionais (mensagens de toast, etc)
   * @returns Promise com ApiResponse<string>
   */
  public async deactivate(clientId: string, options?: AnotherArgs): Promise<ApiResponse<string>> {
    const res = await this.executeWithHandler(
      apiRoutes.clients.deactivate(),
      { id: clientId },
      options
    );
    return res;
  }

  // ========================================
  // OVERRIDE UPDATE - Adapta para API específica
  // ========================================
  /**
   * Atualiza cliente
   * PUT /tenant/api/v1/Client
   *
   * ⚠️ IMPORTANTE: O ID vai no BODY, não na URL
   *
   * @param id - ID do cliente
   * @param data - Dados de atualização
   * @param options - Opções adicionais
   */
  override async update<TRequest, TResponse>(
    id: string,
    data: TRequest,
    options?: AnotherArgs
  ): Promise<ApiResponse<TResponse>> {
    // Garante que o id está no body (conforme API)
    const dataWithId = { ...data, id } as TRequest;

    return await this.executeWithHandler<TRequest, ApiResponse<TResponse>>(
      apiRoutes.clients.update(),
      dataWithId,
      options
    );
  }
}
