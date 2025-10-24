/**
 * 🎯 CLIENT - Cliente
 *
 * Gestão de clientes do sistema
 *
 * Baseado em: CLAUDE.md
 * Backend: POST /api/v1/client
 */

/**
 * Cliente (classe para validação BaseService)
 */
export class Client {
  constructor(
    public id: string,
    public fullName: string,
    public email: string,
    public phone: string,
    public documentNumber: string,
    public zipCode: string,
    public paid: boolean,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromObject(obj: any): Client {
    return new Client(
      obj.id,
      obj.fullName,
      obj.email,
      obj.phone,
      obj.documentNumber,
      obj.zipCode,
      obj.paid,
      obj.isActive,
      obj.createdAt ? new Date(obj.createdAt) : new Date(),
      obj.updatedAt ? new Date(obj.updatedAt) : new Date()
    );
  }
}

/**
 * Request para criar cliente
 */
export class CreateClientRequest {
  constructor(
    public fullName: string,
    public email: string,
    public phone: string,
    public documentNumber: string,
    public zipCode: string,
    public paid: boolean
  ) {}

  static fromObject(obj: any): CreateClientRequest {
    return new CreateClientRequest(
      obj.fullName,
      obj.email,
      obj.phone,
      obj.documentNumber,
      obj.zipCode,
      obj.paid
    );
  }
}

/**
 * Request para atualizar cliente
 */
export class UpdateClientRequest {
  constructor(
    public id: string,
    public fullName: string,
    public email: string,
    public phone: string,
    public documentNumber: string,
    public zipCode: string,
    public paid: boolean
  ) {}

  static fromObject(obj: any): UpdateClientRequest {
    return new UpdateClientRequest(
      obj.id,
      obj.fullName,
      obj.email,
      obj.phone,
      obj.documentNumber,
      obj.zipCode,
      obj.paid
    );
  }
}
