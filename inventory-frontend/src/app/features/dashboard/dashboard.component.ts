import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Package, AlertTriangle, Activity, Archive, DollarSign, TrendingUp, BarChart2, PieChart } from 'lucide-angular';
import { DashboardService } from '../../core/services/dashboard.service';
import { ProductService } from '../../core/services/product.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, LucideAngularModule, BaseChartDirective, TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  readonly icons = { Package, AlertTriangle, Activity, Archive, DollarSign, TrendingUp, BarChart2, PieChart };

  statsObj: any = {};
  topProducts: any[] = [];
  categories: any[] = [];
  activity: any[] = [];
  lowStockProducts: any[] = [];
  
  isLoadingStats = true;
  isLoadingActivity = true;

  // Activity Chart
  activityChartData: ChartConfiguration['data'] = {
    datasets: [
      { data: [], label: 'Add', borderColor: '#d2593b', backgroundColor: 'rgba(210, 89, 59, 0.3)', fill: true, tension: 0.4 },
      { data: [], label: 'Sell', borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.3)', fill: true, tension: 0.4 }
    ],
    labels: []
  };
  activityChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9ca3af' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9ca3af' } }
    },
    plugins: {
      legend: { labels: { color: '#f3f4f6' } }
    }
  };

  // Category Pie Chart
  pieChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#d2593b', '#f97316', '#a855f7', '#7e22ce', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
      borderWidth: 0
    }]
  };
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#f3f4f6' } }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private productService: ProductService
  ) {}

  get kpis() {
    return [
      { label: 'DASHBOARD.TOTAL_PRODUCTS', value: (this.statsObj.totalProducts || 0).toLocaleString(),       icon: this.icons.Package,       color: '#d2593b', bg: 'rgba(210, 89, 59, 0.12)',  route: '/products'  },
      { label: 'DASHBOARD.TOTAL_VALUE',    value: '$'+(this.statsObj.totalInventoryValue||0).toLocaleString(), icon: this.icons.DollarSign,    color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', route: '/products'  },
      { label: 'DASHBOARD.LOW_STOCK',      value: (this.statsObj.lowStockCount || 0).toLocaleString(),       icon: this.icons.AlertTriangle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', route: '/products'  },
      { label: 'DASHBOARD.ITEMS_OUT',      value: (this.statsObj.todaysMovements || 0).toLocaleString(),     icon: this.icons.Activity,      color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)',  route: '/inventory' },
    ];
  }

  ngOnInit() {
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        this.statsObj = res.data;
        this.isLoadingStats = false;
      },
      error: () => this.isLoadingStats = false
    });

    this.productService.getLowStockProducts().subscribe({
      next: (res) => {
        this.lowStockProducts = res.data || [];
      },
      error: () => {}
    });

    this.dashboardService.getActivityChart(30).subscribe({
      next: (res) => {
        this.activity = res.data;
        this.activityChartData.labels = this.activity.map(a => a.date.substring(5));
        this.activityChartData.datasets[0].data = this.activity.map(a => a.addCount);
        this.activityChartData.datasets[1].data = this.activity.map(a => a.sellCount);
        this.activityChartData = { ...this.activityChartData };
        this.isLoadingActivity = false;
      },
      error: () => this.isLoadingActivity = false
    });

    this.dashboardService.getCategoryBreakdown().subscribe(res => {
      this.categories = res.data;
      this.pieChartData.labels = this.categories.map(c => c.category);
      this.pieChartData.datasets[0].data = this.categories.map(c => c.productCount);
      this.pieChartData = { ...this.pieChartData };
    });

    this.dashboardService.getTopProducts(5).subscribe(res => {
      this.topProducts = res.data;
    });
  }
}
