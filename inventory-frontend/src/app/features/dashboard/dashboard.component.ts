import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Package, AlertTriangle, Activity, Archive, DollarSign, TrendingUp } from 'lucide-angular';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats = {
    totalProducts: 0,
    lowStock: 0,
    totalValue: 0,
    recentActivity: 0
  };

  recentLogs: any[] = [];
  isLoading = false;

  get kpis() {
    return [
      { label: 'Total Products', value: this.stats.totalProducts.toString(), icon: 'package', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' },
      { label: 'Total Value', value: '$' + this.stats.totalValue.toLocaleString(), icon: 'dollar-sign', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
      { label: 'Low Stock', value: this.stats.lowStock.toString(), icon: 'alert-triangle', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
      { label: 'Items Out', value: this.stats.recentActivity.toString(), icon: 'activity', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
    ];
  }

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (products: any[]) => {
        this.stats.totalProducts = products.length;
        this.stats.lowStock = products.filter(p => p.quantity <= p.minQuantity).length;
        this.stats.totalValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
