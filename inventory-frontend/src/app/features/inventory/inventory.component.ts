import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Download, Plus, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-angular';
import { InventoryService } from '../../core/services/inventory.service';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SweetAlertService } from '../../core/services/sweetalert.service';
import { Html5Qrcode } from 'html5-qrcode';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe, HasPermissionDirective],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryComponent implements OnInit, OnDestroy {
  readonly icons = { Search, Download, Plus, ClipboardList, ChevronLeft, ChevronRight };

  logs: any[] = [];
  products: any[] = [];
  totalCount = 0;
  totalPages = 1;
  page = 1;
  pageSize = 15;
  actionFilter = '';
  searchQuery = '';
  searchSubject = new Subject<string>();
  isLoading = false;

  user: any;

  actionModal: 'add' | 'sell' | 'adjust' | 'return' | null = null;
  isSubmitting = false;
  actionError = '';

  selectedProductId: number | '' = '';
  selectedWarehouseId: number | '' = '';
  quantity: number = 1;
  notes: string = '';

  warehouses: any[] = [];

  constructor(
    private inventoryService: InventoryService,
    private productService: ProductService,
    private authService: AuthService,
    private exportExcel: ExportExcelService,
    private exportPdf: ExportPdfService,
    private http: HttpClient,
    private sweetAlert: SweetAlertService,
    private cdr: ChangeDetectorRef
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadLogs();
    this.loadProducts();
    this.loadWarehouses();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.page = 1;
      this.loadLogs();
    });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
    if (this.scanning && this.qrReader) {
      try {
        this.qrReader.stop().catch(() => {});
      } catch (e) {}
    }
  }

  loadWarehouses() {
    this.http.get<any>(`${environment.apiUrl}/lookup/warehouses`).subscribe({
      next: (res) => {
        this.warehouses = res.data || [];
        this.cdr.markForCheck();
      }
    });
  }

  loadLogs() {
    this.isLoading = true;
    this.inventoryService.getInventoryLogs(this.page, this.pageSize, this.actionFilter, this.searchQuery).subscribe({
      next: (res) => {
        this.logs = res.data?.items || [];
        this.totalCount = res.data?.totalCount || 0;
        this.totalPages = res.data?.totalPages || 1;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getFilteredLogs() {
    return this.logs;
  }

  onFilterChange() {
    this.page = 1;
    this.loadLogs();
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  onPageSizeChange() {
    this.page = 1;
    this.loadLogs();
  }

  loadProducts() {
    
    this.productService.getProducts(1, 1000).subscribe(res => {
      this.products = res.data?.items || [];
      this.cdr.markForCheck();
    });
  }

  filterByAction(action: string) {
    this.actionFilter = action;
    this.page = 1;
    this.loadLogs();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadLogs();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadLogs();
    }
  }

  goToPage(pg: number) {
    this.page = pg;
    this.loadLogs();
  }

  getPagesArray() {
    const pages = [];
    const maxPages = Math.min(this.totalPages, 5);
    for (let i = 1; i <= maxPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  openActionModal(action: 'add' | 'sell' | 'adjust' | 'return') {
    this.actionModal = action;
    this.selectedProductId = '';
    this.selectedWarehouseId = '';
    this.quantity = action === 'adjust' ? 0 : 1;
    this.notes = '';
    this.actionError = '';
  }

  scanning = false;
  scanFeedback = '';
  qrReader: any = null;

  toggleScanner() {
    if (this.scanning) {
      this.stopScanner();
    } else {
      this.startScanner();
    }
  }

  startScanner() {
    this.scanning = true;
    this.scanFeedback = '';
    this.cdr.markForCheck();

    setTimeout(() => {
      this.qrReader = new Html5Qrcode('barcode-reader-elem');
      this.qrReader.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 }
        },
        (decodedText: string) => {
          this.scanFeedback = `Scanned: ${decodedText}`;
          this.cdr.markForCheck();

          const matched = this.products.find(p => p.barcode === decodedText || p.sku === decodedText);
          if (matched) {
            this.selectedProductId = matched.id;
            this.scanFeedback = `Found: ${matched.name}`;
            this.cdr.markForCheck();
            
            setTimeout(() => {
              this.stopScanner();
            }, 1500);
          } else {
            this.scanFeedback = `Code "${decodedText}" not matched.`;
            this.cdr.markForCheck();
          }
        },
        (errorMessage: string) => {
          // Silent
        }
      ).catch((err: any) => {
        console.error('Error starting scanner:', err);
        this.scanFeedback = 'Camera access denied or device not found.';
        this.cdr.markForCheck();
      });
    }, 100);
  }

  stopScanner() {
    if (this.qrReader) {
      this.qrReader.stop().then(() => {
        this.scanning = false;
        this.scanFeedback = '';
        this.qrReader = null;
        this.cdr.markForCheck();
      }).catch((err: any) => {
        console.error('Error stopping scanner:', err);
        this.scanning = false;
        this.scanFeedback = '';
        this.qrReader = null;
        this.cdr.markForCheck();
      });
    } else {
      this.scanning = false;
      this.scanFeedback = '';
      this.cdr.markForCheck();
    }
  }

  closeActionModal() {
    this.stopScanner();
    this.actionModal = null;
  }

  getModalTitle() {
    switch (this.actionModal) {
      case 'add': return 'INVENTORY.ADD_STOCK';
      case 'sell': return 'INVENTORY.SELL_STOCK';
      case 'adjust': return 'INVENTORY.ADJUST_STOCK';
      case 'return': return 'INVENTORY.RETURN_STOCK';
      default: return '';
    }
  }

  getQtyLabel() {
    switch (this.actionModal) {
      case 'add': return 'INVENTORY.QTY_TO_ADD';
      case 'sell': return 'INVENTORY.QTY_TO_SELL';
      case 'adjust': return 'INVENTORY.NEW_QTY';
      case 'return': return 'INVENTORY.QTY_TO_RETURN';
      default: return 'INVENTORY.QUANTITY_LABEL';
    }
  }

  submitAction() {
    if (!this.selectedProductId) return;
    
    this.isSubmitting = true;
    this.actionError = '';

    const payload = {
      productId: Number(this.selectedProductId),
      warehouseId: this.selectedWarehouseId ? Number(this.selectedWarehouseId) : null,
      quantity: this.quantity,
      notes: this.notes
    };

    let actionObs;
    switch (this.actionModal) {
      case 'add': 
        actionObs = this.inventoryService.addStock({
          productId: payload.productId, warehouseId: payload.warehouseId, quantityToAdd: payload.quantity, notes: payload.notes
        }); 
        break;
      case 'sell': 
        actionObs = this.inventoryService.sellStock({
          productId: payload.productId, warehouseId: payload.warehouseId, quantityToSell: payload.quantity, notes: payload.notes
        }); 
        break;
      case 'adjust': 
        actionObs = this.inventoryService.adjustStock({
          productId: payload.productId, warehouseId: payload.warehouseId, newQuantity: payload.quantity, notes: payload.notes
        }); 
        break;
      case 'return': 
        actionObs = this.inventoryService.returnStock({
          productId: payload.productId, warehouseId: payload.warehouseId, quantityToReturn: payload.quantity, notes: payload.notes
        }); 
        break;
    }

    if (!actionObs) return;

    actionObs.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeActionModal();
        this.sweetAlert.success('Success', 'Inventory action completed successfully');
        this.loadLogs();
        this.loadProducts(); 
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.actionError = err.error?.message || 'Operation failed. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  exportToExcel() {
    const dataToExport = this.getFilteredLogs().map(log => ({
      'ID': log.id,
      'Date': new Date(log.actionDate).toLocaleString(),
      'Product Name': log.productName,
      'Action': log.action,
      'Previous Qty': log.previousQuantity,
      'Qty Change': log.quantityChanged,
      'New Qty': log.newQuantity,
      'Performed By': log.performedBy || log.userName || '—',
      'Notes': log.notes || '—'
    }));
    this.exportExcel.export(dataToExport, 'Inventory_Logs_Report');
  }

  exportToPdf() {
    this.exportPdf.export('inventory-table', 'Inventory_Logs_Report');
  }
}
