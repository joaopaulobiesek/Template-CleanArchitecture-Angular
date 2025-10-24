import { Injectable } from '@angular/core';
import { BaseService } from '../../../core/abstractions/class-parents/base.service';
import { apiRoutes } from '../../../core/abstractions/http/api-routes';
import { Rule } from '../../../core/abstractions/http/models/response/user/rule.response';
import { Policy } from '../../../core/abstractions/http/models/response/user/policy.response';

@Injectable({
  providedIn: 'root'
})
export class UserDatasourceService extends BaseService {
  protected getEndpoints() {
    return {
      create: apiRoutes.users.create(),
      update: apiRoutes.users.update(),
      list: apiRoutes.users.list(),
      delete: (id: string) => apiRoutes.users.delete(id)
    };
  }

  public async getRoles(): Promise<Rule[]> {
    const res = await this.executeWithHandler(
      apiRoutes.users.getRoles(),
      undefined,
      {
        successMessage: undefined,
        errorMessage: {
          title: "Erro",
          message: "Falha ao obter regras do usuáriro"
        }
      }
    );
    return res.data;
  }

  public async getPolicies(): Promise<Policy[]> {
    const res = await this.executeWithHandler(
      apiRoutes.users.getPolices(),
      undefined,
      {
        successMessage: undefined,
        errorMessage: {
          title: "Erro",
          message: "Falha ao obter politicas do usuáriro"
        }
      }
    );
    return res.data;
  }
}
