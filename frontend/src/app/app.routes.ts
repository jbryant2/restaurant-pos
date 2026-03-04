import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'tables', loadComponent: () => import('./components/tables/tables.component').then(m => m.TablesComponent) },
      { path: 'menu', loadComponent: () => import('./components/menu/menu.component').then(m => m.MenuComponent) },
      { path: 'orders', loadComponent: () => import('./components/orders/orders.component').then(m => m.OrdersComponent) },
      { path: 'inventory', loadComponent: () => import('./components/inventory/inventory.component').then(m => m.InventoryComponent) },
      { path: 'reports', loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent) },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
