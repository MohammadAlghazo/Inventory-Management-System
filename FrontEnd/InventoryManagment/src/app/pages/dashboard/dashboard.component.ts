import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  
  productService = inject(ProductService);
 public authService = inject(AuthService);
  totalProducts: number = 0;
  totalValue: number = 0;
  lowStockCount: number = 0;
  
  lowStockProducts: any[] = [];
  recentProducts: any[] = [];
  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.totalProducts = res.length;
        this.totalValue = res.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        this.recentProducts = res.slice(-5).reverse();
      }
    });

    this.productService.getProducts().subscribe((res: any) => {
       this.lowStockProducts = res.filter((p: any) => p.quantity <= p.minQuantity);
       this.lowStockCount = this.lowStockProducts.length;
    });
  }
}