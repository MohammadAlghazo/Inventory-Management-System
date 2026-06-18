import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { LayoutComponent } from './core/components/layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductsComponent } from './features/products/products.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { UsersComponent } from './features/users/users.component';
import { SettingsComponent } from './features/settings/settings.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'users', component: UsersComponent },
      { path: 'settings', component: SettingsComponent },
      {
        path: 'suppliers',
        loadComponent: () => import('./features/suppliers/suppliers.component').then(m => m.SuppliersComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/customers.component').then(m => m.CustomersComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
