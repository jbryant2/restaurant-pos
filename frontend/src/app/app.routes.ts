import { Routes } from '@angular/router';
import { TableManagementComponent } from './features/tables/table-management/table-management';

export const routes: Routes = [
  { path: '', redirectTo: '/tables', pathMatch: 'full' },
  { path: 'tables', component: TableManagementComponent }
];