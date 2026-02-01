import { Routes } from '@angular/router';
import { ProductsComponent } from './pages/products/products.component';
import { ProductFormComponent } from './pages/product-form/product-form.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  
  { path: '', component: DashboardComponent }, 

  { path: 'products', component: ProductsComponent },
  
  { path: 'products/create', component: ProductFormComponent },

  { path: 'products/edit/:id', component: ProductFormComponent },
];