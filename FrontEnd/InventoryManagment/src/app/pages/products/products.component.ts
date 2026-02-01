import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  productService = inject(ProductService);
  router = inject(Router);
  products: any[] = [];

  constructor() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.products = res;
      },
      error: (err) => {
        console.log("Error fetching products:", err);
      }
    });
  }

  onDelete(id: number) {
    const isConfirmed = confirm("Are you sure you want to delete this product? 🗑️");
    
    if (isConfirmed) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          alert("Product Deleted Successfully! ✅");

          this.products = this.products.filter(p => p.id !== id);
        },
        error: (err) => {
          console.log(err);
          alert("Error deleting product ❌");
        }
      });
    }
  }

}