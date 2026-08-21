import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { ShellComponent } from './core/layout/shell.component';

/**
 * Top-level application routing table with lazy-loaded standalone feature components.
 */
export const routes: Routes = [
  // Public authentication routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Authenticated shell routes wrapped with functional authGuard
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          )
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/category-list.component').then(
            (m) => m.CategoryListComponent
          )
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transaction-list.component').then(
            (m) => m.TransactionListComponent
          )
      },
      {
        path: 'budgets',
        loadComponent: () =>
          import('./features/budgets/budget-list.component').then(
            (m) => m.BudgetListComponent
          )
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent
          )
      }
    ]
  },

  // Fallback wildcard route
  { path: '**', redirectTo: 'dashboard' }
];
