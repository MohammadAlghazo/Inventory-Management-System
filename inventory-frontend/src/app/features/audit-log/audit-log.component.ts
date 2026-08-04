import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Activity, ChevronLeft, ChevronRight, FileText } from 'lucide-angular';
import { AuditService } from '../../core/services/audit.service';
import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditLogComponent implements OnInit {
  readonly icons = { Search, Activity, ChevronLeft, ChevronRight, FileText };

  logs: any[] = [];
  totalCount = 0;
  totalPages = 1;
  page = 1;
  pageSize = 25;
  searchQuery = '';
  searchSubject = new Subject<string>();
  isLoading = false;

  constructor(
    private auditService: AuditService,
    private exportExcel: ExportExcelService,
    private exportPdf: ExportPdfService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLogs();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.page = 1;
      this.loadLogs();
    });
  }

  loadLogs(): void {
    this.isLoading = true;
    this.auditService.getAuditLogs(this.page, this.pageSize, this.searchQuery).subscribe({
      next: (res) => {
        this.logs = res.data?.items || [];
        this.totalCount = res.data?.totalCount || 0;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize) || 1;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onPageSizeChange(): void {
    this.page = 1;
    this.loadLogs();
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadLogs();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadLogs();
    }
  }

  goToPage(pg: number): void {
    this.page = pg;
    this.loadLogs();
  }

  getPagesArray(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.page - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  exportToExcel(): void {
    this.auditService.getAuditLogs(1, 10000, this.searchQuery).subscribe({
      next: (res) => {
        const dataToExport = (res.data?.items || []).map((log: any) => ({
          'ID': log.id,
          'Timestamp': new Date(log.timestamp).toLocaleString(),
          'Username': log.username,
          'Module': log.module,
          'Action': log.action,
          'IP Address': log.ipAddress || '—',
          'Details': log.details || '—'
        }));
        this.exportExcel.export(dataToExport, 'Audit_Logs');
      }
    });
  }

  exportToPdf(): void {
    this.exportPdf.export('audit-logs-table', 'Audit_Logs_Report');
  }
}
