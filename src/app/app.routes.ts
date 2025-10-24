import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { loggedOutGuard } from './core/guards/logged-out.guard';
import { LanguageGuard } from './core/guards/language.guard';

export const routes: Routes = [
    // Redireciona raiz para idioma padrão
    {
        path: '',
        redirectTo: '/pt-br/auth/login',
        pathMatch: 'full',
    },

    // 🔓 Rota do Google Callback SEM idioma (sempre em inglês)
    {
        path: 'auth/google-callback',
        loadComponent: () => import('./features/auth/google-callback/google-callback').then(m => m.GoogleCallback)
    },

    // Todas as rotas sob :lang (pt-br, en-us, etc)
    {
        path: ':lang',
        canActivate: [LanguageGuard],
        children: [
            // Rotas de autenticação (públicas)
            {
                path: 'auth',
                children: [
                    {
                        path: 'login',
                        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
                        canActivate: [loggedOutGuard]
                    },
                    {
                        path: 'login-loading',
                        loadComponent: () => import('./features/auth/login-loading/login-loading.component').then(m => m.LoginLoadingComponent)
                    },
                    {
                        path: 'register',
                        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
                        canActivate: [loggedOutGuard]
                    },
                ]
            },

            // Rotas protegidas (com MainLayout)
            {
                path: '',
                component: MainLayoutComponent,
                canActivate: [authGuard],
                children: [
                    {
                        path: '',
                        redirectTo: 'dashboard',
                        pathMatch: 'full'
                    },
                    {
                        path: 'dashboard',
                        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
                    },
                    // 👥 USUÁRIOS
                    {
                        path: "users",
                        loadComponent: () => import("./features/admin/user/user.component").then(x => x.UserComponent)
                    },
                    // 👥 CLIENTS - Gestão de Clientes
                    {
                        path: "clients",
                        loadComponent: () => import("./features/clients/clients.component").then(x => x.ClientsComponent)
                    },
                    {
                        path: "clients/new",
                        loadComponent: () => import("./features/clients/client-form/client-form.component").then(x => x.ClientFormComponent)
                    },
                    {
                        path: "clients/:id/edit",
                        loadComponent: () => import("./features/clients/client-form/client-form.component").then(x => x.ClientFormComponent)
                    },
                ]
            },
        ]
    },

    // Fallback para idioma inválido ou rotas antigas
    {
        path: '**',
        redirectTo: '/pt-br'
    }
];