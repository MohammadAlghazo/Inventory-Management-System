import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../core/services/report.service';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, AlertTriangle, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslatePipe],
  templateUrl: './low-stock.component.html',
  styleUrl: './low-stock.component.css'
})
export class LowStockComponent implements OnInit {
  alerts: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  AlertTriangleIcon = AlertTriangle;
  AlertCircleIcon = AlertCircle;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading = true;
    this.reportService.getLowStockAlerts().subscribe({
      next: (res) => {
        this.alerts = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load low stock alerts.';
        this.loading = false;
      }
    });
  }
}
