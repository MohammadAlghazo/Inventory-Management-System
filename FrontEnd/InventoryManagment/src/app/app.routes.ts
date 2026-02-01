import { Routes } from '@angular/router';
import { ProductsComponent } from './pages/products/products.component';
import { ProductFormComponent } from './pages/product-form/product-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  
  { path: 'products/create', component: ProductFormComponent },
  
  { path: 'products/edit/:id', component: ProductFormComponent },

  { path: 'products', component: ProductsComponent },
];