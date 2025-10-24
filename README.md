# 🚀 Template Angular SSR Multi-Tenant

> Template empresarial pronto para produção com Angular 19 + PrimeNG 20 + SSR, projetado para aplicações SaaS escaláveis.

[![Angular](https://img.shields.io/badge/Angular-19-red.svg)](https://angular.io/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-20-blue.svg)](https://www.primefaces.org/primeng/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![SSR](https://img.shields.io/badge/SSR-Enabled-green.svg)](https://angular.io/guide/universal)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Características Principais](#características-principais)
- [Tecnologias](#tecnologias)
- [Backend Integrado](#backend-integrado)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Usar](#como-usar)
- [Internacionalização (I18N)](#internacionalização-i18n)
- [Design System](#design-system)
- [Deploy](#deploy)
- [Exemplos Incluídos](#exemplos-incluídos)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 📖 Sobre o Projeto

Este é um **template empresarial completo** desenvolvido para acelerar o desenvolvimento de aplicações SaaS Multi-Tenant. Fornece uma base sólida com autenticação, internacionalização, paginação automática, design system profissional e arquitetura limpa.

**Ideal para:**
- ✅ Aplicações SaaS B2B
- ✅ Sistemas de gestão empresarial
- ✅ Dashboards administrativos
- ✅ Aplicações multi-idioma
- ✅ Sistemas multi-tenant

---

## ⭐ Características Principais

### 🎨 **Design System Profissional**
- Variáveis CSS customizáveis
- Tema verde corporativo
- Componentes PrimeNG estilizados
- Responsivo (mobile-first)
- Dark mode preparado

### 🌍 **Internacionalização (I18N)**
- Múltiplos idiomas (PT-BR, EN-US)
- URL com idioma (`/pt-br/dashboard`, `/en-us/dashboard`)
- Traduções por módulo
- Language selector no header
- Fácil adicionar novos idiomas

### 🔐 **Autenticação Completa**
- Login com email/senha
- OAuth Google
- JWT com HTTP-only cookies
- Guards de rota (auth, language)
- Telas de login/registro estilizadas
- Recuperação de senha (preparado)

### 📊 **Componentes Prontos**
- Listagem com paginação automática
- Busca com debounce
- Ordenação de colunas
- Filtros customizados
- Menu de ações (editar/deletar)
- Estados de loading/erro/empty
- Modais de confirmação

### 🏗️ **Arquitetura Limpa**
- BaseComponent para listagens (CRUD automático)
- BaseService para APIs (CRUD pré-montado)
- Interceptors configurados
- Error handling centralizado
- State management com Signals
- SSR (Server-Side Rendering)

### 🚀 **Performance e SEO**
- Angular Universal (SSR)
- Lazy loading de módulos
- OnPush change detection
- Meta tags dinâmicas
- Open Graph tags
- Sitemap preparado

### 🎯 **Multi-Tenant**
- Detecção por subdomínio
- Temas por tenant
- Contexto global de tenant
- Interceptor de tenant-id
- Customização dinâmica

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Angular** | 19.x | Framework principal |
| **PrimeNG** | 20.x | Biblioteca de componentes UI |
| **TypeScript** | 5.7+ | Linguagem tipada |
| **SCSS** | - | Pré-processador CSS |
| **Angular Universal** | - | Server-Side Rendering |
| **RxJS** | 7.x | Programação reativa |
| **Angular Signals** | - | Reatividade moderna |
| **PrimeIcons** | - | Ícones |

---

## 🔗 Backend Integrado

Este template foi desenvolvido para integrar perfeitamente com o backend em **C# Clean Architecture**:

🔗 **[Template-CleanArchitecture (Backend)](https://github.com/joaopaulobiesek/Template-CleanArchitecture)**

### Características da Integração:
- ✅ **Contratos sincronizados** - Endpoints mapeados em `api-routes.ts`
- ✅ **JWT Authentication** - Tokens HTTP-only cookies
- ✅ **Paginação padronizada** - `PaginatedList<T>` compatível
- ✅ **Error handling** - Mensagens de erro tratadas
- ✅ **Multi-tenant** - Header `X-Tenant-Id` automático
- ✅ **CORS configurado** - Desenvolvimento e produção

---

## ✅ Pré-requisitos

- **Node.js** 20.x ou superior
- **npm** 10.x ou superior
- **Angular CLI** 19.x
- **Git**
- **Backend rodando** ([Template Clean Architecture](https://github.com/joaopaulobiesek/Template-CleanArchitecture))

---

## 🚀 Instalação

### 1️⃣ Clone o repositório:

```bash
git clone https://github.com/joaopaulobiesek/Template-CleanArchitecture-Angular.git
cd Template-CleanArchitecture-Angular
```

### 2️⃣ Instale as dependências:

```bash
npm install
```

### 3️⃣ Configure as variáveis de ambiente:

Crie o arquivo `src/environments/environment.development.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7001',  // URL do backend
  apiVersion: 'v1'
};
```

### 4️⃣ Execute o projeto:

```bash
# Desenvolvimento (sem SSR)
npm run dev

# Desenvolvimento com SSR
npm run build:ssr
npm start
```

### 5️⃣ Acesse no navegador:

```
http://localhost:4200/pt-br/auth/login
```

**Credenciais de teste (configurar no backend):**
- Email: `admin@admin.com`
- Senha: `*Admin123`

---

## 📁 Estrutura do Projeto

```
src/app/
├── core/                          # Núcleo da aplicação
│   ├── abstractions/              # Classes base e contratos
│   │   ├── class-parents/
│   │   │   ├── base.component.ts  # Base para listagens com paginação
│   │   │   └── base.service.ts    # Base para serviços CRUD
│   │   └── http/
│   │       └── api-routes.ts      # Mapeamento de endpoints
│   ├── guards/                    # Proteção de rotas
│   ├── interceptors/              # Interceptors HTTP
│   ├── services/                  # Serviços globais
│   │   ├── translation.service.ts # I18N
│   │   └── platform.service.ts    # SSR helpers
│   └── models/                    # Modelos de dados
│
├── features/                      # Funcionalidades por módulo
│   ├── auth/                      # Autenticação
│   │   ├── login/
│   │   ├── register/
│   │   └── google-callback/
│   ├── dashboard/                 # Dashboard principal
│   └── clients/                   # Exemplo: CRUD de clientes
│       ├── clients.component.ts   # Listagem
│       ├── client-form/           # Formulário
│       └── services/              # Service do módulo
│
├── layout/                        # Layout da aplicação
│   ├── header/                    # Header com breadcrumb
│   ├── sidebar/                   # Sidebar colapsável
│   └── footer/                    # Footer dinâmico
│
├── shared/                        # Componentes compartilhados
│   └── components/
│       └── search-debounce/       # Busca com debounce
│
└── app.routes.ts                  # Configuração de rotas

assets/i18n/                       # Traduções
├── global/                        # Traduções globais
│   ├── pt-br.json
│   └── en-us.json
└── features/                      # Traduções por feature
    ├── clients/
    ├── dashboard/
    └── auth/

src/styles/                        # Estilos globais
├── _design-system.scss            # Variáveis CSS
├── _components.scss               # Componentes globais
├── _data-table.scss               # Estilos de tabela
└── _prime-*.scss                  # Overrides PrimeNG
```

---

## 💡 Como Usar

### 🔹 Criar Nova Feature de Listagem

**1. Crie o modelo:**

```typescript
// src/app/core/models/product.model.ts
export class Product {
  id!: string;
  name!: string;
  price!: number;
  createdAt!: Date;
}
```

**2. Crie o serviço:**

```typescript
// src/app/features/products/services/product.service.ts
import { Injectable } from '@angular/core';
import { BaseService } from '../../../core/abstractions/class-parents/base.service';
import { apiRoutes } from '../../../core/abstractions/http/api-routes';

@Injectable({ providedIn: 'root' })
export class ProductService extends BaseService {
  protected getEndpoints() {
    return {
      list: apiRoutes.products.list,
      getById: apiRoutes.products.getById,
      create: apiRoutes.products.create,
      update: apiRoutes.products.update,
      delete: apiRoutes.products.delete
    };
  }
}
```

**3. Cadastre os endpoints:**

```typescript
// src/app/core/abstractions/http/api-routes.ts
export const apiRoutes = {
  products: {
    list: (): EndpointConfig => ({
      url: ['/api/v1/Products', 'GET'] as TypedUrlProps
    }),
    getById: (id: string): EndpointConfig => ({
      url: [`/api/v1/Products/${id}`, 'GET'] as TypedUrlProps
    }),
    create: (): EndpointConfig => ({
      url: ['/api/v1/Products', 'POST'] as TypedUrlProps
    }),
    update: (id: string): EndpointConfig => ({
      url: [`/api/v1/Products/${id}`, 'PUT'] as TypedUrlProps
    }),
    delete: (id: string): EndpointConfig => ({
      url: [`/api/v1/Products/${id}`, 'DELETE'] as TypedUrlProps
    })
  }
};
```

**4. Crie o componente:**

```typescript
// src/app/features/products/products.component.ts
import { Component, inject } from '@angular/core';
import { BaseComponent } from '../../core/abstractions/class-parents/base.component';
import { Product } from '../../core/models/product.model';
import { ProductService } from './services/product.service';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  standalone: true,
  imports: [/* ... */]
})
export class ProductsComponent extends BaseComponent<Product> {

  constructor() {
    const productService = inject(ProductService);
    super(productService);
  }

  private productService = inject(ProductService);
  public translationService = inject(TranslationService);

  protected async setupComponent(): Promise<void> {
    await this.translationService.loadFeatureTranslations('products');
    this.setupMenuItems();
  }

  private setupMenuItems(): void {
    this.setItems([
      {
        label: 'Ações',
        items: [
          {
            label: 'Editar',
            icon: 'pi pi-pencil',
            command: () => this.editProduct()
          },
          {
            label: 'Excluir',
            icon: 'pi pi-trash',
            command: () => this.deleteProduct()
          }
        ]
      }
    ]);
  }

  private editProduct(): void {
    const currentLang = this.translationService.getCurrentLanguage();
    this.router.navigate(['/', currentLang, 'products', this.selectedItem!.id, 'edit']);
  }

  private deleteProduct(): void {
    // Implementar confirmação e exclusão
  }
}
```

**5. Crie as traduções:**

```json
// assets/i18n/features/products/pt-br.json
{
  "products": {
    "title": "Produtos",
    "description": "Gerenciamento de produtos",
    "noData": "Nenhum produto encontrado",
    "search": "Buscar produtos...",
    "fields": {
      "name": "Nome",
      "price": "Preço",
      "createdAt": "Criado em"
    }
  }
}
```

**6. Adicione a rota:**

```typescript
// src/app/app.routes.ts
{
  path: ':lang',
  children: [
    {
      path: 'products',
      loadComponent: () => import('./features/products/products.component')
        .then(m => m.ProductsComponent),
      canActivate: [authGuard]
    }
  ]
}
```

**Pronto!** Você tem uma listagem completa com:
- ✅ Paginação automática
- ✅ Busca com debounce
- ✅ Ordenação de colunas
- ✅ Estados de loading/erro
- ✅ Menu de ações
- ✅ Tradução

---

## 🌍 Internacionalização (I18N)

### Estrutura de Traduções:

```
assets/i18n/
├── global/              # Traduções globais (menu, botões comuns)
│   ├── pt-br.json
│   └── en-us.json
└── features/            # Traduções por feature
    ├── clients/
    │   ├── pt-br.json
    │   └── en-us.json
    └── products/
        ├── pt-br.json
        └── en-us.json
```

### Como Usar no Template:

```html
<!-- Uso básico -->
<h1>{{ 'products.title' | translate }}</h1>

<!-- Com parâmetros -->
<p>{{ 'products.totalCount' | translate: { count: totalItems } }}</p>

<!-- Em atributos -->
<input [placeholder]="'common.search' | translate" />

<!-- Em botões (SEMPRE incluir currentLang em navegação) -->
<button [routerLink]="['/', translationService.getCurrentLanguage(), 'products', 'new']">
  {{ 'common.create' | translate }}
</button>
```

### Adicionar Novo Idioma:

1. Adicionar em `translation.service.ts`:
```typescript
public readonly availableLanguages: LanguageConfig[] = [
  { code: 'pt-br', flag: '🇧🇷', label: 'PT' },
  { code: 'en-us', flag: '🇺🇸', label: 'EN' },
  { code: 'es-es', flag: '🇪🇸', label: 'ES' },  // ✅ Novo
];
```

2. Criar arquivos JSON em `assets/i18n/global/es-es.json` e features

3. Pronto! O language selector mostrará automaticamente

---

## 🎨 Design System

### Variáveis CSS Principais:

```scss
:root {
  /* Cores */
  --primary-color: #6BB800;           /* Verde principal */
  --surface-card: #ffffff;            /* Cards */
  --text-color: #1a1a1a;              /* Texto */

  /* Espaçamentos */
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;

  /* Sombras */
  --shadow-soft: 0 2px 12px rgba(0, 0, 0, 0.08);

  /* Animações */
  --duration-fast: 0.2s;
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Customizar Cores:

Edite `src/styles/_design-system.scss` e todas as variáveis serão aplicadas globalmente.

### Componentes Estilizados:

- ✅ Botões (primário, secundário, danger)
- ✅ Inputs e formulários
- ✅ Tabelas com hover e sort
- ✅ Cards com sombra
- ✅ Modais e dialogs
- ✅ Toasts e notificações
- ✅ Dropdown e selects
- ✅ Paginação

---

## 🚀 Deploy

### Azure App Service (Recomendado)

**1. Build SSR:**

```bash
npm run build:ssr
```

**2. Configure o `azure-pipelines.yml`:**

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'

  - script: |
      npm install
      npm run build:ssr
    displayName: 'Build Angular SSR'

  - task: CopyFiles@2
    inputs:
      SourceFolder: 'dist'
      Contents: '**'
      TargetFolder: '$(Build.ArtifactStagingDirectory)'

  - task: PublishBuildArtifacts@1

  - task: AzureWebApp@1
    inputs:
      azureSubscription: 'sua-subscription'
      appName: 'seu-app-name'
      package: '$(Build.ArtifactStagingDirectory)'
      startUpCommand: 'npm start'
```

**3. Configure no Azure:**
- Runtime: Node 20 LTS
- Startup Command: `npm start`
- Environment Variables: `NODE_ENV=production`, `API_URL=https://api.seudominio.com`

### Vercel (Alternativo)

```bash
npm i -g vercel
vercel --prod
```

### Heroku (Alternativo)

```bash
heroku create seu-app-name
git push heroku main
```

---

## 📦 Exemplos Incluídos

### ✅ CRUD Completo de Clientes

Localização: `src/app/features/clients/`

**Inclui:**
- Listagem com paginação
- Busca e filtros
- Ordenação de colunas
- Formulário de criação/edição
- Validação de campos
- Máscaras (CPF, telefone, CEP)
- Menu de ações (editar/deletar)
- Estados de loading/erro/empty
- Traduções PT-BR e EN-US

**Como testar:**
1. Execute o backend: [Template Clean Architecture](https://github.com/joaopaulobiesek/Template-CleanArchitecture)
2. Faça login no sistema
3. Acesse: `http://localhost:4200/pt-br/clients`

---

## 📸 Screenshots

### Login
![Login](docs/images/login.png)

### Dashboard
![Dashboard](docs/images/dashboard.png)

### Listagem de Clientes
![Clients](docs/images/clients.png)

### Mobile Responsivo
![Mobile](docs/images/mobile.png)

*(Adicione screenshots reais na pasta `docs/images/`)*

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Commit:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração de código
- `test:` Testes
- `chore:` Manutenção

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🔗 Links Úteis

- 📖 [Documentação Angular](https://angular.io/docs)
- 🎨 [PrimeNG Components](https://www.primefaces.org/primeng/)
- 🔗 [Backend Template (C# Clean Architecture)](https://github.com/joaopaulobiesek/Template-CleanArchitecture)
- 🚀 [Angular Universal](https://angular.io/guide/universal)
- 💬 [Abrir Issue](https://github.com/seu-usuario/template-angular-ssr-multitenant/issues)

---

## 👨‍💻 Autor

**João Paulo Biesek**

- GitHub: [@joaopaulobiesek](https://github.com/joaopaulobiesek)
- LinkedIn: [linkedin.com/in/joaopaulobiesek](https://linkedin.com/in/joaopaulobiesek)

---

## ⭐ Mostre seu Apoio

Se este template foi útil para você, considere dar uma ⭐ no repositório!

---

## 📊 Roadmap

- [ ] Adicionar testes unitários e E2E
- [ ] Implementar PWA
- [ ] Adicionar mais componentes reutilizáveis
- [ ] Criar gerador de CRUD via CLI
- [ ] Adicionar suporte a WebSockets
- [ ] Integração com Docker
- [ ] CI/CD para GitHub Actions

---

**Desenvolvido com ❤️ para acelerar o desenvolvimento de aplicações empresariais**
