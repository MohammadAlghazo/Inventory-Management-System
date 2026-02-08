import { Routes } from '@angular/router';
import { ProductsComponent } from './pages/products/products.component';
import { ProductFormComponent } from './pages/product-form/product-form.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  
  { path: 'login', component: LoginComponent },

  { 
    path: '', 
    component: DashboardComponent, 
    canActivate: [authGuard]
  },
  
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [authGuard]
  },

  { 
    path: 'products', 
    component: ProductsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'products/create', 
    component: ProductFormComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'products/edit/:id', 
    component: ProductFormComponent,
    canActivate: [authGuard] 
  }
];