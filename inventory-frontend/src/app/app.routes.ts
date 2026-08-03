import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { LayoutComponent } from './core/components/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'products', loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent) },
      { path: 'inventory', loadComponent: () => import('./features/inventory/inventory.component').then(m => m.InventoryComponent) },
      { path: 'users', loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent), canActivate: [RoleGuard], data: { roles: ['SuperAdmin'] } },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent), canActivate: [RoleGuard], data: { roles: ['SuperAdmin', 'InventoryManager'] } },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./features/suppliers/suppliers.component').then(m => m.SuppliersComponent),
        canActivate: [RoleGuard],
         data: { roles: ['SuperAdmin', 'InventoryManager', 'PurchasingOfficer', 'WarehouseStaff'] }
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/customers.component').then(m => m.CustomersComponent),
        canActivate: [RoleGuard],
         data: { roles: ['SuperAdmin', 'InventoryManager', 'Sales', 'WarehouseStaff'] }
      },
      {
        path: 'purchase-orders',
        loadComponent: () => import('./features/purchase-orders/purchase-orders.component').then(m => m.PurchaseOrdersComponent),
        canActivate: [RoleGuard],
        data: { roles: ['SuperAdmin', 'Manager', 'InventoryManager', 'PurchasingOfficer'] }
      },
      {
        path: 'sales-orders',
        loadComponent: () => import('./features/sales-orders/sales-orders.component').then(m => m.SalesOrdersComponent),
        canActivate: [RoleGuard],
        data: { roles: ['SuperAdmin', 'Manager', 'InventoryManager', 'Sales'] }
      },
      {
        path: 'low-stock',
        loadComponent: () => import('./features/reports/low-stock/low-stock.component').then(m => m.LowStockComponent),
        canActivate: [RoleGuard],
         data: { roles: ['SuperAdmin', 'InventoryManager'] }
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
        canActivate: [RoleGuard],
         data: { roles: ['SuperAdmin', 'InventoryManager'] }
      },
      {
        path: 'ai-assistant',
        loadComponent: () => import('./features/ai-assistant/ai-assistant.component').then(m => m.AiAssistantComponent)
      },
      {
        path: 'audit-log',
        loadComponent: () => import('./features/audit-log/audit-log.component').then(m => m.AuditLogComponent),
        canActivate: [RoleGuard],
        data: { roles: ['SuperAdmin'] }
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
