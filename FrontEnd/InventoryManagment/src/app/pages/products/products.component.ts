import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  products: Product[] = []; 

  constructor(private productService: ProductService) {} 

  ngOnInit(): void {
    this.loadProducts(); 
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data; 
        console.log('Products Loaded:', this.products); 
      },
      error: (err) => {
        console.error('Error fetching products:', err); 
      }
    });
  }
}