import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../core/services/report.service';
import { LucideAngularModule, DollarSign, TrendingUp, AlertCircle, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  activeTab: 'valuation' | 'abc' = 'valuation';

  valuations: any[] = [];
  abcData: any[] = [];
  
  loading: boolean = true;
  error: string | null = null;

  DollarSignIcon = DollarSign;
  TrendingUpIcon = TrendingUp;
  AlertCircleIcon = AlertCircle;
  RefreshCwIcon = RefreshCw;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadData();
  }

  setTab(tab: 'valuation' | 'abc'): void {
    this.activeTab = tab;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    if (this.activeTab === 'valuation') {
      this.reportService.getValuation().subscribe({
        next: (res) => {
          this.valuations = res.data || [];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load valuation report.';
          this.loading = false;
        }
      });
    } else {
      this.reportService.getAbcAnalysis().subscribe({
        next: (res) => {
          this.abcData = res.data || [];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load ABC analysis.';
          this.loading = false;
        }
      });
    }
  }

  getTotalValuation(): number {
    return this.valuations.reduce((sum, v) => sum + v.totalValue, 0);
  }

  getAbcClassColor(classification: string): string {
    switch (classification) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
