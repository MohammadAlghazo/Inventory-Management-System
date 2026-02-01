import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  
  productService = inject(ProductService);

  totalProducts: number = 0;
  totalValue: number = 0;
  lowStockCount: number = 0;

  ngOnInit(): void {
    this.loadStats();
  }

loadStats() {
    this.productService.getProducts().subscribe({
      next: (res: any) => {

        this.totalProducts = res.length;

        this.totalValue = res.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

        this.lowStockCount = res.filter((item: any) => item.quantity <= item.minQuantity).length;
      },
      error: (err) => {
        console.error("Error fetching data", err);
      }
    });
  }
}