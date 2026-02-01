import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  productService = inject(ProductService);
  router = inject(Router);

  products: any[] = [];
  filteredProducts: any[] = [];
  searchTerm: string = '';   

  constructor() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.products = res;
        this.filteredProducts = res;
      },
      error: (err) => {
        console.log("Error fetching products:", err);
      }
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(item => 
      item.name.toLowerCase().includes(term) || 
      item.category.toLowerCase().includes(term)
    );
  }

  onDelete(id: number) {
    const isConfirmed = confirm("Are you sure you want to delete this product? 🗑️");
    
    if (isConfirmed) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          alert("Product Deleted Successfully! ✅");

          this.products = this.products.filter(p => p.id !== id);
          
          this.onSearch();
        },
        error: (err) => {
          console.log(err);
          alert("Error deleting product ❌");
        }
      });
    }
  }

}