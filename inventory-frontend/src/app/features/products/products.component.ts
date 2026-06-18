import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, Search, Edit2, Trash2 } from 'lucide-angular';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-products',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  isLoading = false;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data: any[]) => {
        this.products = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
